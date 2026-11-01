const { Consent } = require('../models');

/**
 * Checks if a user / hospital has valid consent to access patient records.
 * Rules:
 * 1. Patients accessing their own records: always allowed.
 * 2. Record origin matches current hospital: always allowed (internal hospital care).
 * 3. Cross-hospital access: MUST have an active approved consent that has not expired or been revoked.
 */
const verifyConsentAccess = async ({ patientId, recordHospitalId, currentHospitalId, userRole, userId }) => {
  // If user is a patient accessing their own record, allow
  if (userRole === 'patient') {
    return { allowed: true, reason: 'Patient owns their records' };
  }

  // Super admin emergency/governance override (if applicable)
  if (userRole === 'super_admin') {
    return { allowed: true, reason: 'Super Admin Access' };
  }

  // If the record was created at the same hospital where staff is currently operating, allow
  if (recordHospitalId && currentHospitalId && String(recordHospitalId) === String(currentHospitalId)) {
    return { allowed: true, reason: 'Local hospital record access' };
  }

  // Cross-hospital access requires active, unexpired consent
  const now = new Date();
  const consent = await Consent.findOne({
    patient: patientId,
    requestingHospital: currentHospitalId,
    status: 'approved'
  }).sort({ expiresAt: -1 });

  if (!consent) {
    return {
      allowed: false,
      reason: 'No approved cross-hospital consent found for this patient and hospital.'
    };
  }

  // Check if consent has expired
  if (consent.expiresAt && consent.expiresAt < now) {
    // Automatically transition to expired
    consent.status = 'expired';
    await consent.save();
    return {
      allowed: false,
      reason: 'Cross-hospital access consent has expired. Please request a new consent token from the patient.'
    };
  }

  return {
    allowed: true,
    consentId: consent._id,
    scope: consent.permissionScope,
    expiresAt: consent.expiresAt
  };
};

module.exports = {
  verifyConsentAccess
};
