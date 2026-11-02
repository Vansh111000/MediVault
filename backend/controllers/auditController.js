const { AuditLog } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * Retrieve system audit logs with filters and pagination
 * Audit logs cannot be modified or deleted.
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const { action, hospitalId, patientId, limit = 50, page = 1 } = req.query;
    const query = {};

    if (action) {
      query.action = action;
    }

    if (hospitalId) {
      query.hospital = hospitalId;
    }

    if (patientId) {
      query.patient = patientId;
    }

    // Role-based restrictions:
    // If a patient is viewing logs, only show their own patient logs
    if (req.user.role === 'patient') {
      if (req.user.patientProfile) {
        query.patient = req.user.patientProfile._id || req.user.patientProfile;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 50, 100);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum),
      AuditLog.countDocuments(query)
    ]);

    return successResponse(res, 200, 'Audit logs retrieved', logs, {
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
