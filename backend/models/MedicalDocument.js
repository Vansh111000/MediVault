const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    index: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  documentType: {
    type: String,
    enum: ['lab_report', 'imaging', 'prescription', 'discharge_summary', 'other'],
    default: 'lab_report'
  },
  category: {
    type: String,
    default: 'Diagnostic Report'
  },
  fileMetadata: {
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/pdf' },
    checksum: { type: String, default: '' }
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalDocument', medicalDocumentSchema);
