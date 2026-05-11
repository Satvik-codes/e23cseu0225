/**
 * services/notificationService.js — business logic for fetching notifications
 * from the test server. Handles auth token injection and request forwarding.
 */

'use strict';

const axios = require('axios');
const { Log } = require('@campus/logger');
const { getToken } = require('../auth/tokenService');
const config = require('../config/env');

// Socket emitter reference — set by index.js after the server starts
let _emitNotification = null;

/**
 * Registers the Socket.IO emit function so this service can push real-time events.
 * @param {Function} emitFn
 */
function setEmitter(emitFn) {
  _emitNotification = emitFn;
}

/**
 * Fetches notifications from the test server with optional query parameters.
 * @param {object} params - optional: { limit, page, notification_type }
 * @returns {Promise<object>} parsed response data from test server
 */
async function fetchNotifications(params = {}) {
  try {
    const token = await getToken();
    const requestConfig = {
      headers: { Authorization: `Bearer ${token}` },
      params,
      timeout: 10000,
    };
    const response = await axios.get(config.notificationsUrl, requestConfig);

    await Log('backend', 'info', 'service', `fetchNotifications succeeded — returned ${response.data?.notifications?.length ?? 0} notifications`);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 400 && !params.notification_type) {
      await Log('backend', 'warn', 'service', 'Upstream rejected pagination-only query; retrying without query params');
      const token = await getToken();
      const fallbackResponse = await axios.get(config.notificationsUrl, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      return fallbackResponse.data;
    }

    // Handle token expiry mid-request — retry once with a fresh token
    if (err.response && err.response.status === 401) {
      await Log('backend', 'warn', 'auth', 'Token rejected (401) — refreshing and retrying request');
      try {
        const freshToken = await getToken();
        const retryResponse = await axios.get(config.notificationsUrl, {
          headers: { Authorization: `Bearer ${freshToken}` },
          params,
          timeout: 10000,
        });
        await Log('backend', 'info', 'service', 'Retry after token refresh succeeded');
        return retryResponse.data;
      } catch (retryErr) {
        await Log('backend', 'error', 'service', `Retry after token refresh failed: ${retryErr.message}`);
        throw retryErr;
      }
    }

    await Log('backend', 'error', 'service', `fetchNotifications failed: ${err.message}`);
    throw err;
  }
}

/**
 * Fetches a representative set of all notifications for priority scoring.
 * Uses a high limit to get as many as possible in one shot.
 * @returns {Promise<Array>} flat array of notification objects
 */
async function fetchAllNotificationsForPriority() {
  try {
    const token = await getToken();

    const response = await axios.get(config.notificationsUrl, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    const notifications = response.data?.notifications || [];
    await Log('backend', 'info', 'service', `fetchAllNotificationsForPriority fetched ${notifications.length} notifications`);
    return notifications;
  } catch (err) {
    await Log('backend', 'error', 'service', `fetchAllNotificationsForPriority failed: ${err.message}`);
    throw err;
  }
}

module.exports = { fetchNotifications, fetchAllNotificationsForPriority, setEmitter };
