const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Patient, Doctor, Assistant, Hospital, HospitalMembership } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { hashActivationCode } = require('../utils/generateId');
const { logAudit } = require('../utils/auditLogger');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const signToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '7d'
  });
};

/**
 * Login endpoint
 * Accepts email (or mediVaultId) and password
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password.');
    }

    let searchEmail = email.trim().toLowerCase();

    // If identifier is a MediVault ID (e.g. MV-12345), find corresponding patient's user
    if (searchEmail.toUpperCase().startsWith('MV-')) {
      const patient = await Patient.findOne({ mediVaultId: searchEmail.toUpperCase() });
      if (patient && patient.user) {
        const u = await User.findById(patient.user);
        if (u) {
          searchEmail = u.email;
        }
      }
    }

    const user = await User.findOne({ email: searchEmail })
      .populate('patientProfile')
      .populate('doctorProfile')
      .populate('assistantProfile');

    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials.');
    }

    if (user.status !== 'active') {
      return errorResponse(res, 403, 'Account is inactive or suspended. Contact administrator.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid credentials.');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id, user.role);

    // Fetch hospital memberships for staff
    let memberships = [];
    if (['doctor', 'assistant', 'receptionist', 'hospital_admin'].includes(user.role)) {
      memberships = await HospitalMembership.find({
        user: user._id,
        status: 'active'
      }).populate('hospital');
    }

    await logAudit({
      req,
      actor: user._id,
      actorName: user.email,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resourceType: 'user',
      resourceId: user._id,
      details: `User signed in successfully with role ${user.role}`
    });

    const userObj = user.toObject();
    delete userObj.passwordHash;

    if (['assistant', 'receptionist'].includes(user.role)) {
      if (!userObj.assistantProfile || !userObj.assistantProfile.name) {
        const asst = await Assistant.findOne({ user: user._id });
        if (asst) {
          userObj.assistantProfile = asst.toObject();
          if (!user.assistantProfile) {
            user.assistantProfile = asst._id;
            await user.save();
          }
        }
      }
    }

    const activeHospital = memberships.length > 0 ? memberships[0].hospital : null;

    return successResponse(res, 200, 'Login successful', {
      token,
      user: userObj,
      memberships,
      activeHospital
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user session
 */
const getMe = async (req, res, next) => {
  try {
    const userObj = req.user.toObject();
    delete userObj.passwordHash;

    if (['assistant', 'receptionist'].includes(req.user.role)) {
      if (!userObj.assistantProfile || !userObj.assistantProfile.name) {
        const asst = await Assistant.findOne({ user: req.user._id });
        if (asst) userObj.assistantProfile = asst.toObject();
      }
    }

    return successResponse(res, 200, 'Current user retrieved', {
      user: userObj,
      memberships: req.memberships || [],
      activeHospital: req.activeHospital || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Staff Registration (Doctor, Assistant, Receptionist, Hospital Admin)
 * Patients CANNOT self-register via this endpoint.
 */
const registerStaff = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      hospitalId,
      specialty,
      licenseNumber,
      employeeId,
      phone
    } = req.body;

    if (!email || !password || !name || !role) {
      return errorResponse(res, 400, 'Name, email, password, and role are required.');
    }

    // Strict validation: patients cannot self-register
    if (role === 'patient') {
      return errorResponse(
        res,
        403,
        'Patient self-registration is disabled. Patients must be registered by authorized hospital staff and activate their account.'
      );
    }

    if (!['doctor', 'assistant', 'receptionist', 'hospital_admin'].includes(role)) {
      return errorResponse(res, 400, `Invalid staff role '${role}'.`);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email address already exists.');
    }

    // Validate hospital
    let hospitalDoc = null;
    if (hospitalId) {
      hospitalDoc = await Hospital.findById(hospitalId);
      if (!hospitalDoc) {
        hospitalDoc = await Hospital.findOne({ hospitalCode: hospitalId });
      }
    }

    if (!hospitalDoc) {
      // Pick first active hospital if none specified
      hospitalDoc = await Hospital.findOne({ status: 'active' });
    }

    if (!hospitalDoc) {
      return errorResponse(res, 400, 'No active hospital found to attach staff membership.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      status: 'active'
    });

    // Create staff profile
    if (role === 'doctor') {
      const doctorProfile = await Doctor.create({
        user: newUser._id,
        name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
        specialty: specialty || 'General Medicine',
        licenseNumber: licenseNumber || `MED-${Math.floor(10000 + Math.random() * 90000)}`,
        phone: phone || '',
        email: email.toLowerCase().trim()
      });
      newUser.doctorProfile = doctorProfile._id;
      await newUser.save();
    } else {
      const assistantProfile = await Assistant.create({
        user: newUser._id,
        name,
        staffType: role === 'receptionist' ? 'receptionist' : 'assistant',
        employeeId: employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: phone || '',
        email: email.toLowerCase().trim()
      });
      newUser.assistantProfile = assistantProfile._id;
      await newUser.save();
    }

    // Create hospital membership
    const membership = await HospitalMembership.create({
      user: newUser._id,
      hospital: hospitalDoc._id,
      role,
      status: 'active'
    });

    await logAudit({
      req,
      actor: newUser._id,
      actorName: name,
      actorRole: role,
      hospital: hospitalDoc._id,
      hospitalName: hospitalDoc.name,
      action: 'STAFF_REGISTERED',
      resourceType: 'user',
      resourceId: newUser._id,
      details: `New ${role} registered and linked to hospital ${hospitalDoc.name}`
    });

    const token = signToken(newUser._id, newUser.role);
    const userObj = newUser.toObject();
    delete userObj.passwordHash;
    if (role === 'doctor') {
      userObj.doctorProfile = doctorProfile.toObject();
    } else {
      userObj.assistantProfile = assistantProfile.toObject();
    }

    return successResponse(res, 201, 'Staff account registered successfully', {
      token,
      user: userObj,
      hospital: hospitalDoc,
      membership
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Claim and activate a patient identity created by an assistant
 * Requires mediVaultId AND activationCode
 */
const claimPatientAccount = async (req, res, next) => {
  try {
    const { mediVaultId, activationCode, password, email } = req.body;

    if (!mediVaultId || !activationCode || !password) {
      return errorResponse(res, 400, 'MediVault ID, activation code, and password are required.');
    }

    const patient = await Patient.findOne({ mediVaultId: mediVaultId.toUpperCase().trim() });
    if (!patient) {
      return errorResponse(res, 404, 'No patient identity found with this MediVault ID.');
    }

    if (patient.isClaimed || patient.user) {
      return errorResponse(res, 400, 'This MediVault account is already activated. Please log in directly.');
    }

    // Verify activation code hash and expiry
    const hashedAttempt = hashActivationCode(activationCode.trim());
    if (patient.activationCodeHash !== hashedAttempt) {
      return errorResponse(res, 400, 'Invalid activation code. Please check your verification slip or request a new code.');
    }

    if (patient.activationExpiresAt && patient.activationExpiresAt < new Date()) {
      return errorResponse(res, 400, 'Activation code has expired. Please ask hospital desk to re-issue an activation code.');
    }

    const patientEmail = (email || patient.email || `${patient.mediVaultId.toLowerCase()}@medivault.io`).toLowerCase().trim();

    // Check if email already used
    const existingUser = await User.findOne({ email: patientEmail });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email already exists. Please choose a different email.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email: patientEmail,
      passwordHash,
      role: 'patient',
      status: 'active',
      patientProfile: patient._id
    });

    patient.isClaimed = true;
    patient.user = newUser._id;
    patient.email = patientEmail;
    patient.activationCodeHash = undefined;
    patient.activationExpiresAt = undefined;
    await patient.save();

    await logAudit({
      req,
      actor: newUser._id,
      actorName: patient.name,
      actorRole: 'patient',
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'PATIENT_ACCOUNT_ACTIVATED',
      resourceType: 'patient',
      resourceId: patient._id,
      details: `Patient activated permanent MediVault account for ID ${patient.mediVaultId}`
    });

    const token = signToken(newUser._id, newUser.role);
    const userObj = newUser.toObject();
    delete userObj.passwordHash;
    if (role === 'doctor') {
      userObj.doctorProfile = doctorProfile.toObject();
    } else {
      userObj.assistantProfile = assistantProfile.toObject();
    }

    return successResponse(res, 200, 'Patient account activated successfully! You are now logged in.', {
      token,
      user: userObj,
      patient
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getMe,
  registerStaff,
  claimPatientAccount
};
