/**
 * utils/logger.js - initializes @campus/logger for the frontend.
 * Uses backend token proxy to avoid direct browser CORS calls to external auth.
 */

import { initLogger, Log as _Log } from '@campus/logger';

const TOKEN_PROXY_URL = '/api/logger-token';

let _cachedToken = null;
let _tokenExpiry = 0;
const SAFETY_BUFFER_MS = 60 * 1000;

/**
 * Fetches a fresh token from backend proxy endpoint.
 * @returns {Promise<object>}
 */
async function fetchFreshToken() {
  const response = await fetch(TOKEN_PROXY_URL, { method: 'GET' });
  if (!response.ok) throw new Error(`Auth failed: ${response.status}`);
  return response.json();
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

  if (typeof data.expiresAtMs === 'number') {
    _tokenExpiry = data.expiresAtMs;
  } else {
    _tokenExpiry = Date.now() + 30 * 60 * 1000;
  }

  return _cachedToken;
}

initLogger(tokenGetter);

/**
 * Frontend Log wrapper. Always uses stack = 'frontend'.
 */
export async function Log(level, packageName, message) {
  await _Log('frontend', level, packageName, message);
}