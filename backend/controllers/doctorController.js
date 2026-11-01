const { Doctor, Visit, Consultation, Patient, HospitalMembership, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * List doctors eligible to be assigned by the authenticated assistant.
 * SECURITY: When called by an assistant, returns ONLY doctors from their active hospital.
 * Never returns doctors from other hospitals.
 */
const getDoctors = async (req, res, next) => {
  try {
    const { specialty } = req.query;

    // Derive hospital from authenticated user membership only
    const hospitalId = req.activeHospital ? req.activeHospital._id : null;

    let doctorIds = null;

    if (hospitalId) {
      // Find all active doctor memberships at THIS hospital
      const memberships = await HospitalMembership.find({
        hospital: hospitalId,
        role: 'doctor',
        status: 'active'
      });
      const userIds = memberships.map(m => m.user);
      const docs = await Doctor.find({ user: { $in: userIds }, status: 'active' });
      doctorIds = docs.map(d => d._id);
    }

    const query = { status: 'active' };
    if (doctorIds !== null) {
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

    // Query visits assigned specifically to THIS doctor
    const visitQuery = {
      assignedDoctors: doctor._id,
      checkInTime: { $gte: todayStart }
    };
    if (hospitalId) {
      visitQuery.hospital = hospitalId;
    }

    const todayVisits = await Visit.find(visitQuery)
      .populate('patient', 'name mediVaultId age gender vitals bloodGroup phone')
      .populate('hospital', 'name hospitalCode')
      .sort({ checkInTime: 1 });

    const totalToday = todayVisits.length;
    const completed = todayVisits.filter(v => v.status === 'completed').length;
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
