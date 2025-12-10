import { apiFetch } from "./http";

/**
 * Obtiene el listado de variables de medición disponibles.
 * Endpoint: /api/measurements/variables/
 */
export const getVariables = () => {
  return apiFetch("/measurements/variables/");
};

/**
 * Obtiene datos históricos de mediciones.
 * @param {Object} filters
 */
export const getHistoricalData = (filters) => {
  // Convierte el objeto filters a query string
  const params = new URLSearchParams(filters).toString();
  return apiFetch(`/measurements/data/history/?${params}`);
};

/**
 * Obtiene el índice de calidad del aire (AQI) actual para una estación dada.
 * @param {number} stationId - ID de la estación.
 * @returns {Promise<object>} Datos del AQI actual.
 */
export const getCurrentAQI = (stationId) => {
  const queryString = stationId ? `?station_id=${stationId}` : '';
  return apiFetch(`/measurements/aqi/current/${queryString}`);
};

export const MeasurementAPI = {
  getVariables,
  getHistoricalData,
  getCurrentAQI,
};