const { Hospital, HospitalMembership, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { logAudit } = require('../utils/auditLogger');

const MAX_HOSPITALS = parseInt(process.env.MAX_HOSPITALS, 10) || 15;

/**
 * List all hospitals
 */
const getHospitals = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { hospitalCode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    const hospitals = await Hospital.find(query).sort({ createdAt: 1 });
    const count = await Hospital.countDocuments();

    return successResponse(res, 200, 'Hospitals retrieved', hospitals, {
      total: hospitals.length,
      maxAllowed: MAX_HOSPITALS,
      currentCount: count
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get hospital by ID
 */
const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }
    return successResponse(res, 200, 'Hospital retrieved', hospital);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new hospital (enforces max limit of 15)
 */
const createHospital = async (req, res, next) => {
  try {
    const currentCount = await Hospital.countDocuments();
    if (currentCount >= MAX_HOSPITALS) {
      return errorResponse(
        res,
        400,
        `Maximum hospital capacity reached. System is configured for a maximum of ${MAX_HOSPITALS} institutions for this MVP deployment.`
      );
    }

    const { hospitalCode, name, address, city, state, phone, email, maxCapacity } = req.body;

    if (!hospitalCode || !name || !address || !city) {
      return errorResponse(res, 400, 'Hospital code, name, address, and city are required.');
    }

    const existing = await Hospital.findOne({ hospitalCode: hospitalCode.toUpperCase().trim() });
    if (existing) {
      return errorResponse(res, 409, `Hospital with code '${hospitalCode}' already exists.`);
    }

    const hospital = await Hospital.create({
      hospitalCode: hospitalCode.toUpperCase().trim(),
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state || 'National',
      phone: phone || '',
      email: email ? email.toLowerCase().trim() : '',
      maxCapacity: maxCapacity || 500,
      status: 'active'
    });

    await logAudit({
      req,
      actor: req.user?._id,
      actorName: req.user?.email || 'Admin',
      actorRole: req.user?.role || 'hospital_admin',
      hospital: hospital._id,
      hospitalName: hospital.name,
      action: 'HOSPITAL_CREATED',
      resourceType: 'hospital',
      resourceId: hospital._id,
      details: `Created new hospital ${hospital.name} (${hospital.hospitalCode}). ${currentCount + 1}/${MAX_HOSPITALS} hospitals active.`
    });

    return successResponse(res, 201, 'Hospital created successfully', hospital);
  } catch (error) {
    next(error);
  }
};

/**
 * Update hospital details
 */
const updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    await logAudit({
      req,
      hospital: hospital._id,
      hospitalName: hospital.name,
      action: 'HOSPITAL_UPDATED',
      resourceType: 'hospital',
      resourceId: hospital._id,
      details: `Hospital details updated for ${hospital.name}`
    });

    return successResponse(res, 200, 'Hospital updated successfully', hospital);
  } catch (error) {
    next(error);
  }
};

/**
 * Add staff user to hospital (membership)
 */
const addMembership = async (req, res, next) => {
  try {
    const { userId, hospitalId, role } = req.body;

    if (!userId || !hospitalId || !role) {
      return errorResponse(res, 400, 'User ID, Hospital ID, and Role are required.');
    }

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    const existing = await HospitalMembership.findOne({
      user: userId,
      hospital: hospitalId,
      role
    });

    if (existing) {
      existing.status = 'active';
      await existing.save();
      return successResponse(res, 200, 'Membership already exists and is active', existing);
    }

    const membership = await HospitalMembership.create({
      user: userId,
      hospital: hospitalId,
      role,
      status: 'active'
    });

    await logAudit({
      req,
      hospital: hospital._id,
      hospitalName: hospital.name,
      action: 'MEMBERSHIP_CREATED',
      resourceType: 'hospitalMembership',
      resourceId: membership._id,
      details: `Added ${user.email} as ${role} to ${hospital.name}`
    });

    return successResponse(res, 201, 'Membership created successfully', membership);
  } catch (error) {
    next(error);
  }
};

/**
 * Get staff members for a hospital
 */
const getHospitalStaff = async (req, res, next) => {
  try {
    const hospitalId = req.params.id || req.activeHospital?._id;
    if (!hospitalId) {
      return errorResponse(res, 400, 'Hospital ID required');
    }

    const memberships = await HospitalMembership.find({
      hospital: hospitalId,
      status: 'active'
    }).populate({
      path: 'user',
      select: '-passwordHash',
      populate: ['doctorProfile', 'assistantProfile']
    });

    return successResponse(res, 200, 'Hospital staff retrieved', memberships);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  addMembership,
  getHospitalStaff,
  MAX_HOSPITALS
};
