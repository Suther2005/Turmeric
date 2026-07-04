import api from './api';

/** Soil analysis service */
export const soilService = {
  async analyze(params) {
    const { data } = await api.post('/api/soil/analyze', params);
    return data;
  },

  async getHistory() {
    const { data } = await api.get('/api/soil/history');
    return data;
  },

  async getAnalysis(id) {
    const { data } = await api.get(`/api/soil/${id}`);
    return data;
  },
};
