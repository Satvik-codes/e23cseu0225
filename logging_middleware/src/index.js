/**
 * @campus/logger — shared logging middleware for the campus notification platform.
 * Sends structured log entries to the evaluation service via POST request.
 * Must be initialised with initLogger(tokenGetter) before any Log() calls.
 */

'use strict';

const https = require('https');
const http = require('http');
const { URL } = require('url');

// ---------------------------------------------------------------------------
// Accepted constraint values
// ---------------------------------------------------------------------------
const VALID_STACKS = new Set(['backend', 'frontend']);

const VALID_LEVELS = new Set(['debug', 'info', 'warn', 'error', 'fatal']);

const VALID_PACKAGES = new Set([
  // backend
  'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
  // frontend
  'api', 'component', 'hook', 'page', 'state', 'style',
  // shared
  'auth', 'config', 'middleware', 'utils',
]);

// ---------------------------------------------------------------------------
// Module-level token getter — set by initLogger()
// ---------------------------------------------------------------------------
let _tokenGetter = null;

/**
 * Initialises the logger with a token getter function.
 * Must be called once at startup before any Log() calls.
 * @param {Function} tokenGetter - async function that returns a Bearer token string
 */
function initLogger(tokenGetter) {
  if (typeof tokenGetter !== 'function') {
    throw new Error('[campus/logger] initLogger requires an async function as argument');
  }
  _tokenGetter = tokenGetter;
}

/**
 * Sends a raw HTTP POST without relying on axios (to avoid circular deps).
 * Fire-and-forget — never throws.
 * @param {string} urlString - full URL to POST to
 * @param {string} token - Bearer token
 * @param {object} body - JSON payload
 */
function _post(urlString, token, body) {
  try {
    const parsed = new URL(urlString);
    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;

    const payload = JSON.stringify(body);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Authorization': `Bearer ${token}`,
      },
    };

    const req = transport.request(options, (res) => {
      // Drain the response to free the socket
      res.resume();
    });

    req.on('error', () => { /* fire-and-forget — swallow errors */ });
    req.setTimeout(8000, () => { req.destroy(); });
    req.write(payload);
    req.end();
  } catch (_err) {
    // Never crash the calling application
  }
}

/**
 * Sends a structured log entry to the evaluation service.
 * Fire-and-forget — never throws, never crashes the caller.
 * @param {string} stack      - 'backend' | 'frontend'
 * @param {string} level      - 'debug' | 'info' | 'warn' | 'error' | 'fatal'
 * @param {string} packageName - one of the accepted package values
 * @param {string} message    - human-readable log message
 */
async function Log(stack, level, packageName, message) {
  try {
    // Runtime validation
    if (!VALID_STACKS.has(stack)) return;
    if (!VALID_LEVELS.has(level)) return;
    if (!VALID_PACKAGES.has(packageName)) return;
    if (!_tokenGetter) return;

    const logsUrl = process.env.LOGS_URL || 'http://4.224.186.213/evaluation-service/logs';

    let token;
    try {
      token = await _tokenGetter();
    } catch (_err) {
      return; // no token — silently skip
    }

    const body = {
      stack,
      level,
      package: packageName,
      message: String(message),
      timestamp: new Date().toISOString(),
    };

    _post(logsUrl, token, body);
  } catch (_err) {
    // Never crash the caller
  }
}

module.exports = { initLogger, Log };
module.exports.default = { initLogger, Log };
