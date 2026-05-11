/**
 * utils/logger.js — initialises @campus/logger for the frontend.
 * Fetches a token from the backend auth endpoint and registers it as the token getter.
 * All Log calls from frontend code use stack = 'frontend'.
 */

import { initLogger, Log as _Log } from '@campus/logger';

const AUTH_URL = import.meta.env.VITE_AUTH_URL;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const CLIENT_EMAIL = import.meta.env.VITE_CLIENT_EMAIL || 'e23cseu0225@bennett.edu.in';
const CLIENT_NAME = import.meta.env.VITE_CLIENT_NAME || 'satvik sharma';
const CLIENT_ROLL_NO = import.meta.env.VITE_CLIENT_ROLL_NO || 'e23cseu0225';
const CLIENT_ACCESS_CODE = import.meta.env.VITE_CLIENT_ACCESS_CODE || 'TfDxgr';

let _cachedToken = null;
let _tokenExpiry = 0;
const SAFETY_BUFFER_MS = 60 * 1000;

/**
 * Fetches a fresh token directly from the auth endpoint.
 * Used by the logger token getter — must not call Log itself (circular dep).
 * @returns {Promise<string>}
 */
async function fetchFreshToken() {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      email: CLIENT_EMAIL,
      name: CLIENT_NAME,
      rollNo: CLIENT_ROLL_NO,
      accessCode: CLIENT_ACCESS_CODE,
    }),
  });

  if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
  const data = await response.json();
  return data;
}

/**
 * Token getter passed to initLogger. Caches the token with expiry.
 * @returns {Promise<string>}
 */
async function tokenGetter() {
  const now = Date.now();
  if (_cachedToken && now < _tokenExpiry - SAFETY_BUFFER_MS) {
    return _cachedToken;
  }
  const data = await fetchFreshToken();
  _cachedToken = data.token || data.access_token;
  if (!_cachedToken) throw new Error('Auth response missing token');

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (typeof data.expires_in === 'number' && data.expires_in > nowSeconds) {
    _tokenExpiry = data.expires_in * 1000;
  } else if (typeof data.expiresIn === 'number') {
    _tokenExpiry = Date.now() + data.expiresIn * 1000;
  } else if (typeof data.expires_in === 'number') {
    _tokenExpiry = Date.now() + data.expires_in * 1000;
  } else {
    _tokenExpiry = Date.now() + 3600 * 1000;
  }
  return _cachedToken;
}

// Initialise logger once at module load time
initLogger(tokenGetter);

/**
 * Frontend Log wrapper. Always uses stack = 'frontend'.
 * @param {string} level
 * @param {string} packageName
 * @param {string} message
 */
export async function Log(level, packageName, message) {
  await _Log('frontend', level, packageName, message);
}
