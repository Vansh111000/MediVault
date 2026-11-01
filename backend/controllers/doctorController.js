const { Doctor, Visit, Consultation, Patient, HospitalMembership } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * List doctors (with optional hospital filter)
 */
const getDoctors = async (req, res, next) => {
  try {
    const { hospitalId, specialty } = req.query;
    let doctorIds = null;

    if (hospitalId) {
      const memberships = await HospitalMembership.find({
        hospital: hospitalId,
        role: 'doctor',
        status: 'active'
      });
      const userIds = memberships.map(m => m.user);
      const docs = await Doctor.find({ user: { $in: userIds } });
      doctorIds = docs.map(d => d._id);
    }

    const query = { status: 'active' };
    if (doctorIds) {
      query._id = { $in: doctorIds };
    }
    if (specialty) {
      query.specialty = { $regex: specialty, $options: 'i' };
    }

    const doctors = await Doctor.find(query).populate('user', 'email');
    return successResponse(res, 200, 'Doctors retrieved', doctors);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Doctor Dashboard summary & patient queue
 */
const getDoctorDashboard = async (req, res, next) => {
  try {
    let doctor = null;
    if (req.user.doctorProfile) {
      doctor = await Doctor.findById(req.user.doctorProfile);
    } else {
      doctor = await Doctor.findOne({ user: req.user._id });
    }

    if (!doctor && req.user.role !== 'super_admin') {
      return errorResponse(res, 403, 'Doctor profile not found for this account.');
    }

    const hospitalId = req.activeHospital?._id;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const visitQuery = {
      checkInTime: { $gte: todayStart }
    };
    if (hospitalId) {
      visitQuery.hospital = hospitalId;
    }
    if (doctor) {
      visitQuery.assignedDoctors = doctor._id;
    }

    const todayVisits = await Visit.find(visitQuery)
      .populate('patient', 'name mediVaultId age gender vitals bloodGroup phone')
      .populate('hospital', 'name hospitalCode')
      .sort({ checkInTime: -1 });

    const totalToday = todayVisits.length;
    const completed = todayVisits.filter(v => v.status === 'completed').length;
    const upcoming = todayVisits.filter(v => ['in_queue', 'checked_in', 'in_consultation'].includes(v.status)).length;

    // Pending drafts for this doctor
    const draftQuery = { status: 'draft' };
    if (doctor) {
      draftQuery.doctor = doctor._id;
    }
    const pendingDrafts = await Consultation.find(draftQuery)
      .populate('patient', 'name mediVaultId')
      .sort({ updatedAt: -1 });

    return successResponse(res, 200, 'Doctor dashboard retrieved', {
      doctor,
      stats: {
        totalToday,
        upcoming,
        completed,
        pendingDraftsCount: pendingDrafts.length
      },
      patientQueue: todayVisits,
      pendingDrafts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorDashboard
};
