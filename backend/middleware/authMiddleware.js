const jwt = require('jsonwebtoken');
const { User, HospitalMembership, Hospital, Assistant } = require('../models');
const { errorResponse } = require('../utils/apiResponse');

const JWT_SECRET = process.env.JWT_SECRET || 'medivault_super_secret_jwt_key_2025';

/**
 * Protect middleware: verifies JWT and attaches user and their hospital memberships
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Authentication token missing. Please sign in.');
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id)
      .populate('patientProfile')
      .populate('doctorProfile')
      .populate('assistantProfile');

    if (!user) {
      return errorResponse(res, 401, 'The account belonging to this token no longer exists.');
    }

    if (user.status !== 'active') {
      return errorResponse(res, 403, 'Your account is currently inactive or suspended.');
    }

    // Ensure assistant profile is resolved and populated
    if (['assistant', 'receptionist'].includes(user.role)) {
      if (!user.assistantProfile || !user.assistantProfile.name) {
        const asst = await Assistant.findOne({ user: user._id });
        if (asst) {
          user.assistantProfile = asst;
        }
      }
    }

    // Attach user to req
    req.user = user;

    // Attach staff memberships if applicable
    if (['doctor', 'assistant', 'receptionist', 'hospital_admin'].includes(user.role)) {
      const memberships = await HospitalMembership.find({
        user: user._id,
        status: 'active'
      }).populate('hospital');

      req.memberships = memberships;

      // Determine active hospital from header, query, or first active membership
      const requestedHospitalId = req.headers['x-hospital-id'] || req.query.hospitalId;
      if (requestedHospitalId) {
        const found = memberships.find(
          m => m.hospital && (String(m.hospital._id) === String(requestedHospitalId) || m.hospital.hospitalCode === requestedHospitalId)
        );
        if (found) {
          req.activeHospital = found.hospital;
          req.activeMembership = found;
        } else {
          // Check if hospital exists in DB
          const hospital = await Hospital.findById(requestedHospitalId);
          if (hospital && user.role === 'super_admin') {
            req.activeHospital = hospital;
          }
        }
      }

      // If requested hospital is not in user's memberships or was stale, default to user's primary membership
      if (!req.activeHospital && memberships.length > 0) {
        req.activeHospital = memberships[0].hospital;
        req.activeMembership = memberships[0];
      }
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Invalid or expired session token. Please sign in again.');
    }
    return errorResponse(res, 500, error.message);
  }
};

/**
 * Role-based authorization guard
 */
const restrictTo = (...roles) => {
  const expandedRoles = new Set(roles);
  if (expandedRoles.has('assistant')) expandedRoles.add('receptionist');
  if (expandedRoles.has('receptionist')) expandedRoles.add('assistant');

  return (req, res, next) => {
    if (!req.user || !expandedRoles.has(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${req.user?.role || 'anonymous'}' is not authorized to perform this action.`
      );
    }
    next();
  };
};

/**
 * Ensure active hospital membership for hospital-specific operations
 */
const requireHospitalMembership = async (req, res, next) => {
  // Super admin can bypass
  if (req.user?.role === 'super_admin') {
    return next();
  }

  // Patients do not have staff hospital memberships
  if (req.user?.role === 'patient') {
    return next();
  }

  const hospitalId = req.headers['x-hospital-id'] || req.body.hospitalId || req.query.hospitalId || req.activeHospital?._id;

  if (!hospitalId) {
    return errorResponse(res, 400, 'Hospital identifier is required for this operation.');
  }

  const membership = await HospitalMembership.findOne({
    user: req.user._id,
    hospital: hospitalId,
    status: 'active'
  }).populate('hospital');

  if (!membership) {
    return errorResponse(res, 403, 'You do not have active authorized membership at this hospital.');
  }

  req.activeHospital = membership.hospital;
  req.activeMembership = membership;
  next();
};

module.exports = {
  protect,
  restrictTo,
  requireHospitalMembership,
  JWT_SECRET
};
