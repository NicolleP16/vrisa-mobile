import { apiFetch } from './http';

/**
 * API para gestión de sensores
 */
export const SensorAPI = {
  /**
   * Obtiene todos los sensores
   */
  async getSensors() {
    return await apiFetch('/sensors/', {
      method: 'GET',
    });
  },

  /**
   * Obtiene un sensor por ID
   */
  async getSensorById(sensorId) {
    return await apiFetch(`/sensors/${sensorId}/`, {
      method: 'GET',
    });
  },

  /**
   * Obtiene los sensores de una estación
   */
  async getSensorsByStation(stationId) {
    return await apiFetch(`/stations/${stationId}/sensors/`, {
      method: 'GET',
    });
  },

  /**
   * Crea un registro de mantenimiento
   */
  async createMaintenanceLog(maintenanceData) {
    return await apiFetch('/maintenance-logs/', {
      method: 'POST',
      body: maintenanceData,
    });
  },

  /**
   * Obtiene los registros de mantenimiento
   */
  async getMaintenanceLogs(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/maintenance-logs/?${queryParams}` : '/maintenance-logs/';
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Obtiene un registro de mantenimiento por ID
   */
  async getMaintenanceLogById(logId) {
    return await apiFetch(`/maintenance-logs/${logId}/`, {
      method: 'GET',
    });
  },
};
