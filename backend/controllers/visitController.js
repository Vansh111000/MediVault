const { Visit, Patient, Hospital, Doctor, Consultation, Consent } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * Create a new hospital visit (check-in)
 * Can have multiple visits per day, even across different hospitals.
 */
const createVisit = async (req, res, next) => {
  try {
    const {
      patientId,
      hospitalId,
      assignedDoctorIds,
      doctorId, // single doctor shorthand
      reasonForVisit,
      reportedSymptoms,
      preliminaryVitals,
      priority
    } = req.body;

    if (!patientId) {
      return errorResponse(res, 400, 'Patient ID is required.');
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return errorResponse(res, 404, 'Patient not found.');
    }

    const targetHospitalId = hospitalId || req.activeHospital?._id;
    if (!targetHospitalId) {
      return errorResponse(res, 400, 'Hospital ID is required.');
    }

    const hospital = await Hospital.findById(targetHospitalId);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    // Collect assigned doctors
    let doctorsList = [];
    if (Array.isArray(assignedDoctorIds) && assignedDoctorIds.length > 0) {
      doctorsList = assignedDoctorIds;
    } else if (doctorId) {
      doctorsList = [doctorId];
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
      assignedDoctors: doctorsList,
      tokenNumber,
      priority: visitPriority,
      status: 'in_queue',
      createdBy: req.user._id
    });

    // Update patient vitals if provided
    if (preliminaryVitals && Object.keys(preliminaryVitals).length > 0) {
      patient.vitals = { ...patient.vitals, ...preliminaryVitals };
      await patient.save();
    }

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
 * List visits with filters
 */
const getVisits = async (req, res, next) => {
  try {
    const { hospitalId, patientId, status, date } = req.query;
    const query = {};

    if (hospitalId) {
      query.hospital = hospitalId;
    } else if (req.activeHospital && ['doctor', 'assistant', 'receptionist'].includes(req.user.role)) {
      query.hospital = req.activeHospital._id;
    }

    if (patientId) {
      query.patient = patientId;
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (patient) {
        query.patient = patient._id;
      }
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
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
 * Get visit by ID, including all consultations belonging to this visit
 */
const getVisitById = async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id)
      .populate('patient')
      .populate('hospital', 'name hospitalCode city')
      .populate('assignedDoctors', 'name specialty');

    if (!visit) {
      return errorResponse(res, 404, 'Visit not found.');
    }

    const consultations = await Consultation.find({ visit: visit._id })
      .populate('doctor', 'name specialty')
      .populate('hospital', 'name hospitalCode');

    return successResponse(res, 200, 'Visit details retrieved', {
      visit,
      consultations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update visit status (e.g. in_consultation, completed, cancelled)
 */
const updateVisitStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return errorResponse(res, 404, 'Visit not found.');
    }

    visit.status = status;
    if (status === 'completed') {
      visit.dischargeTime = new Date();

      // Automatically expire any temporary visit consent for this patient at this hospital
      await Consent.updateMany(
        {
          patient: visit.patient,
          requestingHospital: visit.hospital,
          status: 'approved'
        },
        {
          $set: { status: 'expired', expiresAt: new Date() }
        }
      );
    }

    await visit.save();

    await logAudit({
      req,
      hospital: visit.hospital,
      patient: visit.patient,
      action: 'VISIT_STATUS_UPDATED',
      resourceType: 'visit',
      resourceId: visit._id,
      details: `Visit status updated to ${status}`
    });

    return successResponse(res, 200, `Visit status updated to ${status}`, visit);
  } catch (error) {
    next(error);
  }
};

/**
 * Assign an additional doctor to a visit
 */
const assignDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const visit = await Visit.findById(req.params.id);

    if (!visit) {
      return errorResponse(res, 404, 'Visit not found.');
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return errorResponse(res, 404, 'Doctor not found.');
    }

    if (!visit.assignedDoctors.some(d => String(d) === String(doctorId))) {
      visit.assignedDoctors.push(doctorId);
      await visit.save();
    }

    await logAudit({
      req,
      hospital: visit.hospital,
      patient: visit.patient,
      action: 'DOCTOR_ASSIGNED_TO_VISIT',
      resourceType: 'visit',
      resourceId: visit._id,
      details: `Assigned Dr. ${doctor.name} to visit ${visit._id}`
    });

    return successResponse(res, 200, `Doctor ${doctor.name} assigned to visit`, visit);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createVisit,
  getVisits,
  getVisitById,
  updateVisitStatus,
  assignDoctor
};
