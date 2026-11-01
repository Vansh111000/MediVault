const express = require('express');
const router = express.Router();
const {
  saveConsultationDraft,
  completeConsultation,
  addAmendment,
  getConsultationById,
  getDoctorConsultations
} = require('../controllers/consultationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/doctor/my-consultations', restrictTo('doctor', 'super_admin'), getDoctorConsultations);
router.get('/:id', getConsultationById);

// Doctors create and edit drafts
router.post('/draft', restrictTo('doctor', 'super_admin'), saveConsultationDraft);

// Doctors finalize consultations
router.post('/:id/complete', restrictTo('doctor', 'super_admin'), completeConsultation);

// Doctors append amendments to completed consultations
router.post('/:id/amendments', restrictTo('doctor', 'super_admin'), addAmendment);

module.exports = router;
