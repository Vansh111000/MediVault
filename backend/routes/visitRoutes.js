const express = require('express');
const router = express.Router();
const {
  createVisit,
  getVisits,
  getVisitById,
  updateVisitStatus,
  assignDoctor
} = require('../controllers/visitController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getVisits);
router.get('/:id', getVisitById);

// Create visit (assistant/receptionist check-in)
router.post(
  '/',
  restrictTo('assistant', 'receptionist', 'hospital_admin', 'super_admin'),
  createVisit
);

router.patch(
  '/:id/status',
  restrictTo('assistant', 'receptionist', 'doctor', 'hospital_admin', 'super_admin'),
  updateVisitStatus
);

router.post(
  '/:id/assign-doctor',
  restrictTo('assistant', 'receptionist', 'hospital_admin', 'super_admin'),
  assignDoctor
);

module.exports = router;
