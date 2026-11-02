const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Specialty is required'],
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true,
    trim: true
  },
  qualifications: [{
    type: String,
    trim: true
  }],
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', doctorSchema);
