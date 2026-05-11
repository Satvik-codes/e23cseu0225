/**
 * state/notificationStore.js — client-side seen/read state for notifications.
 * Uses localStorage for persistence across page refreshes.
 * Falls back to in-memory Set if localStorage is unavailable.
 */

import { Log } from '../utils/logger';

const STORAGE_KEY = 'campus_seen_notification_ids';

// In-memory fallback
let _inMemorySet = new Set();
let _useLocalStorage = true;

// Try loading persisted IDs from localStorage
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    _inMemorySet = new Set(Array.isArray(parsed) ? parsed : []);
  }
} catch (_err) {
  _useLocalStorage = false;
}

/**
 * Saves the current in-memory set to localStorage (best-effort).
 */
function _persist() {
  if (!_useLocalStorage) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([..._inMemorySet]));
  } catch (_err) {
    _useLocalStorage = false;
  }
}

/**
 * Marks a notification ID as seen.
 * @param {string} id
 */
export function markAsSeen(id) {
  if (!_inMemorySet.has(id)) {
    _inMemorySet.add(id);
    _persist();
    Log('debug', 'state', `Notification marked as seen: ${id}`);
  }
}

/**
 * Returns true if the notification ID has been seen.
 * @param {string} id
 * @returns {boolean}
 */
export function isSeen(id) {
  return _inMemorySet.has(id);
}

/**
 * Returns the current count of unseen notifications from a given array.
 * @param {Array<object>} notifications
 * @returns {number}
 */
export function countUnseen(notifications) {
  return notifications.filter((n) => !isSeen(n.id || n._id || n.ID)).length;
}
