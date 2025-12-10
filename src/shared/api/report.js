import { apiFetch } from './http';

/**
 * API para reportes
 */
export const ReportAPI = {
  /**
   * Obtiene la lista de reportes
   */
  async getReports(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/reports/?${queryParams}` : '/reports/';
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Genera un nuevo reporte
   */
  async generateReport(reportData) {
    return await apiFetch('/reports/generate/', {
      method: 'POST',
      body: reportData,
    });
  },

  /**
   * Descarga un reporte en PDF
   */
  async downloadReport(reportId) {
    return await apiFetch(`/reports/${reportId}/download/`, {
      method: 'GET',
    });
  },

  /**
   * Obtiene reportes de calidad del aire
   */
  async getAirQualityReports(filters = {}) {
    const queryParams = new URLSearchParams({ ...filters, type: 'air_quality' }).toString();
    return await apiFetch(`/reports/?${queryParams}`, {
      method: 'GET',
    });
  },

  /**
   * Obtiene reportes de tendencias
   */
  async getTrendsReports(filters = {}) {
    const queryParams = new URLSearchParams({ ...filters, type: 'trends' }).toString();
    return await apiFetch(`/reports/?${queryParams}`, {
      method: 'GET',
    });
  },

  /**
   * Obtiene reportes de alertas críticas
   */
  async getCriticalAlertsReports(filters = {}) {
    const queryParams = new URLSearchParams({ ...filters, type: 'critical_alerts' }).toString();
    return await apiFetch(`/reports/?${queryParams}`, {
      method: 'GET',
    });
  },
};
