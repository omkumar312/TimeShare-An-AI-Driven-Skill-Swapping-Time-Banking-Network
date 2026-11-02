import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('timeshare_token') || null);
  const [unlockedVideoIds, setUnlockedVideoIds] = useState([]);
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial profile if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          setUnlockedVideoIds(res.unlockedVideoIds || []);
          const socket = getSocket();
          socket.emit('join:user', res.user.id);
        } catch (err) {
          console.error('[Auth] Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    }

    loadUser();
  }, [token]);

  // Load demo users list
  useEffect(() => {
    async function fetchDemoUsers() {
      try {
        const users = await api.getDemoUsers();
        setDemoUsers(users);
      } catch (err) {
        console.error('[Auth] Failed to load demo users:', err);
      }
    }
    fetchDemoUsers();
  }, []);

  // Listen to socket wallet updates to keep user credits live
  useEffect(() => {
    const socket = getSocket();

    const handleWalletUpdated = (payload) => {
      setUser(prev => {
        if (!prev) return prev;
        return { ...prev, credits: payload.credits };
      });
    };

    socket.on('wallet:updated', handleWalletUpdated);

    return () => {
      socket.off('wallet:updated', handleWalletUpdated);
    };
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('timeshare_token', res.token);
    setToken(res.token);
    setUser(res.user);
    const socket = getSocket();
    socket.emit('join:user', res.user.id);
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('timeshare_token', res.token);
    setToken(res.token);
    setUser(res.user);
    const socket = getSocket();
    socket.emit('join:user', res.user.id);
    return res;
  };

  const switchDemoUser = async (email) => {
    try {
      const res = await api.demoLogin({ email });
      localStorage.setItem('timeshare_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setUnlockedVideoIds(res.unlockedVideoIds || []);
      const socket = getSocket();
      socket.emit('join:user', res.user.id);
      return res;
    } catch (err) {
      console.error('[Auth] Demo login error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('timeshare_token');
    setToken(null);
    setUser(null);
    setUnlockedVideoIds([]);
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
      setUnlockedVideoIds(res.unlockedVideoIds || []);
    } catch (e) {
      console.error('[Auth] Refresh user error:', e);
    }
  };

  const addUnlockedVideo = (videoId) => {
    setUnlockedVideoIds(prev => [...prev, videoId]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoUsers,
        unlockedVideoIds,
        login,
        register,
        logout,
        switchDemoUser,
        refreshUser,
        addUnlockedVideo,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
