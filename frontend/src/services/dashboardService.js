import api from './api';

/** Dashboard service */
export const dashboardService = {
  async getStats() {
    const { data } = await api.get('/api/dashboard/stats');
    return data;
  },

  async getRecent() {
    const { data } = await api.get('/api/dashboard/recent');
    return data;
  },

  async getAlerts() {
    const { data } = await api.get('/api/dashboard/alerts');
    return data;
  },
};
