const mongoose = require('mongoose');

/**
 * HospitalPatient Model
 * Connects global patient identities to individual hospital directories.
 * Separate from HospitalMembership (which is exclusively for staff).
 */
const hospitalPatientSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  dateAdded: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active',
    index: true
  },
  lastVisitAt: {
    type: Date
  },
  operationalNotes: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
});

// Unique compound index: hospitalId + patientId
// Prevents duplicate patient-directory relationships within the same hospital.
hospitalPatientSchema.index({ hospital: 1, patient: 1 }, { unique: true });

module.exports = mongoose.model('HospitalPatient', hospitalPatientSchema);
