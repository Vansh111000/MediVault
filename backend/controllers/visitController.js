const mongoose = require('mongoose');
const { Visit, Patient, Hospital, Doctor, Consultation, Consent, HospitalPatient, HospitalMembership, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * Validate that a list of doctor IDs all pass every security check:
 *   1. Doctor profile exists and is active.
 *   2. The linked User account is active.
 *   3. The linked User role is exactly "doctor".
 *   4. The doctor has an active HospitalMembership at the given hospital.
 *
 * Rejects the entire assignment if ANY doctor fails ANY check.
 */
async function validateDoctorsForHospital(doctorIds, hospitalId) {
  if (!doctorIds || doctorIds.length === 0) return { valid: true, doctors: [] };

  const uniqueIds = [...new Set(doctorIds.map(id => String(id).trim()))];
  const validObjectIds = uniqueIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  if (validObjectIds.length !== uniqueIds.length) {
    return { valid: false, message: 'One or more doctor IDs are invalid.' };
  }

  // Step 1: fetch doctor profiles
  const doctors = await Doctor.find({ _id: { $in: uniqueIds } });

  if (doctors.length !== uniqueIds.length) {
    const foundIds = new Set(doctors.map(d => String(d._id)));
    const missing = uniqueIds.filter(id => !foundIds.has(String(id)));
    return { valid: false, message: `Doctor profile not found for ID(s): ${missing.join(', ')}` };
  }

  for (const doctor of doctors) {
    // Step 2: doctor profile must be active
    if (doctor.status !== 'active') {
      return { valid: false, message: `Dr. ${doctor.name}'s profile is not active. Inactive doctors cannot be assigned.` };
    }

    // Step 3: fetch linked User account
    const userAccount = await User.findById(doctor.user).select('role status');
    if (!userAccount) {
      return { valid: false, message: `User account not found for Dr. ${doctor.name}.` };
    }

    // Step 4: user account must be active
    if (userAccount.status !== 'active') {
      return { valid: false, message: `The user account for Dr. ${doctor.name} is not active.` };
    }

    // Step 5: user role must be exactly "doctor"
    if (userAccount.role !== 'doctor') {
      return { valid: false, message: `The account for Dr. ${doctor.name} does not have the doctor role.` };
    }

    // Step 6: active HospitalMembership at this hospital
    const membership = await HospitalMembership.findOne({
      user: doctor.user,
      hospital: hospitalId,
      role: 'doctor',
      status: 'active'
    });
    if (!membership) {
      return {
        valid: false,
        message: `Dr. ${doctor.name} does not have an active membership at this hospital. Cross-hospital assignments are not allowed.`
      };
    }
  }

  return { valid: true, doctors };
}

/**
 * Helper: resolve authenticated doctor profile from req.user
 */
async function resolveDoctor(user) {
  if (user.doctorProfile) {
    const doc = await Doctor.findById(user.doctorProfile);
    if (doc) return doc;
  }
  return Doctor.findOne({ user: user._id });
}

/**
 * Create a new hospital visit (check-in).
 * SECURITY: Hospital derived entirely from authenticated membership.
 */
const createVisit = async (req, res, next) => {
  try {
    const { patientId, assignedDoctorIds, doctorId, reasonForVisit, reportedSymptoms, preliminaryVitals, priority } = req.body;

    if (!patientId) return errorResponse(res, 400, 'Patient ID is required.');

    const targetHospitalId = req.activeHospital ? req.activeHospital._id : null;
    if (!targetHospitalId) {
      return errorResponse(res, 403, 'No active hospital membership found. You must belong to a hospital to create visits.');
    }

    const [patient, hospital] = await Promise.all([
      Patient.findById(patientId),
      Hospital.findById(targetHospitalId)
    ]);

    if (!patient) return errorResponse(res, 404, 'Patient not found.');
    if (!hospital) return errorResponse(res, 404, 'Hospital not found.');

    let doctorIds = [];
    if (Array.isArray(assignedDoctorIds) && assignedDoctorIds.length > 0) {
      doctorIds = assignedDoctorIds;
    } else if (doctorId) {
      doctorIds = [doctorId];
    }

    // SECURITY: Full validation for every doctor
    if (doctorIds.length > 0) {
      const validation = await validateDoctorsForHospital(doctorIds, targetHospitalId);
      if (!validation.valid) return errorResponse(res, 403, validation.message);
    }

    const visitPriority = priority || 'Routine';
    const tokenPrefix = visitPriority === 'Emergency' ? 'E' : visitPriority === 'Urgent' ? 'U' : 'R';
    const tokenNumber = `${tokenPrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const visit = await Visit.create({
      patient: patient._id,
      hospital: hospital._id,
      checkInTime: new Date(),
      reasonForVisit: reasonForVisit || 'General Consultation',
      reportedSymptoms: reportedSymptoms || '',
      preliminaryVitals: preliminaryVitals || patient.vitals || {},
      assignedDoctors: doctorIds,
      tokenNumber,
      priority: visitPriority,
      status: 'in_queue',
      createdBy: req.user._id
    });

    if (preliminaryVitals && Object.keys(preliminaryVitals).length > 0) {
      patient.vitals = Object.assign({}, patient.vitals, preliminaryVitals);
      await patient.save();
    }

    await HospitalPatient.findOneAndUpdate(
      { hospital: hospital._id, patient: patient._id },
      {
        $set: { lastVisitAt: new Date(), status: 'active' },
        $setOnInsert: { addedBy: req.user._id, dateAdded: new Date() }
      },
      { upsert: true, new: true }
    );

    await logAudit({
      req,
      hospital: hospital._id,
      hospitalName: hospital.name,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'VISIT_CREATED',
      resourceType: 'visit',
      resourceId: visit._id,
      details: `Checked in patient ${patient.name} with Token ${tokenNumber} (${visitPriority})`
    });

    const populatedVisit = await Visit.findById(visit._id)
      .populate('patient', 'name mediVaultId age gender phone vitals bloodGroup')
      .populate('hospital', 'name hospitalCode city')
      .populate('assignedDoctors', 'name specialty');

    return successResponse(res, 201, `Patient checked in with Token ${tokenNumber}`, populatedVisit);
  } catch (error) {
    next(error);
  }
};

/**
 * List visits.
 * SECURITY:
 *  - Doctors: only visits assigned to THEIR authenticated doctor profile.
 *  - Assistants/Receptionists: visits at their active hospital (for operational management).
 *  - Patients: only their own visits.
 */
const getVisits = async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'doctor') {
      // SECURITY: Doctor sees ONLY their own assigned visits
      const doctor = await resolveDoctor(req.user);
      if (!doctor) {
        return errorResponse(res, 403, 'Doctor profile not found for this account.');
      }
      query.assignedDoctors = doctor._id;
      // Also scope to active hospital if available
      if (req.activeHospital && req.activeHospital._id) {
        query.hospital = req.activeHospital._id;
      }
    } else if (['assistant', 'receptionist'].includes(req.user.role)) {
      // Assistants see all visits at their hospital for operational management
      if (req.activeHospital && req.activeHospital._id) {
        query.hospital = req.activeHospital._id;
      } else {
        return errorResponse(res, 403, 'No active hospital membership found.');
      }
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
      } else {
        return successResponse(res, 200, 'Visits retrieved', []);
      }
    }

    if (req.query.patientId && req.user.role !== 'patient') {
      query.patient = req.query.patientId;
    }

    if (req.query.status) query.status = req.query.status;

    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      query.checkInTime = { $gte: start, $lte: end };
    }

    const visits = await Visit.find(query)
      .populate('patient', 'name mediVaultId age gender phone vitals bloodGroup')
      .populate('hospital', 'name hospitalCode city')
      .populate('assignedDoctors', 'name specialty')
      .sort({ checkInTime: -1 });

    return successResponse(res, 200, 'Visits retrieved', visits);
  } catch (error) {
    next(error);
  }
};

/**
 * Get visit by ID, with consultations.
 * SECURITY: Doctors must be assigned to the visit to access it.
 */
const getVisitById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return errorResponse(res, 404, 'Visit not found.');
    }

    const visit = await Visit.findById(req.params.id)
      .populate('patient')
      .populate('hospital', 'name hospitalCode city')
      .populate('assignedDoctors', 'name specialty');

    if (!visit) return errorResponse(res, 404, 'Visit not found.');

    if (req.user.role === 'doctor') {
      const doctor = await resolveDoctor(req.user);
      if (!doctor) return errorResponse(res, 403, 'Doctor profile not found.');
      // Doctor must be assigned to this visit
      const isAssigned = visit.assignedDoctors.some(d => String(d._id || d) === String(doctor._id));
      if (!isAssigned) {
        return errorResponse(res, 403, 'You are not assigned to this visit.');
      }
    } else if (['assistant', 'receptionist'].includes(req.user.role)) {
      if (!req.activeHospital || !req.activeHospital._id) {
        return errorResponse(res, 403, 'No active hospital membership found.');
      }
      const visitHospitalId = visit.hospital._id ? String(visit.hospital._id) : String(visit.hospital);
      if (visitHospitalId !== String(req.activeHospital._id)) {
        return errorResponse(res, 403, 'This visit does not belong to your active hospital.');
      }
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient || String(visit.patient._id || visit.patient) !== String(patient._id)) {
        return errorResponse(res, 403, 'You can only access your own visit records.');
      }
    }

    const consultations = await Consultation.find({ visit: visit._id })
      .populate('doctor', 'name specialty')
      .populate('hospital', 'name hospitalCode');

    return successResponse(res, 200, 'Visit details retrieved', { visit, consultations });
  } catch (error) {
    next(error);
  }
};

/**
 * Update visit status.
 */
const updateVisitStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const visit = await Visit.findById(req.params.id);
    if (!visit) return errorResponse(res, 404, 'Visit not found.');

    if (req.activeHospital && req.activeHospital._id && String(visit.hospital) !== String(req.activeHospital._id)) {
      return errorResponse(res, 403, 'This visit does not belong to your active hospital.');
    }

    visit.status = status;
    if (status === 'completed') {
      visit.dischargeTime = new Date();
      await Consent.updateMany(
        { patient: visit.patient, requestingHospital: visit.hospital, status: 'approved' },
        { $set: { status: 'expired', expiresAt: new Date() } }
      );
    }

    await visit.save();
    await logAudit({ req, hospital: visit.hospital, patient: visit.patient, action: 'VISIT_STATUS_UPDATED', resourceType: 'visit', resourceId: visit._id, details: `Visit status updated to ${status}` });

    return successResponse(res, 200, `Visit status updated to ${status}`, visit);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign an additional doctor to a visit.
 * SECURITY: Full validation – doctor must be active member of the same hospital.
 */
const assignDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return errorResponse(res, 400, 'Doctor ID is required.');

    const visit = await Visit.findById(req.params.id);
    if (!visit) return errorResponse(res, 404, 'Visit not found.');

    const activeHospitalId = req.activeHospital ? req.activeHospital._id : null;
    if (!activeHospitalId) return errorResponse(res, 403, 'No active hospital membership found.');

    if (String(visit.hospital) !== String(activeHospitalId)) {
      return errorResponse(res, 403, 'This visit does not belong to your active hospital.');
    }

    // Full validation including user account check
    const validation = await validateDoctorsForHospital([doctorId], activeHospitalId);
    if (!validation.valid) return errorResponse(res, 403, validation.message);

    const doctor = validation.doctors[0];

    if (!visit.assignedDoctors.some(d => String(d) === String(doctorId))) {
      visit.assignedDoctors.push(doctorId);
      await visit.save();
    }

    await logAudit({ req, hospital: visit.hospital, patient: visit.patient, action: 'DOCTOR_ASSIGNED_TO_VISIT', resourceType: 'visit', resourceId: visit._id, details: `Assigned Dr. ${doctor.name} to visit ${visit._id}` });

    const populated = await Visit.findById(visit._id)
      .populate('patient', 'name mediVaultId age gender phone vitals bloodGroup')
      .populate('hospital', 'name hospitalCode city')
      .populate('assignedDoctors', 'name specialty');

    return successResponse(res, 200, `Doctor ${doctor.name} assigned to visit`, populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an assigned doctor from a visit only when no clinical notes exist.
 */
const removeDoctorAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const doctorId = req.params.doctorId || req.body.doctorId;
    if (!doctorId) return errorResponse(res, 400, 'Doctor ID is required.');

    const visit = await Visit.findById(id);
    if (!visit) return errorResponse(res, 404, 'Visit not found.');

    const activeHospitalId = req.activeHospital ? req.activeHospital._id : null;
    if (activeHospitalId && String(visit.hospital) !== String(activeHospitalId)) {
      return errorResponse(res, 403, 'This visit does not belong to your active hospital.');
    }

    const existingConsultation = await Consultation.findOne({ visit: visit._id, doctor: doctorId });
    if (existingConsultation) {
      if (existingConsultation.status === 'completed' || (existingConsultation.clinicalNote && existingConsultation.clinicalNote.trim())) {
        return errorResponse(res, 400, 'Cannot remove doctor assignment: clinical notes have been documented for this encounter. Clinical notes must be permanently preserved.');
      }
      await Consultation.findByIdAndDelete(existingConsultation._id);
    }

    visit.assignedDoctors = visit.assignedDoctors.filter(d => String(d) !== String(doctorId));
    await visit.save();

    await logAudit({ req, hospital: visit.hospital, patient: visit.patient, action: 'DOCTOR_REMOVED_FROM_VISIT', resourceType: 'visit', resourceId: visit._id, details: `Removed doctor ${doctorId} from visit ${visit._id} (safe correction)` });

    const populated = await Visit.findById(visit._id)
      .populate('patient', 'name mediVaultId age gender phone vitals bloodGroup')
      .populate('hospital', 'name hospitalCode city')
      .populate('assignedDoctors', 'name specialty');

    return successResponse(res, 200, 'Doctor assignment removed safely', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = { createVisit, getVisits, getVisitById, updateVisitStatus, assignDoctor, removeDoctorAssignment };
