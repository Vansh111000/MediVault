const { Consent, Patient, Hospital } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

/**
 * Request cross-hospital consent from a patient
 * Initiated by a doctor or hospital staff during a visit or referral
 */
const requestConsent = async (req, res, next) => {
  try {
    const { patientId, hospitalId, purpose, permissionScope, durationMinutes } = req.body;

    if (!patientId || !purpose) {
      return errorResponse(res, 400, 'Patient ID and purpose are required.');
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return errorResponse(res, 404, 'Patient not found.');
    }

    const targetHospitalId = hospitalId || req.activeHospital?._id;
    if (!targetHospitalId) {
      return errorResponse(res, 400, 'Requesting hospital ID is required.');
    }

    const hospital = await Hospital.findById(targetHospitalId);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    const duration = parseInt(durationMinutes, 10) || 240; // Default 4 hours

    const consent = await Consent.create({
      patient: patient._id,
      requestingHospital: hospital._id,
      requestingUser: req.user._id,
      permissionScope: permissionScope || 'read_only_visit',
      purpose: purpose.trim(),
      durationMinutes: duration,
      status: 'pending'
    });

    await logAudit({
      req,
      hospital: hospital._id,
      hospitalName: hospital.name,
      patient: patient._id,
      patientIdentifier: patient.mediVaultId,
      action: 'CONSENT_REQUESTED',
      resourceType: 'consent',
      resourceId: consent._id,
      details: `Requested ${duration}m ${permissionScope || 'read_only_visit'} access for ${patient.name}`
    });

    const populated = await Consent.findById(consent._id)
      .populate('requestingHospital', 'name hospitalCode city')
      .populate('requestingUser', 'email');

    return successResponse(res, 201, 'Consent request created and waiting for patient authorization', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * Get consents for a patient (with live expiry evaluation)
 */
const getPatientConsents = async (req, res, next) => {
  try {
    const patientId = req.params.patientId || req.query.patientId;
    let targetPatientId = patientId;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) {
        return errorResponse(res, 404, 'Patient profile not found for this account.');
      }
      targetPatientId = patient._id;
    }

    if (!targetPatientId) {
      return errorResponse(res, 400, 'Patient ID required.');
    }

    const consents = await Consent.find({ patient: targetPatientId })
      .populate('requestingHospital', 'name hospitalCode city phone')
      .populate('requestingUser', 'email')
      .sort({ createdAt: -1 });

    const now = new Date();
    // Auto-transition expired consents
    for (const c of consents) {
      if (c.status === 'approved' && c.expiresAt && c.expiresAt < now) {
        c.status = 'expired';
        await c.save();
      }
    }

    return successResponse(res, 200, 'Patient consent records retrieved', consents);
  } catch (error) {
    next(error);
  }
};

/**
 * Respond to consent request (Patient approves or rejects)
 */
const respondConsent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const consent = await Consent.findById(id)
      .populate('patient')
      .populate('requestingHospital');

    if (!consent) {
      return errorResponse(res, 404, 'Consent record not found.');
    }

    // Patient authorization check
    if (req.user.role === 'patient') {
      if (!consent.patient.user || String(consent.patient.user) !== String(req.user._id)) {
        return errorResponse(res, 403, 'You can only authorize or reject consent requests for your own records.');
      }
    }

    const now = new Date();
    if (approved) {
      const duration = consent.durationMinutes || 240;
      consent.status = 'approved';
      consent.grantedAt = now;
      consent.expiresAt = new Date(now.getTime() + duration * 60 * 1000);
    } else {
      consent.status = 'rejected';
    }

    await consent.save();

    await logAudit({
      req,
      hospital: consent.requestingHospital?._id,
      hospitalName: consent.requestingHospital?.name,
      patient: consent.patient._id,
      patientIdentifier: consent.patient.mediVaultId,
      action: approved ? 'CONSENT_APPROVED' : 'CONSENT_REJECTED',
      resourceType: 'consent',
      resourceId: consent._id,
      details: approved
        ? `Patient approved access for ${consent.durationMinutes}m to ${consent.requestingHospital?.name}`
        : `Patient declined access request from ${consent.requestingHospital?.name}`
    });

    return successResponse(
      res,
      200,
      approved ? 'Access permission granted successfully' : 'Consent request rejected',
      consent
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke active consent immediately
 * Revoked or expired consent must immediately block access.
 */
const revokeConsent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const consent = await Consent.findById(id)
      .populate('patient')
      .populate('requestingHospital');

    if (!consent) {
      return errorResponse(res, 404, 'Consent record not found.');
    }

    if (req.user.role === 'patient') {
      if (!consent.patient.user || String(consent.patient.user) !== String(req.user._id)) {
        return errorResponse(res, 403, 'You can only revoke consent requests for your own records.');
      }
    }

    consent.status = 'revoked';
    consent.revokedAt = new Date();
    await consent.save();

    await logAudit({
      req,
      hospital: consent.requestingHospital?._id,
      hospitalName: consent.requestingHospital?.name,
      patient: consent.patient._id,
      patientIdentifier: consent.patient.mediVaultId,
      action: 'CONSENT_REVOKED',
      resourceType: 'consent',
      resourceId: consent._id,
      details: `Patient immediately revoked access token from ${consent.requestingHospital?.name}`
    });

    return successResponse(res, 200, 'Cross-hospital access consent revoked immediately.', consent);
  } catch (error) {
    next(error);
  }
};

/**
 * Get consent requests for a hospital
 */
const getHospitalConsents = async (req, res, next) => {
  try {
    const hospitalId = req.params.hospitalId || req.activeHospital?._id;
    if (!hospitalId) {
      return errorResponse(res, 400, 'Hospital ID required');
    }

    const consents = await Consent.find({ requestingHospital: hospitalId })
      .populate('patient', 'name mediVaultId age gender phone')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Hospital consents retrieved', consents);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestConsent,
  getPatientConsents,
  respondConsent,
  revokeConsent,
  getHospitalConsents
};
