/**
 * utils/priorityInbox.js — Priority inbox scoring algorithm.
 * Scores notifications by type weight + recency decay, returns top N.
 * Can be required as a module or executed directly with `node priorityInbox.js`.
 */

'use strict';

// ---------------------------------------------------------------------------
// Type weight constants
// ---------------------------------------------------------------------------
const TYPE_WEIGHTS = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Computes the recency score for a notification.
 * Uses exponential decay: score = 1 / (1 + ageInMinutes / 60)
 * Newer notifications score closer to 1, older ones closer to 0.
 * @param {string|Date} timestamp - ISO string or Date object
 * @returns {number} recency score in [0, 1]
 */
function computeRecencyScore(timestamp) {
  const createdAt = new Date(timestamp).getTime();
  const now = Date.now();
  const ageInMinutes = Math.max(0, (now - createdAt) / 60000);
  return 1 / (1 + ageInMinutes / 60);
}

/**
 * Computes the final priority score for a notification.
 * finalScore = weight * 10 + recencyScore * 5
 * @param {object} notification - must have .type and .timestamp (or .created_at)
 * @returns {number}
 */
function computeScore(notification) {
  const type = notification.type || notification.notification_type || 'Event';
  const weight = TYPE_WEIGHTS[type] || 1;
  const ts = notification.timestamp || notification.created_at || new Date().toISOString();
  const recencyScore = computeRecencyScore(ts);
  return weight * 10 + recencyScore * 5;
}

/**
 * Returns the top N notifications sorted by priority score descending.
 * @param {Array<object>} notifications - array of notification objects
 * @param {number} n - number of top notifications to return (default 10)
 * @returns {Array<object>} sorted notifications with finalScore attached
 */
function getTopN(notifications, n = 10) {
  if (!Array.isArray(notifications) || notifications.length === 0) return [];

  const scored = notifications.map((notif) => ({
    ...notif,
    finalScore: computeScore(notif),
  }));

  scored.sort((a, b) => b.finalScore - a.finalScore);

  return scored.slice(0, n);
}

module.exports = { getTopN, computeScore, computeRecencyScore };

// ---------------------------------------------------------------------------
// Self-contained demo — runs only when executed directly with `node priorityInbox.js`
// ---------------------------------------------------------------------------
if (require.main === module) {
  // Generate 25 sample notifications with varied types and timestamps
  const now = Date.now();
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;

  const sampleNotifications = [
    { id: '1',  type: 'Placement', message: 'Google on-campus drive: Register by 5 PM today',         timestamp: new Date(now - 10 * MINUTE).toISOString() },
    { id: '2',  type: 'Result',    message: 'Semester 6 results declared — check your portal',         timestamp: new Date(now - 2 * HOUR).toISOString() },
    { id: '3',  type: 'Event',     message: 'Annual Tech Fest registration opens tomorrow',             timestamp: new Date(now - 5 * HOUR).toISOString() },
    { id: '4',  type: 'Placement', message: 'Microsoft pre-placement talk at 3 PM in Auditorium',      timestamp: new Date(now - 30 * MINUTE).toISOString() },
    { id: '5',  type: 'Result',    message: 'Internal marks for CSE410 uploaded',                       timestamp: new Date(now - 6 * HOUR).toISOString() },
    { id: '6',  type: 'Event',     message: 'Hackathon 2026 — team registrations now open',            timestamp: new Date(now - 1 * HOUR).toISOString() },
    { id: '7',  type: 'Placement', message: 'Amazon SDE-1 openings — apply via placement portal',      timestamp: new Date(now - 45 * MINUTE).toISOString() },
    { id: '8',  type: 'Result',    message: 'Supplementary exam results for backlog students',         timestamp: new Date(now - 12 * HOUR).toISOString() },
    { id: '9',  type: 'Event',     message: 'Guest lecture by IIT Delhi alumni — Hall 3 at 11 AM',    timestamp: new Date(now - 3 * HOUR).toISOString() },
    { id: '10', type: 'Placement', message: 'Infosys walk-in interview on Friday — bring all docs',    timestamp: new Date(now - 20 * MINUTE).toISOString() },
    { id: '11', type: 'Result',    message: 'CSE301 re-evaluation results now live',                   timestamp: new Date(now - 4 * HOUR).toISOString() },
    { id: '12', type: 'Event',     message: 'Orientation for new batch — students must attend',        timestamp: new Date(now - 2 * HOUR).toISOString() },
    { id: '13', type: 'Placement', message: 'Wipro NTH campus drive — slot booking closes midnight',   timestamp: new Date(now - 5 * MINUTE).toISOString() },
    { id: '14', type: 'Result',    message: 'BCA 4th sem results published on university site',        timestamp: new Date(now - 8 * HOUR).toISOString() },
    { id: '15', type: 'Event',     message: 'Sports Day 2026 schedule announced — check notice board', timestamp: new Date(now - 24 * HOUR).toISOString() },
    { id: '16', type: 'Placement', message: 'Deloitte off-campus hackathon — cash prize 1 lakh',       timestamp: new Date(now - 15 * MINUTE).toISOString() },
    { id: '17', type: 'Result',    message: 'Grade improvement form deadline is this Friday',          timestamp: new Date(now - 7 * HOUR).toISOString() },
    { id: '18', type: 'Event',     message: 'Cultural night: volunteers needed — contact CR',          timestamp: new Date(now - 10 * HOUR).toISOString() },
    { id: '19', type: 'Placement', message: 'TCS NQT results out — shortlisted students check email',  timestamp: new Date(now - 1 * HOUR).toISOString() },
    { id: '20', type: 'Result',    message: 'Physics lab viva marks uploaded by department',           timestamp: new Date(now - 3 * HOUR).toISOString() },
    { id: '21', type: 'Event',     message: 'Farewell party for final year — Hall 7 on Saturday',     timestamp: new Date(now - 48 * HOUR).toISOString() },
    { id: '22', type: 'Placement', message: 'HCL Technologies — 3 openings for CSE 2025 batch',       timestamp: new Date(now - 2 * MINUTE).toISOString() },
    { id: '23', type: 'Result',    message: 'DSA Assignment 3 graded — check LMS',                    timestamp: new Date(now - 30 * MINUTE).toISOString() },
    { id: '24', type: 'Event',     message: 'Workshop on Cloud Computing — free registration',         timestamp: new Date(now - 6 * HOUR).toISOString() },
    { id: '25', type: 'Placement', message: 'Adobe internship — apply before 11:59 PM today',          timestamp: new Date(now - 55 * MINUTE).toISOString() },
  ];

  const top10 = getTopN(sampleNotifications, 10);

  // -------------------------------------------------------------------------
  // Formatted table output
  // -------------------------------------------------------------------------
  const COL_WIDTHS = { rank: 4, type: 10, score: 8, time: 25, message: 55 };

  const pad = (str, len) => String(str).slice(0, len).padEnd(len);
  const divider = '+' + [
    '-'.repeat(COL_WIDTHS.rank + 2),
    '-'.repeat(COL_WIDTHS.type + 2),
    '-'.repeat(COL_WIDTHS.score + 2),
    '-'.repeat(COL_WIDTHS.time + 2),
    '-'.repeat(COL_WIDTHS.message + 2),
  ].join('+') + '+';

  process.stdout.write('\n  PRIORITY INBOX — TOP 10 NOTIFICATIONS\n');
  process.stdout.write(divider + '\n');
  process.stdout.write(
    '| ' + pad('Rank', COL_WIDTHS.rank) +
    ' | ' + pad('Type', COL_WIDTHS.type) +
    ' | ' + pad('Score', COL_WIDTHS.score) +
    ' | ' + pad('Timestamp', COL_WIDTHS.time) +
    ' | ' + pad('Message', COL_WIDTHS.message) +
    ' |\n'
  );
  process.stdout.write(divider + '\n');

  top10.forEach((n, idx) => {
    const rank = `#${idx + 1}`;
    const type = n.type || 'Unknown';
    const score = n.finalScore.toFixed(4);
    const time = n.timestamp || n.created_at;
    const msg = n.message;

    process.stdout.write(
      '| ' + pad(rank, COL_WIDTHS.rank) +
      ' | ' + pad(type, COL_WIDTHS.type) +
      ' | ' + pad(score, COL_WIDTHS.score) +
      ' | ' + pad(time, COL_WIDTHS.time) +
      ' | ' + pad(msg, COL_WIDTHS.message) +
      ' |\n'
    );
  });

  process.stdout.write(divider + '\n\n');
}
