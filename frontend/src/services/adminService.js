import api from './api';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/** Admin service */
export const adminService = {
  async getUsers(page = 1, limit = 20) {
    const { data } = await api.get(`/api/admin/users?page=${page}&limit=${limit}`);
    return data;
  },

  async toggleUserStatus(id) {
    const { data } = await api.put(`/api/admin/users/${id}/status`);
    return data;
  },

  async deleteUser(id) {
    const { data } = await api.delete(`/api/admin/users/${id}`);
    return data;
  },

  async getStats() {
    const { data } = await api.get('/api/admin/stats');
    return data;
  },

  async getPredictions(page = 1) {
    const { data } = await api.get(`/api/admin/predictions?page=${page}`);
    return data;
  },

  async getDiseaseStats() {
    const { data } = await api.get('/api/admin/disease-stats');
    return data;
  },

  exportPredictions() {
    const token = localStorage.getItem('tc_access_token');
    window.open(`${BASE_URL}/api/admin/export/predictions?token=${token}`, '_blank');
  },

  exportUsers() {
    const token = localStorage.getItem('tc_access_token');
    window.open(`${BASE_URL}/api/admin/export/users?token=${token}`, '_blank');
  },
};
