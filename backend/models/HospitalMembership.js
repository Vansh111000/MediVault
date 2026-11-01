const mongoose = require('mongoose');

const hospitalMembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['doctor', 'assistant', 'receptionist', 'hospital_admin'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

hospitalMembershipSchema.index({ user: 1, hospital: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('HospitalMembership', hospitalMembershipSchema);
