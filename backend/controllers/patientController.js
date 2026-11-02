const mongoose = require('mongoose');
const { Patient, Visit, Consultation, Consent, HospitalPatient, Hospital } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { generateMediVaultId, generateActivationCode, hashActivationCode } = require('../utils/generateId');
const { logAudit } = require('../utils/auditLogger');
const { verifyConsentAccess } = require('../utils/consentVerifier');

/**
 * Search patients by MediVault ID, phone, email, or name
 * Assistants are restricted to their own hospital's directory unless searching by exact MediVault ID.
 */
const searchPatients = async (req, res, next) => {
  try {
    const { q, mediVaultId, phone, name } = req.query;

    const query = {};

    if (mediVaultId) {
      query.mediVaultId = mediVaultId.toUpperCase().trim();
    } else {
      // If assistant / receptionist, scope search to current hospital directory
      if (['assistant', 'receptionist'].includes(req.user?.role)) {
        const hospitalId = req.activeHospital?._id || req.headers['x-hospital-id'] || req.query.hospitalId;
        if (hospitalId) {
          const directoryLinks = await HospitalPatient.find({ hospital: hospitalId, status: 'active' }).select('patient');
          const allowedPatientIds = directoryLinks.map(d => d.patient);
          query._id = { $in: allowedPatientIds };
        }
      }

      if (phone) {
        query.phone = phone.trim();
      } else if (q) {
        const searchTerm = q.trim();
        query.$or = [
          { mediVaultId: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
      } else if (name) {
        query.name = { $regex: name.trim(), $options: 'i' };
      }
    }

    const patients = await Patient.find(query)
      .select('-activationCodeHash')
      .populate('registeredAtHospital', 'name hospitalCode city')
      .limit(30);

    return successResponse(res, 200, 'Search results', patients);
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new permanent patient identity by an authorized hospital assistant
 * Workflow step 2 & 3:
 * Reuses existing if found, or generates a new permanent MediVault ID and initial unclaimed state.
 */
const createPatient = async (req, res, next) => {
  try {
    const {
      name,
      dob,
      age,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      allergies,
      chronicConditions,
      vitals,
      emergencyContact,
      forceNew
    } = req.body;

    if (!name || !phone) {
      return errorResponse(res, 400, 'Patient name and phone number are required.');
    }

    const cleanPhone = phone.trim();

    // Check for existing patient with this phone or email to prevent duplicates
    if (!forceNew) {
      const existingPatient = await Patient.findOne({
        $or: [
          { phone: cleanPhone },
          ...(email ? [{ email: email.toLowerCase().trim() }] : [])
        ]
      });

      if (existingPatient) {
        return errorResponse(
          res,
          409,
          `An existing patient identity was found for this phone/email (MediVault ID: ${existingPatient.mediVaultId}, Name: ${existingPatient.name}). Please reuse this permanent identity instead of creating a duplicate.`,
          { existingPatientId: existingPatient._id, mediVaultId: existingPatient.mediVaultId }
        );
      }
    }

    // Generate unique MediVault ID
    let mediVaultId;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      mediVaultId = generateMediVaultId();
      const duplicate = await Patient.findOne({ mediVaultId });
      if (!duplicate) {
        isUnique = true;
      }
      attempts++;
    }

    // Generate secure time-limited activation code (valid for 7 days)
    const rawActivationCode = generateActivationCode();
    const activationCodeHash = hashActivationCode(rawActivationCode);
    const activationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const hospitalId = req.activeHospital?._id || req.body.hospitalId || null;

    const patient = await Patient.create({
      mediVaultId,
      name: name.trim(),
      dob: dob ? new Date(dob) : undefined,
      age: age ? parseInt(age, 10) : undefined,
      gender: gender || 'Other',
      bloodGroup: bloodGroup || '',
      phone: cleanPhone,
      email: email ? email.toLowerCase().trim() : '',
      address: address ? address.trim() : '',
      allergies: Array.isArray(allergies) ? allergies : allergies ? [{ allergen: allergies }] : [],
      chronicConditions: Array.isArray(chronicConditions) ? chronicConditions : chronicConditions ? [chronicConditions] : [],
      vitals: vitals || {},
      emergencyContact: (emergencyContact && emergencyContact.name && emergencyContact.name.trim()) ? emergencyContact : undefined,
      isClaimed: false,
      activationCodeHash,
      activationExpiresAt,
      registeredBy: req.user._id,
      registeredAtHospital: hospitalId
    });

    await logAudit({
      req,
      actor: req.user._id,
      actorName: req.user.email,
      actorRole: req.user.role,
      hospital: hospitalId,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_REGISTERED',
      resourceType: 'patient',
      resourceId: patient._id,
      details: `Created new patient identity with MediVault ID ${patient.mediVaultId}. Account initially unclaimed.`
    });

    // If created at a hospital, automatically add to that hospital's local directory
    if (hospitalId) {
      await HospitalPatient.findOneAndUpdate(
        { hospital: hospitalId, patient: patient._id },
        { hospital: hospitalId, patient: patient._id, addedBy: req.user._id, status: 'active', dateAdded: new Date() },
        { upsert: true, new: true }
      );

      await logAudit({
        req,
        actor: req.user._id,
        actorName: req.user.email,
        actorRole: req.user.role,
        hospital: hospitalId,
        patient: patient._id,
        patientIdentifier: patient.mediVaultId,
        action: 'PATIENT_ADDED_TO_HOSPITAL_DIRECTORY',
        resourceType: 'hospitalPatient',
        resourceId: patient._id,
        details: `Automatically added newly registered patient ${patient.mediVaultId} to hospital directory.`
      });
    }

    const responsePatient = patient.toObject();
    delete responsePatient.activationCodeHash;

    // Return the one-time activation code so the assistant can give the slip to the patient
    return successResponse(res, 201, `Patient registered with MediVault ID ${patient.mediVaultId}`, {
      patient: responsePatient,
      activationCode: rawActivationCode,
      activationExpiresAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient profile by ID or MediVault ID
 */
const getPatient = async (req, res, next) => {
  try {
    const idOrMv = req.params.id.trim();

    let patient;
    if (idOrMv.toUpperCase().startsWith('MV-')) {
      patient = await Patient.findOne({ mediVaultId: idOrMv.toUpperCase() });
    } else if (mongoose.Types.ObjectId.isValid(idOrMv)) {
      patient = await Patient.findById(idOrMv);
    } else {
      return errorResponse(res, 404, 'Patient not found.');
    }

    if (!patient) {
      return errorResponse(res, 404, 'Patient not found.');
    }

    // Access control:
    // If patient, must be their own record
    if (req.user.role === 'patient') {
      if (!patient.user || String(patient.user) !== String(req.user._id)) {
        return errorResponse(res, 403, 'Access denied. You can only view your own patient profile.');
      }
    }

    await logAudit({
      req,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_PROFILE_ACCESSED',
      resourceType: 'patient',
      resourceId: patient._id,
      details: `Patient profile accessed for ${patient.name}`
    });

    const patientObj = patient.toObject();
    delete patientObj.activationCodeHash;

    return successResponse(res, 200, 'Patient profile retrieved', patientObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient profile details (vitals, allergies, emergency contacts)
 */
const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return errorResponse(res, 404, 'Patient not found.');
    }

    // Only allow updating non-critical personal details or authorized staff updating vitals
    const allowedUpdates = [
      'name', 'age', 'gender', 'bloodGroup', 'phone', 'email', 'address',
      'allergies', 'chronicConditions', 'vitals', 'emergencyContact'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        patient[field] = req.body[field];
      }
    });

    await patient.save();

    await logAudit({
      req,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_PROFILE_UPDATED',
      resourceType: 'patient',
      resourceId: patient._id,
      details: `Profile updated for patient ${patient.name}`
    });

    const patientObj = patient.toObject();
    delete patientObj.activationCodeHash;

    return successResponse(res, 200, 'Patient profile updated successfully', patientObj);
  } catch (error) {
    next(error);
  }
};

/**
 * Re-issue activation code for unclaimed patient
 * Only authorized assistant/receptionist at clinic desk
 */
const reissueActivationCode = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return errorResponse(res, 404, 'Patient not found.');
    }

    if (patient.isClaimed) {
      return errorResponse(res, 400, 'Account is already claimed and activated.');
    }

    const rawActivationCode = generateActivationCode();
    patient.activationCodeHash = hashActivationCode(rawActivationCode);
    patient.activationExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await patient.save();

    await logAudit({
      req,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_ACTIVATION_CODE_REISSUED',
      resourceType: 'patient',
      resourceId: patient._id,
      details: `Assistant reissued activation code for ${patient.mediVaultId}`
    });

    return successResponse(res, 200, 'New activation code generated', {
      mediVaultId: patient.mediVaultId,
      activationCode: rawActivationCode,
      activationExpiresAt: patient.activationExpiresAt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive patient medical history
 * - Assistants: strictly filtered by patientId AND active hospitalId (no cross-hospital exposure, masked notes).
 * - Doctors: cross-hospital history strictly requires active patient consent.
 * - Patients: can access their own full medical history across hospitals.
 */
const getPatientMedicalHistory = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return errorResponse(res, 404, 'Patient not found.');
    }

    const currentHospitalId = req.activeHospital?._id;
    const userRole = req.user.role;
    const userId = req.user._id;

    const isAssistant = ['assistant', 'receptionist'].includes(userRole);

    // If assistant, strictly scope visits to current hospital only
    const visitFilter = { patient: patientId };
    if (isAssistant && currentHospitalId) {
      visitFilter.hospital = currentHospitalId;
    }

    const visits = await Visit.find(visitFilter)
      .populate('hospital', 'name hospitalCode city')
      .populate('assignedDoctors', 'name specialty')
      .sort({ checkInTime: -1 });

    // Fetch consultations
    const consultFilter = { patient: patientId };
    if (isAssistant && currentHospitalId) {
      consultFilter.hospital = currentHospitalId;
    }

    const consultations = await Consultation.find(consultFilter)
      .populate('hospital', 'name hospitalCode city')
      .populate('doctor', 'name specialty')
      .sort({ createdAt: -1 });

    const sanitizedConsultations = [];

    for (const c of consultations) {
      const recordHospitalId = c.hospital?._id || c.hospital;
      const consentCheck = await verifyConsentAccess({
        patientId,
        recordHospitalId,
        currentHospitalId,
        userRole,
        userId
      });

      if (consentCheck.allowed) {
        const consultObj = c.toObject();
        if (isAssistant) {
          consultObj.clinicalNote = '[Restricted to clinical medical staff]';
        }
        sanitizedConsultations.push(consultObj);
      }
    }

    await logAudit({
      req,
      hospital: currentHospitalId,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_HISTORY_ACCESSED',
      resourceType: 'medicalHistory',
      resourceId: patient._id,
      details: `Medical history retrieved: ${sanitizedConsultations.length} consultations authorized for role ${userRole}`
    });

    return successResponse(res, 200, 'Patient medical history retrieved', {
      patient: {
        id: patient._id,
        mediVaultId: patient.mediVaultId,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        vitals: patient.vitals
      },
      visits,
      consultations: sanitizedConsultations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchPatients,
  createPatient,
  getPatient,
  updatePatient,
  reissueActivationCode,
  getPatientMedicalHistory
};
