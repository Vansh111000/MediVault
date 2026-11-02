const mongoose = require('mongoose');
const { successResponse } = require('../utils/apiResponse');

const getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const readyStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  return successResponse(res, 200, 'MediVault Backend Health Check', {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      state: readyStates[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host || 'MongoDB Atlas'
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
};

module.exports = {
  getHealth
};
