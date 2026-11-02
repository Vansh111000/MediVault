const { Doctor, Visit, Consultation, Patient, HospitalMembership, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * List doctors eligible to be assigned by the authenticated assistant.
 * SECURITY: When called by an assistant, returns ONLY doctors from their active hospital.
 * Never returns doctors from other hospitals or all doctors without hospital context.
 */
const getDoctors = async (req, res, next) => {
  try {
    const { specialty } = req.query;

    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required to view doctors.');
    }

    // Derive hospital from authenticated user membership only
    const hospitalId = req.activeHospital ? req.activeHospital._id : null;

    if (!hospitalId) {
      return errorResponse(res, 400, 'Hospital context could not be established.');
    }

    // Find all active doctor memberships at THIS hospital
    const memberships = await HospitalMembership.find({
      hospital: hospitalId,
      role: 'doctor',
      status: 'active'
    });
    const userIds = memberships.map(m => m.user);
    const docs = await Doctor.find({ user: { $in: userIds }, status: 'active' });
    const doctorIds = docs.map(d => d._id);

    const query = { status: 'active', _id: { $in: doctorIds } };
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
 * Get Doctor Dashboard summary and patient queue.
 * Uses the authenticated doctor's identity from req.user – never a client-supplied ID.
 */
const getDoctorDashboard = async (req, res, next) => {
  try {
    // Derive doctor identity from authenticated JWT only
    let doctor = null;
    if (req.user.doctorProfile) {
      doctor = await Doctor.findById(req.user.doctorProfile);
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ user: req.user._id });
    }

    if (!doctor) {
      return errorResponse(res, 403, 'Doctor profile not found for this account.');
    }

    const hospitalId = req.activeHospital ? req.activeHospital._id : null;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Active queue: visits assigned to THIS doctor that are checked in, waiting in queue, or in consultation
    // Today's appointments/visits: scheduled for today or checked in today
    const visitQuery = {
      assignedDoctors: doctor._id,
      $or: [
        { status: { $in: ['in_queue', 'checked_in', 'in_consultation'] } },
        { appointmentDate: { $gte: todayStart, $lte: todayEnd } },
        { checkInTime: { $gte: todayStart, $lte: todayEnd } }
      ]
    };
    if (hospitalId) {
      visitQuery.hospital = hospitalId;
    }

    const todayVisits = await Visit.find(visitQuery)
      .populate('patient', 'name mediVaultId age gender vitals bloodGroup phone allergies')
      .populate('hospital', 'name hospitalCode')
      .populate('assignedDoctors', 'name specialty')
      .sort({ appointmentDate: 1, checkInTime: 1 });

    const totalToday = todayVisits.filter(v =>
      (v.appointmentDate >= todayStart && v.appointmentDate <= todayEnd) ||
      (v.checkInTime >= todayStart && v.checkInTime <= todayEnd) ||
      ['in_queue', 'checked_in', 'in_consultation'].includes(v.status)
    ).length;
    const completed = todayVisits.filter(v => v.status === 'completed').length;
    // Active queue: only visits currently waiting or in consultation
    const upcoming = todayVisits.filter(v => ['in_queue', 'checked_in', 'in_consultation'].includes(v.status)).length;

    // Pending drafts for THIS doctor only
    const pendingDrafts = await Consultation.find({ doctor: doctor._id, status: 'draft' })
      .populate('patient', 'name mediVaultId')
      .sort({ updatedAt: -1 });

    // Get active hospital info for header display
    const activeHospitalInfo = req.activeHospital ? {
      _id: req.activeHospital._id,
      name: req.activeHospital.name,
      hospitalCode: req.activeHospital.hospitalCode
    } : null;

    return successResponse(res, 200, 'Doctor dashboard retrieved', {
      doctor,
      activeHospital: activeHospitalInfo,
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

module.exports = { getDoctors, getDoctorDashboard };
