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

router.get('/doctor/my-consultations', restrictTo('doctor'), getDoctorConsultations);
router.get('/:id', getConsultationById);

// Doctors create and edit drafts
router.post('/draft', restrictTo('doctor'), saveConsultationDraft);

// Doctors finalize consultations
router.post('/:id/complete', restrictTo('doctor'), completeConsultation);

// Doctors append amendments to completed consultations
router.post('/:id/amendments', restrictTo('doctor'), addAmendment);

module.exports = router;
