const mongoose = require('mongoose');
const { Consultation, Visit, Patient, Doctor, Consent } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * Helper to resolve doctor document for the current user
 */
const getDoctorForUser = async (user) => {
  if (user.doctorProfile) {
    return await Doctor.findById(user.doctorProfile);
  }
  return await Doctor.findOne({ user: user._id });
};

/**
 * Create or save a consultation draft
 * Doctors create and edit their own consultation drafts.
 * Single free-text, letterhead-style clinical note (no forced separate mandatory fields).
 */
const saveConsultationDraft = async (req, res, next) => {
  try {
    const {
      consultationId,
      visitId,
      patientId,
      hospitalId,
      clinicalNote,
      prescriptions,
      noteLanguage
    } = req.body;

    const doctor = await getDoctorForUser(req.user);
    if (!doctor && req.user.role !== 'super_admin') {
      return errorResponse(res, 403, 'Only authenticated doctors can author consultation notes.');
    }

    let consultation;

    if (consultationId) {
      consultation = await Consultation.findById(consultationId);
      if (!consultation) {
        return errorResponse(res, 404, 'Consultation record not found.');
      }

      // Check author ownership
      if (doctor && String(consultation.doctor) !== String(doctor._id)) {
        return errorResponse(res, 403, 'You can only edit consultation drafts authored by yourself.');
      }

      // If already completed, cannot silently overwrite! Must use amendment endpoint
      if (consultation.status === 'completed') {
        return errorResponse(
          res,
          400,
          'This consultation has already been completed and signed. Completed clinical notes cannot be silently overwritten. Please submit an amendment.'
        );
      }

      // Update draft
      if (clinicalNote !== undefined) consultation.clinicalNote = clinicalNote;
      if (prescriptions !== undefined) consultation.prescriptions = prescriptions;
      if (noteLanguage !== undefined) consultation.noteLanguage = noteLanguage;
      await consultation.save();
    } else {
      // Create new draft
      if (!visitId || !patientId) {
        return errorResponse(res, 400, 'Visit ID and Patient ID are required to create a consultation.');
      }

      const visit = await Visit.findById(visitId);
      if (!visit) {
        return errorResponse(res, 404, 'Visit not found.');
      }

      if (doctor) {
        const isAssigned = visit.assignedDoctors.some(d => String(d._id || d) === String(doctor._id));
        if (!isAssigned) {
          return errorResponse(res, 403, 'You are not assigned to this visit.');
        }
      }

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return errorResponse(res, 404, 'Patient not found.');
      }

      const targetHospitalId = hospitalId || visit.hospital || req.activeHospital?._id;

      consultation = await Consultation.create({
        visit: visit._id,
        patient: patient._id,
        hospital: targetHospitalId,
        doctor: doctor._id,
        clinicalNote: clinicalNote || '',
        noteLanguage: noteLanguage || 'en',
        status: 'draft',
        prescriptions: prescriptions || []
      });

      // Update visit status to in_consultation
      if (visit.status === 'in_queue' || visit.status === 'checked_in') {
        visit.status = 'in_consultation';
        await visit.save();
      }
    }

    await logAudit({
      req,
      hospital: consultation.hospital,
      patient: consultation.patient,
      action: 'CONSULTATION_DRAFT_SAVED',
      resourceType: 'consultation',
      resourceId: consultation._id,
      details: `Doctor ${doctor ? doctor.name : req.user.email} saved consultation draft ${consultation._id}`
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('doctor', 'name specialty')
      .populate('hospital', 'name hospitalCode');

    return successResponse(res, 200, 'Consultation draft saved successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Complete and finalize consultation
 * Once completed, the original note is locked from direct overwriting.
 */
const completeConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { clinicalNote, prescriptions, noteLanguage } = req.body;

    const doctor = await getDoctorForUser(req.user);
    const consultation = await Consultation.findById(id);

    if (!consultation) {
      return errorResponse(res, 404, 'Consultation record not found.');
    }

    if (doctor && String(consultation.doctor) !== String(doctor._id)) {
      return errorResponse(res, 403, 'Only the authoring doctor can complete this consultation.');
    }

    if (consultation.status === 'completed') {
      return errorResponse(res, 400, 'Consultation has already been finalized and signed.');
    }

    // Set content and mark completed
    if (clinicalNote !== undefined) consultation.clinicalNote = clinicalNote;
    if (prescriptions !== undefined) consultation.prescriptions = prescriptions;
    if (noteLanguage !== undefined) consultation.noteLanguage = noteLanguage;

    consultation.status = 'completed';
    consultation.completedAt = new Date();
    await consultation.save();

    await logAudit({
      req,
      hospital: consultation.hospital,
      patient: consultation.patient,
      action: 'CONSULTATION_COMPLETED',
      resourceType: 'consultation',
      resourceId: consultation._id,
      details: `Doctor ${doctor ? doctor.name : req.user.email} finalized and signed consultation note ${consultation._id}`
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('doctor', 'name specialty')
      .populate('hospital', 'name hospitalCode')
      .populate('patient', 'name mediVaultId');

    return successResponse(res, 200, 'Consultation completed and signed successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Add an amendment to a completed consultation note
 * Strictly preserves the original note and logs author and timestamp.
 */
const addAmendment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amendmentText, reason } = req.body;

    if (!amendmentText || !amendmentText.trim()) {
      return errorResponse(res, 400, 'Amendment text is required.');
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return errorResponse(res, 404, 'Consultation not found.');
    }

    if (consultation.status !== 'completed') {
      return errorResponse(res, 400, 'Draft consultations can be edited directly. Amendments are for finalized records.');
    }

    const doctor = await getDoctorForUser(req.user);
    const authorName = doctor ? doctor.name : req.user.email;

    consultation.amendments.push({
      note: amendmentText.trim(),
      amendedBy: req.user._id,
      authorName,
      reason: reason || 'Clinical addendum / correction',
      amendedAt: new Date()
    });

    await consultation.save();

    await logAudit({
      req,
      hospital: consultation.hospital,
      patient: consultation.patient,
      action: 'CONSULTATION_AMENDED',
      resourceType: 'consultation',
      resourceId: consultation._id,
      details: `Amendment appended by ${authorName} to consultation ${consultation._id}`
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('doctor', 'name specialty')
      .populate('hospital', 'name hospitalCode')
      .populate('amendments.amendedBy', 'email');

    return successResponse(res, 200, 'Clinical amendment recorded successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Get consultation by ID
 */
const getConsultationById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return errorResponse(res, 404, 'Consultation not found.');
    }

    const consultation = await Consultation.findById(req.params.id)
      .populate('doctor', 'name specialty licenseNumber')
      .populate('hospital', 'name hospitalCode city')
      .populate('patient', 'name mediVaultId age gender bloodGroup');

    if (!consultation) {
      return errorResponse(res, 404, 'Consultation not found.');
    }

    // Role-based access authorization
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient || String(consultation.patient?._id || consultation.patient) !== String(patient._id)) {
        return errorResponse(res, 403, 'You can only access your own consultation records.');
      }
    } else if (req.user.role === 'doctor') {
      const doctor = await getDoctorForUser(req.user);
      if (!doctor) return errorResponse(res, 403, 'Doctor profile not found.');
      const isAuthor = String(consultation.doctor?._id || consultation.doctor) === String(doctor._id);
      if (!isAuthor) {
        const visit = await Visit.findById(consultation.visit);
        const isAssigned = visit && visit.assignedDoctors.some(d => String(d._id || d) === String(doctor._id));
        if (!isAssigned) {
          const consent = await Consent.findOne({
            patient: consultation.patient?._id || consultation.patient,
            requestingHospital: req.activeHospital?._id,
            status: 'approved',
            expiresAt: { $gt: new Date() }
          });
          if (!consent) {
            return errorResponse(res, 403, 'You do not have permission to view this consultation.');
          }
        }
      }
    } else if (['assistant', 'receptionist'].includes(req.user.role)) {
      const activeHospId = req.activeHospital?._id ? String(req.activeHospital._id) : null;
      const consultHospId = consultation.hospital?._id ? String(consultation.hospital._id) : String(consultation.hospital);
      if (activeHospId && consultHospId !== activeHospId) {
        return errorResponse(res, 403, 'You can only access consultation metadata for your own hospital.');
      }
    }

    // Protect clinical notes from receptionist / assistant roles
    const consultObj = consultation.toObject();
    if (['assistant', 'receptionist'].includes(req.user.role)) {
      consultObj.clinicalNote = '[Restricted to clinical medical staff]';
    }

    return successResponse(res, 200, 'Consultation retrieved', consultObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all consultations for current doctor (drafts and completed)
 */
const getDoctorConsultations = async (req, res, next) => {
  try {
    const doctor = await getDoctorForUser(req.user);
    if (!doctor && req.user.role !== 'super_admin') {
      return errorResponse(res, 403, 'Doctor profile required.');
    }

    const query = doctor ? { doctor: doctor._id } : {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const consultations = await Consultation.find(query)
      .populate('patient', 'name mediVaultId age gender vitals')
      .populate('hospital', 'name hospitalCode')
      .sort({ updatedAt: -1 });

    return successResponse(res, 200, 'Doctor consultations retrieved', consultations);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveConsultationDraft,
  completeConsultation,
  addAmendment,
  getConsultationById,
  getDoctorConsultations
};
