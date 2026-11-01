const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  visit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit',
    required: true,
    index: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  // Single free-text, letterhead-style clinical note
  clinicalNote: {
    type: String,
    default: '',
    trim: false
  },
  noteLanguage: {
    type: String,
    default: 'en'
  },
  status: {
    type: String,
    enum: ['draft', 'completed'],
    default: 'draft',
    index: true
  },
  prescriptions: [{
    name: { type: String, trim: true },
    dosage: { type: String, trim: true },
    frequency: { type: String, trim: true },
    duration: { type: String, trim: true },
    instructions: { type: String, trim: true }
  }],
  // Completed notes cannot be silently overwritten; corrections append an amendment
  amendments: [{
    note: { type: String, required: true },
    amendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    reason: { type: String, default: 'Clinical note correction' },
    amendedAt: { type: Date, default: Date.now }
  }],
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', consultationSchema);
