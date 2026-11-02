const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  mediVaultId: {
    type: String,
    required: [true, 'MediVault ID is required'],
    unique: true,
    uppercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true
  },
  dob: {
    type: Date
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: 'Other'
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'O+'
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    index: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    default: ''
  },
  allergies: [{
    allergen: { type: String, trim: true },
    reaction: { type: String, default: '' },
    severity: { type: String, default: '' }
  }],
  chronicConditions: [{
    type: String,
    trim: true
  }],
  vitals: {
    bp: { type: String },
    heartRate: { type: String },
    spO2: { type: String },
    weight: { type: String },
    height: { type: String },
    bmi: { type: String },
    bloodGlucose: { type: String },
    temp: { type: String }
  },
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },
  isClaimed: {
    type: Boolean,
    default: false,
    index: true
  },
  activationCodeHash: {
    type: String
  },
  activationExpiresAt: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registeredAtHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
