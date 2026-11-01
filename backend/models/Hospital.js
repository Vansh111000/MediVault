const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  hospitalCode: {
    type: String,
    required: [true, 'Hospital code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    default: 'National'
  },
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
    enum: ['active', 'inactive'],
    default: 'active'
  },
  maxCapacity: {
    type: Number,
    default: 500
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);
