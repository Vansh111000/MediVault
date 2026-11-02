const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required']
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'assistant', 'receptionist', 'hospital_admin', 'super_admin'],
    required: [true, 'Role is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date
  },
  patientProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  doctorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  assistantProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assistant'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
