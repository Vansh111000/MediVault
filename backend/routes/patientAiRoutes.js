const express = require('express');
const { generatePatientSummary, explainPatientRecord } = require('../controllers/patientAiController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, restrictTo('patient'));
router.post('/summary', generatePatientSummary);
router.post('/explain-record', explainPatientRecord);

module.exports = router;
