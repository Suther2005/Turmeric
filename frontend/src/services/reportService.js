import api from './api';

/** Reports service */
export const reportService = {
  async generateReport(predictionId, soilAnalysisId) {
    const { data } = await api.post('/api/reports/generate', {
      prediction_id: predictionId,
      soil_analysis_id: soilAnalysisId,
    });
    return data;
  },

  async getReports() {
    const { data } = await api.get('/api/reports');
    return data;
  },

  async getReport(id) {
    const { data } = await api.get(`/api/reports/${id}`);
    return data;
  },

  async downloadReport(id) {
    const { data } = await api.get(`/api/reports/${id}/download`, {
      responseType: 'blob',
    });

    const blob = new Blob([data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `TurmeriCare_Report_${id}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  },

  async deleteReport(id) {
    const { data } = await api.delete(`/api/reports/${id}`);
    return data;
  },
};
