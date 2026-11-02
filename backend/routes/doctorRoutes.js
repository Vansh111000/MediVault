const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorDashboard } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDoctors);
router.get('/dashboard', protect, getDoctorDashboard);

module.exports = router;
