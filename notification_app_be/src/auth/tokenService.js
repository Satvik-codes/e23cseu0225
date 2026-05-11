/**
 * auth/tokenService.js — single source of truth for the Bearer token.
 * Caches the token and refreshes it automatically when it expires.
 * Initialises the shared @campus/logger package.
 */

'use strict';

const axios = require('axios');
const { initLogger, Log } = require('@campus/logger');
const config = require('../config/env');

// ---------------------------------------------------------------------------
// Module-level token cache
// ---------------------------------------------------------------------------
let _cachedToken = null;
let _tokenExpiry = 0; // Unix ms timestamp when the token expires
const SAFETY_BUFFER_MS = 60 * 1000; // 60-second buffer before actual expiry

// ---------------------------------------------------------------------------
// Bootstrap: initialise logger with this token getter
// The token getter passed to initLogger must not itself call Log (avoid
// circular dependency during the very first fetch).
// ---------------------------------------------------------------------------
initLogger(async () => {
  return await getToken();
});

/**
 * Returns a valid Bearer token string.
 * Uses the cache if the token is still fresh, otherwise fetches a new one.
 * @returns {Promise<string>}
 */
async function getToken() {
  const now = Date.now();

  // Return cached token if it is still valid
  if (_cachedToken && now < _tokenExpiry - SAFETY_BUFFER_MS) {
    await Log('backend', 'debug', 'auth', 'Returning cached token');
    return _cachedToken;
  }

  // Fetch a new token
  try {
    const response = await axios.post(
      config.authUrl,
      {
        email: config.clientEmail,
        name: config.clientName,
        rollNo: config.clientRollNo,
        accessCode: config.clientAccessCode,
        clientID: config.clientId,
        clientSecret: config.clientSecret,
      },
      { timeout: 10000 }
    );

    const { token, expiresIn } = response.data;

    if (!token) throw new Error('Auth response did not contain a token');

    _cachedToken = token;
    // expiresIn is expected in seconds; fall back to 1 hour if not provided
    const expiresInMs = expiresIn ? expiresIn * 1000 : 60 * 60 * 1000;
    _tokenExpiry = Date.now() + expiresInMs;

    await Log('backend', 'info', 'auth', 'New token fetched and cached successfully');
    return _cachedToken;
  } catch (err) {
    await Log('backend', 'error', 'auth', `Failed to fetch auth token: ${err.message}`);
    throw new Error(`[tokenService] Authentication failed: ${err.message}`);
  }
}

module.exports = { getToken };
