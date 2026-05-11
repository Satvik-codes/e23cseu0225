/**
 * api/notificationsApi.js — centralised API module for all notification fetch calls.
 * Never make direct fetch/axios calls from components or hooks — use this module.
 */

import axios from 'axios';
import { Log } from '../utils/logger';

const BASE = '/api';

/**
 * Fetches all notifications with optional filter/pagination parameters.
 * @param {{ limit?: number, page?: number, notification_type?: string }} params
 * @returns {Promise<object>}
 */
export async function getAllNotifications(params = {}) {
  await Log('info', 'api', `getAllNotifications called with params: ${JSON.stringify(params)}`);
  try {
    const response = await axios.get(`${BASE}/notifications`, { params });
    await Log('info', 'api', `getAllNotifications success — received ${response.data?.notifications?.length ?? 0} items`);
    return response.data;
  } catch (err) {
    await Log('error', 'api', `getAllNotifications failed: ${err.message}`);
    throw err;
  }
}

/**
 * Fetches priority-scored notifications for the inbox.
 * @param {number} n - number of top notifications to fetch (default 10)
 * @returns {Promise<object>}
 */
export async function getPriorityNotifications(n = 10) {
  await Log('info', 'api', `getPriorityNotifications called with n=${n}`);
  try {
    const response = await axios.get(`${BASE}/notifications/priority`, { params: { n } });
    await Log('info', 'api', `getPriorityNotifications success — received ${response.data?.notifications?.length ?? 0} items`);
    return response.data;
  } catch (err) {
    await Log('error', 'api', `getPriorityNotifications failed: ${err.message}`);
    throw err;
  }
}
