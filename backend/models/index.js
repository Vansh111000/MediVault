const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Assistant = require('./Assistant');
const Hospital = require('./Hospital');
const HospitalMembership = require('./HospitalMembership');
const HospitalPatient = require('./HospitalPatient');
const Visit = require('./Visit');
const Consultation = require('./Consultation');
const Consent = require('./Consent');
const MedicalDocument = require('./MedicalDocument');
const AuditLog = require('./AuditLog');

module.exports = {
  User,
  Patient,
  Doctor,
  Assistant,
  Hospital,
  HospitalMembership,
  HospitalPatient,
  Visit,
  Consultation,
  Consent,
  MedicalDocument,
  AuditLog
};
