import api from './api';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** Auth service — all user auth API calls */
export const authService = {
  async login(email, password) {
    const { data } = await api.post('/api/auth/login', { email, password });
    return data;
  },

  async register(name, email, password) {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    return data;
  },

  async getMe(token) {
    const { data } = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.user;
  },

  async updateProfile(profileData) {
    const { data } = await api.put('/api/auth/profile', profileData);
    return data;
  },

  async changePassword(oldPassword, newPassword) {
    const { data } = await api.put('/api/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return data;
  },

  async forgotPassword(email) {
    const { data } = await api.post('/api/auth/forgot-password', { email });
    return data;
  },
};
