const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  createHospital,
  updateHospital,
  addMembership,
  getHospitalStaff
} = require('../controllers/hospitalController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getHospitals);
router.get('/:id', getHospitalById);
router.get('/:id/staff', protect, getHospitalStaff);

// Hospital creation & updates restricted to admins/super_admin
router.post('/', protect, restrictTo('super_admin', 'hospital_admin'), createHospital);
router.put('/:id', protect, restrictTo('super_admin', 'hospital_admin'), updateHospital);
router.post('/membership', protect, restrictTo('super_admin', 'hospital_admin'), addMembership);

module.exports = router;
