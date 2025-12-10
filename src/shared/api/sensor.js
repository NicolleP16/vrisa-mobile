import { apiFetch } from "./http";

/**
 * Obtiene la lista de sensores de las estaciones del usuario.
 * El backend filtra automáticamente por las estaciones gestionadas.
 * Endpoint: GET /api/sensors/devices/
 * @returns {Promise<Array>} Lista de sensores
 */
export const getSensors = () => {
  return apiFetch("/sensors/devices/");
};

/**
 * Crea un nuevo sensor.
 * Endpoint: POST /api/sensors/devices/
 * @param {Object} sensorData - Datos del sensor:
 *   - model: Modelo del sensor
 *   - serial_number: Número de serie
 *   - sensor_type: Tipo de contaminante que mide
 *   - station: ID de la estación asociada
 * @returns {Promise<Object>} Sensor creado
 */
export const createSensor = (sensorData) => {
  return apiFetch("/sensors/devices/", {
    method: "POST",
    body: JSON.stringify(sensorData),
  });
};

/**
 * Obtiene un sensor por ID.
 * Endpoint: GET /api/sensors/devices/:id/
 * @param {number|string} id - ID del sensor
 * @returns {Promise<Object>} Datos del sensor
 */
export const getSensorById = (id) => {
  return apiFetch(`/sensors/devices/${id}/`);
};

/**
 * Obtiene el historial de mantenimientos.
 * El backend filtra automáticamente por sensores de las estaciones del usuario.
 * Endpoint: GET /api/sensors/maintenance/
 * @returns {Promise<Array>} Lista de registros de mantenimiento
 */
export const getMaintenanceLogs = () => {
  return apiFetch("/sensors/maintenance/");
};

/**
 * Obtiene un registro de mantenimiento por ID.
 * Endpoint: GET /api/sensors/maintenance/:id/
 * @param {number|string} id - ID del registro
 * @returns {Promise<Object>} Datos del registro
 */
export const getMaintenanceLogById = (id) => {
  return apiFetch(`/sensors/maintenance/${id}/`);
};

/**
 * Crea un nuevo registro de mantenimiento.
 * Endpoint: POST /api/sensors/maintenance/
 * @param {FormData} formData - Datos del formulario incluyendo:
 *   - sensor: ID del sensor
 *   - log_date: Fecha del mantenimiento (ISO string)
 *   - description: Descripción de actividades
 *   - certificate_file: Archivo PDF (opcional)
 * @returns {Promise<Object>} Registro creado
 */
export const createMaintenanceLog = (formData) => {
  return apiFetch("/sensors/maintenance/", {
    method: "POST",
    body: formData,
  });
};

export const SensorAPI = {
  getSensors,
  createSensor,
  getSensorById,
  getMaintenanceLogs,
  getMaintenanceLogById,
  createMaintenanceLog,
};