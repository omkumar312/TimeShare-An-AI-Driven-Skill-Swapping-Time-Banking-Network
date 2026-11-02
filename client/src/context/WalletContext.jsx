import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const showToast = useCallback((message, type = 'info', amount = null) => {
    setToast({ id: Date.now(), message, type, amount });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }, []);

  const fetchWallet = useCallback(async () => {
    if (!user) {
      setWallet(null);
      setTransactions([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.getWallet();
      setWallet(res.wallet);
      setTransactions(res.transactions);
    } catch (err) {
      console.error('[Wallet] Failed to fetch wallet:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('[Wallet] Failed to fetch notifications:', err);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.markNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('[Wallet] Failed to mark notifications as read:', err);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchNotifications();
  }, [fetchWallet, fetchNotifications]);

  // Socket event listeners for real-time wallet & notifications
  useEffect(() => {
    const socket = getSocket();

    const handleWalletUpdated = (payload) => {
      fetchWallet();
      fetchNotifications();
      if (payload.transaction) {
        const sign = payload.transaction.amount > 0 ? '+' : '';
        const msg = `${payload.transaction.description || payload.transaction.reason} (${sign}${payload.transaction.amount} Credits)`;
        showToast(msg, payload.transaction.amount > 0 ? 'success' : 'info', payload.transaction.amount);
      }
    };

    const handleRoyalty = (payload) => {
      showToast(
        `🎉 Creator Royalty! ${payload.learnerName} completed "${payload.videoTitle}". +${payload.amount} Credits!`,
        'success',
        payload.amount
      );
      fetchWallet();
    };

    socket.on('wallet:updated', handleWalletUpdated);
    socket.on('creator:royalty_earned', handleRoyalty);

    const handleNewVideoPublished = (payload) => {
      if (payload.status === 'APPROVED') {
        showToast(
          `🔔 ${payload.creatorName} uploaded a new skill: "${payload.title}"! Available to learn now.`,
          'info'
        );
      }
    };
    socket.on('platform:new_video', handleNewVideoPublished);

    return () => {
      socket.off('wallet:updated', handleWalletUpdated);
      socket.off('creator:royalty_earned', handleRoyalty);
      socket.off('platform:new_video', handleNewVideoPublished);
    };
  }, [fetchWallet, fetchNotifications, showToast]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        transactions,
        notifications,
        unreadCount,
        toast,
        loading,
        fetchWallet,
        fetchNotifications,
        markAllRead,
        showToast,
        closeToast: () => setToast(null)
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
