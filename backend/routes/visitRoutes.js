const express = require('express');
const router = express.Router();
const {
  createVisit,
  getVisits,
  getVisitById,
  updateVisitStatus,
  assignDoctor,
  removeDoctorAssignment
} = require('../controllers/visitController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getVisits);
router.get('/:id', getVisitById);

// Create visit (assistant/receptionist check-in)
router.post(
  '/',
  restrictTo('assistant', 'receptionist'),
  createVisit
);

router.patch(
  '/:id/status',
  restrictTo('assistant', 'receptionist', 'doctor'),
  updateVisitStatus
);

// Doctor assignment management
router.post(
  '/:id/assign-doctor',
  restrictTo('assistant', 'receptionist'),
  assignDoctor
);

router.delete(
  '/:id/assign-doctor/:doctorId',
  restrictTo('assistant', 'receptionist'),
  removeDoctorAssignment
);

router.post(
  '/:id/remove-doctor',
  restrictTo('assistant', 'receptionist'),
  removeDoctorAssignment
);

module.exports = router;
