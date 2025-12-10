import { apiFetch } from './http';

/**
 * API para mediciones de calidad del aire
 */
export const MeasurementAPI = {
  /**
   * Obtiene las últimas mediciones
   */
  async getLatestMeasurements(stationId = null) {
    const endpoint = stationId
      ? `/measurements/latest/?station=${stationId}`
      : '/measurements/latest/';
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Obtiene datos históricos de mediciones
   */
  async getHistoricalData(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = `/measurements/historical/?${queryParams}`;
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Obtiene el AQI (Índice de Calidad del Aire) actual
   */
  async getCurrentAQI(stationId = null) {
    const endpoint = stationId
      ? `/measurements/aqi/?station=${stationId}`
      : '/measurements/aqi/';
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Obtiene estadísticas de una variable
   */
  async getVariableStats(variable, filters = {}) {
    const queryParams = new URLSearchParams({ variable, ...filters }).toString();
    const endpoint = `/measurements/stats/?${queryParams}`;
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Obtiene las variables disponibles
   */
  async getAvailableVariables() {
    return await apiFetch('/measurements/variables/', {
      method: 'GET',
    });
  },
};