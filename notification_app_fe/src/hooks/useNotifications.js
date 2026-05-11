/**
 * hooks/useNotifications.js — custom React hook for fetching and managing notifications.
 * Connects to Socket.IO for real-time updates and handles reconnection automatically.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { getAllNotifications } from '../api/notificationsApi';
import { Log } from '../utils/logger';

const SOCKET_URL = 'http://localhost:5000';

/**
 * @param {{ page?: number, limit?: number, notificationType?: string }} params
 * @returns {{ notifications: Array, loading: boolean, error: string|null, totalCount: number, newIds: Set, refetch: Function }}
 */
export function useNotifications({ page = 1, limit = 10, notificationType = '' } = {}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [newIds, setNewIds] = useState(new Set());

  const socketRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (notificationType && notificationType !== 'All') {
        params.notification_type = notificationType;
      }
      const data = await getAllNotifications(params);
      const items = data?.notifications || [];
      setNotifications(items);
      setTotalCount(data?.total || data?.totalCount || items.length);
      await Log('info', 'hook', `useNotifications fetched ${items.length} notifications (page ${page})`);
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      await Log('error', 'hook', `useNotifications fetch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [page, limit, notificationType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Socket.IO — real-time updates
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      Log('info', 'hook', 'Socket.IO connected to backend');
    });

    socket.on('new_notification', (notification) => {
      const notifId = notification?.id || notification?._id || notification?.ID;
      Log('info', 'hook', `New real-time notification received: ${notifId}`);
      setNotifications((prev) => [notification, ...prev]);
      setNewIds((prev) => new Set([...prev, notifId]));
    });

    socket.on('reconnect_attempt', (attempt) => {
      Log('warn', 'hook', `Socket.IO reconnection attempt #${attempt}`);
    });

    socket.on('disconnect', () => {
      Log('warn', 'hook', 'Socket.IO disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { notifications, loading, error, totalCount, newIds, refetch: fetchData };
}
