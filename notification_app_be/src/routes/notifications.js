/**
 * routes/notifications.js — Express router defining all /api notification endpoints.
 * All routes are wrapped with the requestLogger middleware.
 */

'use strict';

const express = require('express');
const { Log } = require('@campus/logger');
const requestLogger = require('../middleware/requestLogger');
const { getAllNotifications, getPriorityNotifications, getHealth } = require('../controllers/notificationController');

const router = express.Router();

// Apply request logger to all routes in this router
router.use(requestLogger);

/**
 * GET /api/health — server health check
 */
router.get('/health', async (req, res) => {
  await Log('backend', 'debug', 'route', 'GET /api/health — entry');
  return getHealth(req, res);
});

/**
 * GET /api/notifications/priority — fetch priority inbox (must be before /)
 */
router.get('/notifications/priority', async (req, res) => {
  await Log('backend', 'info', 'route', 'GET /api/notifications/priority — entry');
  try {
    await getPriorityNotifications(req, res);
    await Log('backend', 'info', 'route', 'GET /api/notifications/priority — success');
  } catch (err) {
    await Log('backend', 'error', 'route', `GET /api/notifications/priority — error: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

/**
 * GET /api/notifications — fetch all notifications with optional filters
 */
router.get('/notifications', async (req, res) => {
  await Log('backend', 'debug', 'route', 'GET /api/notifications — entry');
  try {
    await getAllNotifications(req, res);
    await Log('backend', 'info', 'route', 'GET /api/notifications — success');
  } catch (err) {
    await Log('backend', 'error', 'route', `GET /api/notifications — error: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

module.exports = router;
