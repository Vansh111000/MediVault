const { HospitalPatient, Patient, Hospital } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * Get current hospital's patient directory
 * The assistant dashboard displays ONLY patients associated with the active hospital.
 */
const getHospitalPatients = async (req, res, next) => {
  try {
    const isStaff = ['assistant', 'receptionist', 'doctor', 'hospital_admin'].includes(req.user?.role);
    const hospitalId = (isStaff && req.activeHospital?._id)
      ? req.activeHospital._id
      : (req.activeHospital?._id || req.headers['x-hospital-id'] || req.query.hospitalId);

    if (!hospitalId) {
      return errorResponse(res, 400, 'Hospital identifier is required to view directory.');
    }

    const { q, status } = req.query;

    const query = { hospital: hospitalId };
    if (status) {
      query.status = status;
    }

    let directoryEntries = await HospitalPatient.find(query)
      .populate('patient', 'mediVaultId name age gender bloodGroup phone email vitals allergies chronicConditions isClaimed')
      .populate('addedBy', 'email role')
      .sort({ updatedAt: -1 });

    // In-memory filter if search query provided
    if (q && q.trim()) {
      const term = q.trim().toLowerCase();
      directoryEntries = directoryEntries.filter(entry => {
        const p = entry.patient;
        if (!p) return false;
        return (
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.mediVaultId && p.mediVaultId.toLowerCase().includes(term)) ||
          (p.phone && p.phone.includes(term)) ||
          (p.email && p.email.toLowerCase().includes(term))
        );
      });
    }

    return successResponse(res, 200, 'Hospital patient directory retrieved', directoryEntries);
  } catch (error) {
    next(error);
  }
};

/**
 * Exact MediVault ID lookup
 * Used when an existing patient visits another hospital.
 * Returns ONLY minimum identifying information needed to confirm identity.
 * Assistants cannot browse the entire global patient registry.
 */
const lookupPatientByExactMediVaultId = async (req, res, next) => {
  try {
    const mediVaultId = (req.query.mediVaultId || req.params.mediVaultId || '').trim().toUpperCase();

    if (!mediVaultId) {
      return errorResponse(res, 400, 'Exact MediVault ID is required.');
    }

    const patient = await Patient.findOne({ mediVaultId });

    if (!patient) {
      return errorResponse(res, 404, `No patient found with MediVault ID '${mediVaultId}'.`);
    }

    // Return minimum identifying information ONLY
    // Do not reveal previous hospitals' clinical records
    const minimalInfo = {
      _id: patient._id,
      mediVaultId: patient.mediVaultId,
      name: patient.name,
      gender: patient.gender,
      age: patient.age,
      bloodGroup: patient.bloodGroup,
      isClaimed: patient.isClaimed
    };

    // Check if already in current hospital's directory
    const isStaff = ['assistant', 'receptionist', 'doctor', 'hospital_admin'].includes(req.user?.role);
    const hospitalId = (isStaff && req.activeHospital?._id)
      ? req.activeHospital._id
      : (req.activeHospital?._id || req.headers['x-hospital-id']);
    let alreadyInDirectory = false;
    if (hospitalId) {
      const existing = await HospitalPatient.findOne({
        hospital: hospitalId,
        patient: patient._id
      });
      alreadyInDirectory = !!existing;
    }

    await logAudit({
      req,
      hospital: hospitalId,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_EXACT_LOOKUP',
      resourceType: 'patient',
      resourceId: patient._id,
      details: `Assistant performed exact lookup for MediVault ID ${patient.mediVaultId}`
    });

    return successResponse(res, 200, 'Patient identity verified by exact MediVault ID', {
      patient: minimalInfo,
      alreadyInDirectory
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add an existing patient to current hospital directory
 * Connects global patient identity to this hospital.
 * Prevents duplicates via unique compound index (hospital + patient).
 * Does not create a second global patient record.
 * Does not generate another activation code.
 * Does not reveal previous hospitals' clinical records.
 */
const addPatientToHospitalDirectory = async (req, res, next) => {
  try {
    const { patientId, mediVaultId, operationalNotes } = req.body;
    const isStaff = ['assistant', 'receptionist', 'doctor', 'hospital_admin'].includes(req.user?.role);
    const hospitalId = (isStaff && req.activeHospital?._id)
      ? req.activeHospital._id
      : (req.body.hospitalId || req.activeHospital?._id || req.headers['x-hospital-id']);

    if (!hospitalId) {
      return errorResponse(res, 400, 'Hospital identifier is required.');
    }

    let patient;
    if (patientId) {
      patient = await Patient.findById(patientId);
    } else if (mediVaultId) {
      patient = await Patient.findOne({ mediVaultId: mediVaultId.trim().toUpperCase() });
    }

    if (!patient) {
      return errorResponse(res, 404, 'Patient record not found in global registry.');
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    // Check for existing relationship
    const existing = await HospitalPatient.findOne({
      hospital: hospital._id,
      patient: patient._id
    });

    if (existing) {
      existing.status = 'active';
      if (operationalNotes) existing.operationalNotes = operationalNotes;
      await existing.save();

      const populatedExisting = await HospitalPatient.findById(existing._id)
        .populate('patient', 'mediVaultId name age gender bloodGroup phone email vitals')
        .populate('hospital', 'name hospitalCode city');

      return successResponse(res, 200, 'Patient already exists in hospital directory', populatedExisting);
    }

    const newDirectoryEntry = await HospitalPatient.create({
      hospital: hospital._id,
      patient: patient._id,
      addedBy: req.user?._id,
      status: 'active',
      dateAdded: new Date(),
      operationalNotes: operationalNotes || ''
    });

    await logAudit({
      req,
      hospital: hospital._id,
      hospitalName: hospital.name,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_ADDED_TO_HOSPITAL_DIRECTORY',
      resourceType: 'hospitalPatient',
      resourceId: newDirectoryEntry._id,
      details: `Added patient ${patient.name} (${patient.mediVaultId}) to ${hospital.name} patient directory`
    });

    const populatedEntry = await HospitalPatient.findById(newDirectoryEntry._id)
      .populate('patient', 'mediVaultId name age gender bloodGroup phone email vitals')
      .populate('hospital', 'name hospitalCode city');

    return successResponse(res, 201, `Patient ${patient.name} added to hospital directory`, populatedEntry);
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 409, 'Patient already exists in this hospital directory.');
    }
    next(error);
  }
};

module.exports = {
  getHospitalPatients,
  lookupPatientByExactMediVaultId,
  addPatientToHospitalDirectory
};
