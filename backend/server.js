const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { getHealth } = require('./controllers/healthController');

const app = express();
const PORT = process.env.PORT || 5001;

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Root and Health Endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'MediVault Secure Healthcare Backend API is running.',
    version: '1.0.0',
    documentation: '/api/health'
  });
});
app.get('/health', getHealth);
app.get('/api/health', getHealth);

// API Routes
app.use('/api', routes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// Connect to MongoDB Atlas and start server
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`[MediVault Server] Running on http://localhost:${PORT}`);
    });
    return server;
  } catch (error) {
    console.error('[MediVault Server Startup Failed]', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
