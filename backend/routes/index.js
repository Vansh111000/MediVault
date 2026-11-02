const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const hospitalRoutes = require('./hospitalRoutes');
const hospitalPatientRoutes = require('./hospitalPatientRoutes');
const patientRoutes = require('./patientRoutes');
const visitRoutes = require('./visitRoutes');
const consultationRoutes = require('./consultationRoutes');
const consentRoutes = require('./consentRoutes');
const auditRoutes = require('./auditRoutes');
const doctorRoutes = require('./doctorRoutes');
const healthRoutes = require('./healthRoutes');

router.use('/auth', authRoutes);
router.use('/hospitals', hospitalRoutes);
router.use('/hospital-patients', hospitalPatientRoutes);
router.use('/patients', patientRoutes);
router.use('/visits', visitRoutes);
router.use('/consultations', consultationRoutes);
router.use('/consents', consentRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/doctors', doctorRoutes);
router.use('/health', healthRoutes);

module.exports = router;
