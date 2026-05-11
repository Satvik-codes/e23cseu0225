/**
 * middleware/requestLogger.js — Express middleware that logs every incoming request
 * and the resulting response status code via the shared @campus/logger package.
 */

'use strict';

const { Log } = require('@campus/logger');

/**
 * Logs the HTTP method, route, and response status for every request.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestLogger(req, res, next) {
  const { method, path: routePath } = req;

  Log('backend', 'info', 'middleware', `Incoming request: ${method} ${routePath}`);

  // Log the response status after the handler finishes
  res.on('finish', () => {
    Log('backend', 'info', 'middleware', `Response sent: ${method} ${routePath} — status ${res.statusCode}`);
  });

  next();
}

module.exports = requestLogger;
