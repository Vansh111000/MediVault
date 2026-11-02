const express = require('express');
const router = express.Router();
const {
  searchPatients,
  createPatient,
  getPatient,
  updatePatient,
  reissueActivationCode,
  getPatientMedicalHistory
} = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const { lookupPatientByExactMediVaultId } = require('../controllers/hospitalPatientController');

router.use(protect);

// Exact MediVault ID lookup
router.get('/lookup', restrictTo('assistant', 'receptionist', 'doctor'), lookupPatientByExactMediVaultId);

// Search patients (assistants/receptionists/doctors)
router.get('/search', restrictTo('assistant', 'receptionist', 'doctor'), searchPatients);

// Patient registration: only authorized hospital assistant / receptionist / admins
// Notice: no public self-registration!
router.post(
  '/',
  restrictTo('assistant', 'receptionist', 'hospital_admin', 'super_admin'),
  createPatient
);

router.get('/:id', getPatient);
router.put('/:id', restrictTo('assistant', 'receptionist', 'doctor', 'hospital_admin', 'super_admin', 'patient'), updatePatient);

// Re-issue activation code by clinic assistant
router.post(
  '/:id/reissue-code',
  restrictTo('assistant', 'receptionist', 'hospital_admin', 'super_admin'),
  reissueActivationCode
);

// Get medical history (checks consent for cross-hospital records)
router.get('/:id/history', getPatientMedicalHistory);

module.exports = router;
