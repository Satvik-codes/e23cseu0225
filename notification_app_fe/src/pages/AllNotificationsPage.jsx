/**
 * pages/AllNotificationsPage.jsx — displays all notifications with filters, pagination,
 * and real-time Socket.IO banner for new arrivals.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Pagination, Skeleton, Alert, Collapse, Badge,
  Container,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../hooks/useNotifications';
import { countUnseen } from '../state/notificationStore';
import FilterBar from '../components/FilterBar';
import NotificationCard from '../components/NotificationCard';
import { Log } from '../utils/logger';

export default function AllNotificationsPage() {
  const [filters, setFilters] = useState({ notificationType: 'All', limit: 10, page: 1 });
  const [showBanner, setShowBanner] = useState(false);
  const [bannerTimer, setBannerTimer] = useState(null);

  const { notifications, loading, error, totalCount, newIds } = useNotifications({
    page: filters.page,
    limit: filters.limit,
    notificationType: filters.notificationType,
  });

  // Log page mount
  useEffect(() => {
    Log('info', 'page', 'AllNotificationsPage mounted');
  }, []);

  // Show banner when newIds has items
  useEffect(() => {
    if (newIds.size > 0) {
      setShowBanner(true);
      if (bannerTimer) clearTimeout(bannerTimer);
      const timer = setTimeout(() => setShowBanner(false), 4000);
      setBannerTimer(timer);
    }
    return () => { if (bannerTimer) clearTimeout(bannerTimer); };
  }, [newIds.size]);

  // Warn if filters return no results
  useEffect(() => {
    if (!loading && notifications.length === 0 && filters.notificationType !== 'All') {
      Log('warn', 'page', `Filter "${filters.notificationType}" produced no results`);
    }
  }, [loading, notifications.length, filters.notificationType]);

  const totalPages = Math.max(1, Math.ceil(totalCount / filters.limit));
  const unseenCount = countUnseen(notifications);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
  }

  function handlePageChange(_e, newPage) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Badge badgeContent={unseenCount} color="error" max={99}>
          <NotificationsIcon fontSize="large" color="primary" />
        </Badge>
        <Box>
          <Typography variant="h4" component="h1" fontWeight={700}>
            All Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unseenCount > 0 ? `${unseenCount} unread` : 'All caught up!'}
          </Typography>
        </Box>
      </Box>

      {/* Real-time new notification banner */}
      <Collapse in={showBanner}>
        <Alert
          severity="info"
          sx={{
            mb: 2,
            animation: 'fadeInDown 0.3s ease',
            '@keyframes fadeInDown': {
              from: { opacity: 0, transform: 'translateY(-10px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          🔔 New notification received in real-time!
        </Alert>
      </Collapse>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Notification List */}
      {loading ? (
        Array.from({ length: filters.limit > 5 ? 5 : filters.limit }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={90} sx={{ mb: 1.5, borderRadius: 2 }} />
        ))
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load notifications: {error}
        </Alert>
      ) : notifications.length === 0 ? (
        <Box textAlign="center" py={8}>
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No notifications yet.</Typography>
          <Typography variant="body2" color="text.disabled">
            {filters.notificationType !== 'All'
              ? `No ${filters.notificationType} notifications match your filters.`
              : 'Check back soon for updates.'}
          </Typography>
        </Box>
      ) : (
        notifications.map((notification) => (
          <NotificationCard
            key={notification.id || notification._id}
            notification={notification}
            isNew={newIds.has(notification.id || notification._id)}
          />
        ))
      )}

      {/* Pagination */}
      {!loading && !error && notifications.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
}
