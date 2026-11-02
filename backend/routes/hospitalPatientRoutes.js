const express = require('express');
const router = express.Router();
const {
  getHospitalPatients,
  lookupPatientByExactMediVaultId,
  addPatientToHospitalDirectory
} = require('../controllers/hospitalPatientController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

// List/search hospital-specific patient directory
router.get('/', restrictTo('assistant', 'receptionist', 'doctor'), getHospitalPatients);

// Exact MediVault ID lookup for cross-hospital patient additions
router.get('/lookup', restrictTo('assistant', 'receptionist', 'doctor'), lookupPatientByExactMediVaultId);

// Add existing global patient to current hospital directory
router.post('/', restrictTo('assistant', 'receptionist'), addPatientToHospitalDirectory);

module.exports = router;
