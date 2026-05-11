/**
 * components/NotificationCard.jsx — Material UI card displaying a single notification.
 * Shows type chip, message, time-ago, and seen/unseen state. Click to mark as seen.
 */

import React, { useState } from 'react';
import {
  Card, CardActionArea, CardContent, Box, Typography, Chip,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { markAsSeen, isSeen } from '../state/notificationStore';
import { Log } from '../utils/logger';

// ---------------------------------------------------------------------------
// Type colour map
// ---------------------------------------------------------------------------
const TYPE_COLORS = {
  Placement: 'success',
  Result: 'primary',
  Event: 'warning',
};

/**
 * Returns a human-readable "time ago" string without external libraries.
 * @param {string} timestamp
 * @returns {string}
 */
function timeAgo(timestamp) {
  if (!timestamp) return 'Unknown time';
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

/**
 * @param {{ notification: object, rank?: number, isNew?: boolean }} props
 */
export default function NotificationCard({ notification, rank, isNew }) {
  const id = notification.id || notification._id;
  const [seen, setSeen] = useState(() => isSeen(id));

  function handleClick() {
    if (!seen) {
      markAsSeen(id);
      setSeen(true);
      Log('debug', 'component', `NotificationCard clicked — marked seen: ${id}`);
    }
  }

  const type = notification.type || notification.notification_type || 'Event';
  const chipColor = TYPE_COLORS[type] || 'default';
  const ts = notification.timestamp || notification.created_at;

  return (
    <Card
      elevation={seen ? 0 : 3}
      sx={{
        mb: 1.5,
        opacity: seen ? 0.65 : 1,
        borderLeft: seen ? '4px solid transparent' : `4px solid`,
        borderLeftColor: seen ? 'transparent' : (
          type === 'Placement' ? 'success.main'
            : type === 'Result' ? 'primary.main'
              : 'warning.main'
        ),
        transition: 'all 0.2s ease',
        backgroundColor: isNew ? 'action.hover' : 'background.paper',
      }}
    >
      <CardActionArea onClick={handleClick}>
        <CardContent sx={{ py: 1.5, px: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
            {rank !== undefined && (
              <Chip
                label={`#${rank}`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            )}
            <Chip
              label={type}
              color={chipColor}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {!seen && (
              <FiberManualRecordIcon
                sx={{ fontSize: 10, color: chipColor === 'success' ? 'success.main' : chipColor === 'primary' ? 'primary.main' : 'warning.main', ml: 'auto' }}
              />
            )}
            {isNew && (
              <Chip label="NEW" color="error" size="small" sx={{ ml: 'auto', fontWeight: 700, fontSize: '0.65rem', animation: 'pulse 1.5s infinite' }} />
            )}
          </Box>

          <Typography variant="body1" sx={{ fontWeight: seen ? 400 : 500, lineHeight: 1.5 }}>
            {notification.message}
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {timeAgo(ts)}
          </Typography>

          {notification.finalScore !== undefined && (
            <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
              Priority score: {notification.finalScore.toFixed(3)}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
