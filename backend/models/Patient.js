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
    default: 'Standard Registered Residence'
  },
  allergies: [{
    allergen: { type: String, trim: true },
    reaction: { type: String, default: 'Moderate' },
    severity: { type: String, default: 'Mild' }
  }],
  chronicConditions: [{
    type: String,
    trim: true
  }],
  vitals: {
    bp: { type: String, default: '120/80 mmHg' },
    heartRate: { type: String, default: '72 bpm' },
    spO2: { type: String, default: '98%' },
    weight: { type: String, default: '70 kg' },
    height: { type: String, default: '172 cm' },
    bmi: { type: String, default: '23.6' },
    bloodGlucose: { type: String, default: '95 mg/dL' },
    temp: { type: String, default: '98.6 °F' }
  },
  emergencyContact: {
    name: { type: String, default: 'Family Contact' },
    relation: { type: String, default: 'Relative' },
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
