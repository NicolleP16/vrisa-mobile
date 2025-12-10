import { apiFetch } from './http';

/**
 * API para gestión de estaciones de monitoreo
 */
export const StationAPI = {
  /**
   * Obtiene todas las estaciones
   */
  async getStations() {
    return await apiFetch('/stations/', {
      method: 'GET',
    });
  },

  /**
   * Obtiene una estación por ID
   */
  async getStationById(stationId) {
    return await apiFetch(`/stations/${stationId}/`, {
      method: 'GET',
    });
  },

  /**
   * Registra una nueva estación
   */
  async registerStation(stationData) {
    return await apiFetch('/stations/register/', {
      method: 'POST',
      body: stationData,
    });
  },

  /**
   * Actualiza una estación
   */
  async updateStation(stationId, stationData) {
    return await apiFetch(`/stations/${stationId}/`, {
      method: 'PUT',
      body: stationData,
    });
  },

  /**
   * Obtiene las estaciones del usuario actual
   */
  async getMyStations() {
    return await apiFetch('/stations/my-stations/', {
      method: 'GET',
    });
  },
};