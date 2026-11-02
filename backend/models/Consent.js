const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  requestingHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  requestingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  permissionScope: {
    type: String,
    enum: ['full_history', 'read_only_visit', 'emergency'],
    default: 'read_only_visit'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'revoked', 'expired'],
    default: 'pending',
    index: true
  },
  purpose: {
    type: String,
    required: [true, 'Purpose for accessing records is required'],
    trim: true
  },
  durationMinutes: {
    type: Number,
    default: 240 // 4 hours default visit window
  },
  grantedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    index: true
  },
  revokedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consent', consentSchema);
