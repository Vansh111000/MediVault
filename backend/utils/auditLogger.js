const { AuditLog } = require('../models');

/**
 * Safe audit logger that never logs passwords, tokens, or complete clinical notes.
 */
const logAudit = async ({
  req,
  actor,
  actorName,
  actorRole,
  hospital,
  hospitalName,
  patient,
  patientIdentifier,
  action,
  resourceType,
  resourceId,
  details
}) => {
  try {
    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    
    // Fall back to authenticated req.user if available
    const resolvedActor = actor || req?.user?._id || null;
    const resolvedActorName = actorName || req?.user?.name || req?.user?.email || 'System';
    const resolvedActorRole = actorRole || req?.user?.role || 'system';
    const resolvedHospital = hospital || req?.activeHospital?._id || null;
    const resolvedHospitalName = hospitalName || req?.activeHospital?.name || 'N/A';

    // Sanitize details: strip any password, token, or full clinical text if present
    let sanitizedDetails = details || '';
    if (typeof sanitizedDetails === 'object') {
      const copy = { ...sanitizedDetails };
      delete copy.password;
      delete copy.token;
      delete copy.clinicalNote;
      delete copy.activationCode;
      sanitizedDetails = JSON.stringify(copy);
    } else if (typeof sanitizedDetails === 'string') {
      sanitizedDetails = sanitizedDetails
        .replace(/password[:=]\s*\S+/gi, 'password=[REDACTED]')
        .replace(/token[:=]\s*\S+/gi, 'token=[REDACTED]')
        .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [REDACTED]');
    }

    await AuditLog.create({
      actor: resolvedActor,
      actorName: resolvedActorName,
      actorRole: resolvedActorRole,
      hospital: resolvedHospital,
      hospitalName: resolvedHospitalName,
      patient: patient || null,
      patientIdentifier: patientIdentifier || 'N/A',
      action,
      resourceType: resourceType || 'general',
      resourceId: resourceId ? String(resourceId) : 'N/A',
      details: sanitizedDetails.slice(0, 1000), // Enforce reasonable length, no complete clinical notes
      ipAddress,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('[Audit Logger Error]', err.message);
  }
};

module.exports = {
  logAudit
};
