/**
 * controllers/notificationController.js — handler functions for notification routes.
 * Validates and coerces query parameters, delegates to the service layer.
 */

'use strict';

const { Log } = require('@campus/logger');
const { fetchNotifications, fetchAllNotificationsForPriority } = require('../services/notificationService');
const { getTopN } = require('../utils/priorityInbox');

/**
 * GET /api/notifications
 * Accepts optional query params: limit, page, notification_type
 */
async function getAllNotifications(req, res) {
  const rawParams = { ...req.query };
  await Log('backend', 'debug', 'controller', `getAllNotifications called with params: ${JSON.stringify(rawParams)}`);

  // Validate and coerce types
  const params = {};

  if (rawParams.limit !== undefined) {
    const parsed = parseInt(rawParams.limit, 10);
    if (isNaN(parsed) || parsed < 1) {
      await Log('backend', 'warn', 'controller', `Invalid "limit" param "${rawParams.limit}" — coercing to 10`);
      params.limit = 10;
    } else {
      params.limit = parsed;
    }
  }

  if (rawParams.page !== undefined) {
    const parsed = parseInt(rawParams.page, 10);
    if (isNaN(parsed) || parsed < 1) {
      await Log('backend', 'warn', 'controller', `Invalid "page" param "${rawParams.page}" — coercing to 1`);
      params.page = 1;
    } else {
      params.page = parsed;
    }
  }

  if (rawParams.notification_type !== undefined) {
    const validTypes = ['Placement', 'Result', 'Event'];
    if (!validTypes.includes(rawParams.notification_type)) {
      await Log('backend', 'warn', 'controller', `Unexpected notification_type "${rawParams.notification_type}" — forwarding as-is`);
    }
    params.notification_type = rawParams.notification_type;
  }

  try {
    const data = await fetchNotifications(params);
    return res.json(data);
  } catch (err) {
    await Log('backend', 'error', 'controller', `getAllNotifications unhandled exception: ${err.message}`);
    return res.status(502).json({ error: 'Failed to fetch notifications from upstream service', details: err.message });
  }
}

/**
 * GET /api/notifications/priority
 * Accepts optional query param: n (number of top notifications, default 10)
 */
async function getPriorityNotifications(req, res) {
  let n = parseInt(req.query.n, 10);

  if (isNaN(n) || n < 1) {
    await Log('backend', 'warn', 'controller', `Invalid "n" param "${req.query.n}" — defaulting to 10`);
    n = 10;
  }

  await Log('backend', 'debug', 'controller', `getPriorityNotifications called with n=${n}`);

  try {
    const notifications = await fetchAllNotificationsForPriority();
    const topN = getTopN(notifications, n);
    return res.json({ notifications: topN, n });
  } catch (err) {
    await Log('backend', 'error', 'controller', `getPriorityNotifications unhandled exception: ${err.message}`);
    return res.status(502).json({ error: 'Failed to compute priority notifications', details: err.message });
  }
}

/**
 * GET /api/health
 * Returns server health status.
 */
async function getHealth(req, res) {
  await Log('backend', 'debug', 'controller', 'Health check endpoint called');
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
}

module.exports = { getAllNotifications, getPriorityNotifications, getHealth };
