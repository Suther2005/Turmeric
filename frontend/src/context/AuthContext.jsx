import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider – manages JWT auth state, login/logout, and user persistence.
 * Wraps the app so any component can access auth via useAuth().
 */
export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null);
  const [token, setToken]       = useState(() => localStorage.getItem('tc_access_token'));
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // On mount: validate stored token and fetch user profile
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('tc_access_token');
      if (storedToken) {
        try {
          const userData = await authService.getMe(storedToken);
          setUser(userData);
          setToken(storedToken);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('tc_access_token');
          localStorage.removeItem('tc_refresh_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const { user: userData, access_token, refresh_token } = await authService.login(email, password);
    localStorage.setItem('tc_access_token', access_token);
    localStorage.setItem('tc_refresh_token', refresh_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    setError(null);
    const { user: userData, access_token, refresh_token } = await authService.register(name, email, password);
    localStorage.setItem('tc_access_token', access_token);
    localStorage.setItem('tc_refresh_token', refresh_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tc_access_token');
    localStorage.removeItem('tc_refresh_token');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to consume AuthContext */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
