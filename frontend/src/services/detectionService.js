import api from './api';

/** Detection service — image upload and disease detection */
export const detectionService = {
  async uploadImage(imageFile, plantPart) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('plant_part', plantPart);
    const { data } = await api.post('/api/detection/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for AI processing
    });
    return data;
  },

  async getResult(id) {
    const { data } = await api.get(`/api/detection/result/${id}`);
    return data;
  },

  async getHistory() {
    const { data } = await api.get('/api/detection/history');
    return data;
  },

  async deleteDetection(id) {
    const { data } = await api.delete(`/api/detection/${id}`);
    return data;
  },
};
