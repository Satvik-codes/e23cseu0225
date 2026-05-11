/**
 * pages/PriorityInboxPage.jsx — displays priority-scored notifications.
 * TopNSelector to pick count, type chip group for client-side filtering.
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Skeleton, Alert, Container, Chip, Stack,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { getPriorityNotifications } from '../api/notificationsApi';
import TopNSelector from '../components/TopNSelector';
import NotificationCard from '../components/NotificationCard';
import { Log } from '../utils/logger';

const TYPE_FILTERS = ['All', 'Placement', 'Result', 'Event'];

export default function PriorityInboxPage() {
  const [n, setN] = useState(10);
  const [typeFilter, setTypeFilter] = useState('All');
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Log page mount
  useEffect(() => {
    Log('info', 'page', 'PriorityInboxPage mounted');
  }, []);

  // Fetch when n changes
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPriorityNotifications(n);
        setAllNotifications(data?.notifications || []);
      } catch (err) {
        setError(err.message || 'Failed to load priority notifications');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [n]);

  // Client-side type filter (no new API call)
  const filtered = typeFilter === 'All'
    ? allNotifications
    : allNotifications.filter((notif) => {
      const t = notif.type || notif.notification_type;
      return t === typeFilter;
    });

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <StarIcon fontSize="large" sx={{ color: 'warning.main' }} />
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Priority Inbox
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your most important notifications, ranked by type and recency.
          </Typography>
        </Box>
      </Box>

      {/* TopN Selector */}
      <Box mt={3}>
        <TopNSelector value={n} onChange={(newN) => { setN(newN); setTypeFilter('All'); }} />
      </Box>

      {/* Type chip filter — client-side */}
      <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
        {TYPE_FILTERS.map((type) => (
          <Chip
            key={type}
            label={type}
            onClick={() => setTypeFilter(type)}
            color={typeFilter === type ? 'primary' : 'default'}
            variant={typeFilter === type ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, cursor: 'pointer' }}
          />
        ))}
      </Stack>

      {/* List */}
      {loading ? (
        Array.from({ length: n > 5 ? 5 : n }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={90} sx={{ mb: 1.5, borderRadius: 2 }} />
        ))
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={8}>
          <StarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No notifications here.</Typography>
          <Typography variant="body2" color="text.disabled">
            {typeFilter !== 'All' ? `No ${typeFilter} notifications in top ${n}.` : 'Nothing to show right now.'}
          </Typography>
        </Box>
      ) : (
        filtered.map((notification, idx) => (
          <NotificationCard
            key={notification.id || notification._id || idx}
            notification={notification}
            rank={idx + 1}
          />
        ))
      )}
    </Container>
  );
}
