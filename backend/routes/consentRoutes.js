const express = require('express');
const router = express.Router();
const {
  requestConsent,
  getPatientConsents,
  respondConsent,
  revokeConsent,
  getHospitalConsents
} = require('../controllers/consentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Staff requests consent
router.post('/request', requestConsent);

// Patient gets own consents or staff gets patient consents
router.get('/patient', getPatientConsents);
router.get('/patient/:patientId', getPatientConsents);

// Hospital gets consents
router.get('/hospital', getHospitalConsents);
router.get('/hospital/:hospitalId', getHospitalConsents);

// Patient responds (approve/reject)
router.post('/:id/respond', respondConsent);

// Patient revokes consent immediately
router.post('/:id/revoke', revokeConsent);

module.exports = router;
