const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
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
  checkInTime: {
    type: Date,
    default: Date.now,
    index: true
  },
  dischargeTime: {
    type: Date
  },
  reasonForVisit: {
    type: String,
    default: 'General Consultation',
    trim: true
  },
  reportedSymptoms: {
    type: String,
    default: '',
    trim: true
  },
  preliminaryVitals: {
    bp: { type: String, default: '120/80 mmHg' },
    pulse: { type: String, default: '72 bpm' },
    temp: { type: String, default: '98.6 °F' },
    spO2: { type: String, default: '98%' },
    weight: { type: String, default: '70 kg' },
    height: { type: String, default: '172 cm' }
  },
  assignedDoctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  }],
  tokenNumber: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine'
  },
  status: {
    type: String,
    enum: ['checked_in', 'in_queue', 'in_consultation', 'completed', 'cancelled'],
    default: 'checked_in',
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Visit', visitSchema);
