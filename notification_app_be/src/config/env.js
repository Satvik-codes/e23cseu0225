/**
 * config/env.js — reads all required environment variables and exports them as a config object.
 * Throws a fatal error at startup if any required variable is missing.
 */

'use strict';

require('dotenv').config();

// Lazily import logger after dotenv has loaded env vars
let _logger = null;
function getLogger() {
  if (!_logger) _logger = require('@campus/logger');
  return _logger;
}

const REQUIRED_VARS = [
  'PORT',
  'CLIENT_ID',
  'CLIENT_SECRET',
  'AUTH_URL',
  'NOTIFICATIONS_URL',
  'LOGS_URL',
  'CLIENT_EMAIL',
  'CLIENT_NAME',
  'CLIENT_ROLL_NO',
  'CLIENT_ACCESS_CODE',
];

// Validate all required vars are present
for (const key of REQUIRED_VARS) {
  if (!process.env[key]) {
    // Log is best-effort here since logger may not be fully initialised yet
    try {
      const { Log } = getLogger();
      Log('backend', 'fatal', 'config', `Missing required environment variable: ${key}`);
    } catch (_) { /* ignore */ }
    throw new Error(`[config] Missing required environment variable: ${key}`);
  }
}

const config = {
  port: parseInt(process.env.PORT, 10),
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  authUrl: process.env.AUTH_URL,
  notificationsUrl: process.env.NOTIFICATIONS_URL,
  logsUrl: process.env.LOGS_URL,
  clientEmail: process.env.CLIENT_EMAIL,
  clientName: process.env.CLIENT_NAME,
  clientRollNo: process.env.CLIENT_ROLL_NO,
  clientAccessCode: process.env.CLIENT_ACCESS_CODE,
};

module.exports = config;
