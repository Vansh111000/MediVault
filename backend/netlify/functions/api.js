const { app } = require('../../server');
const connectDB = require('../../config/db');
const serverless = require('serverless-http');

const handler = serverless(app, { basePath: '/.netlify/functions/api' });

exports.handler = async (event, context) => {
  await connectDB();
  return handler(event, context);
};
