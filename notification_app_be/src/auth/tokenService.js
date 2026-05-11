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
  return await getToken({ suppressLog: true });
});

/**
 * Returns a valid Bearer token string.
 * Uses the cache if the token is still fresh, otherwise fetches a new one.
 * @returns {Promise<string>}
 */
async function getToken(options = {}) {
  const { suppressLog = false } = options;
  const now = Date.now();

  // Return cached token if it is still valid
  if (_cachedToken && now < _tokenExpiry - SAFETY_BUFFER_MS) {
    if (!suppressLog) {
      await Log('backend', 'debug', 'auth', 'Returning cached token');
    }
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

    const { token, access_token: accessToken, expiresIn, expires_in: expiresInRaw } = response.data;
    const resolvedToken = token || accessToken;

    if (!resolvedToken) throw new Error('Auth response did not contain a token');

    _cachedToken = resolvedToken;
    // Supports both relative expiresIn(seconds) and absolute expires_in(epoch seconds).
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (typeof expiresInRaw === 'number' && expiresInRaw > nowSeconds) {
      _tokenExpiry = expiresInRaw * 1000;
    } else if (typeof expiresIn === 'number') {
      _tokenExpiry = Date.now() + expiresIn * 1000;
    } else if (typeof expiresInRaw === 'number') {
      _tokenExpiry = Date.now() + expiresInRaw * 1000;
    } else {
      _tokenExpiry = Date.now() + 60 * 60 * 1000;
    }

    if (!suppressLog) {
      await Log('backend', 'info', 'auth', 'New token fetched and cached successfully');
    }
    return _cachedToken;
  } catch (err) {
    if (!suppressLog) {
      await Log('backend', 'error', 'auth', `Failed to fetch auth token: ${err.message}`);
    }
    throw new Error(`[tokenService] Authentication failed: ${err.message}`);
  }
}

module.exports = { getToken };
