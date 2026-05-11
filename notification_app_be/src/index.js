/**
 * src/index.js — main entry point for the Express + Socket.IO backend server.
 * Creates the HTTP server, attaches Socket.IO, mounts all routes, and starts listening.
 */

'use strict';

require('dotenv').config();

// Config is loaded first — will throw if any required env var is missing
const config = require('./config/env');

// This initialises the logger before anything else uses Log()
const { getToken } = require('./auth/tokenService');
const { Log } = require('@campus/logger');

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const apiRouter = require('./routes/notifications');
const { setEmitter } = require('./services/notificationService');

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------
const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Authorization', 'Content-Type'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// HTTP server + Socket.IO
// ---------------------------------------------------------------------------
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
  },
});

// ---------------------------------------------------------------------------
// Socket.IO events
// ---------------------------------------------------------------------------
io.on('connection', (socket) => {
  Log('backend', 'info', 'middleware', `Socket.IO client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    Log('backend', 'warn', 'middleware', `Socket.IO client disconnected: ${socket.id}`);
  });
});

/**
 * Broadcasts a new_notification event to all connected Socket.IO clients.
 * @param {object} notification
 */
function emitNotification(notification) {
  io.emit('new_notification', notification);
}

// Register the emitter with the service layer
setEmitter(emitNotification);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api', apiRouter);

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use(async (err, req, res, _next) => {
  await Log('backend', 'fatal', 'handler', `Unhandled server error: ${err.message}`);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
async function start() {
  // Listen immediately so the port is bound before any async auth calls
  httpServer.listen(config.port, () => {
    Log('backend', 'info', 'config', `Server started on port ${config.port}`);
  });

  // Warm up the token cache in the background — errors are non-fatal
  getToken().catch((err) => {
    Log('backend', 'error', 'config', `Startup token warm-up failed — will retry on first request: ${err.message}`);
  });
}

start().catch((err) => {
  Log('backend', 'fatal', 'config', `Failed to start server: ${err.message}`);
  process.exit(1);
});
