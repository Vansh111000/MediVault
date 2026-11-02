const express = require('express');
const router = express.Router();
const { login, getMe, registerStaff, claimPatientAccount } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.post('/register-staff', registerStaff);
router.post('/claim-patient', claimPatientAccount);
router.post('/activate-patient', claimPatientAccount); // Alias
router.get('/me', protect, getMe);

module.exports = router;
