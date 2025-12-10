import { apiFetch } from "./http";

/**
 * Obtiene el listado de estaciones disponibles.
 * Endpoint: /api/stations/
 */
export const getStations = () => {
  return apiFetch("/stations/");
};

/**
 * Obtiene una estación por ID.
 * Endpoint: /api/stations/:id/
 * @param {number|string} id - ID de la estación
 * @returns {Promise<Object>} Datos de la estación
 */
export const getStationById = (id) => {
  return apiFetch(`/stations/${id}/`);
};

/**
 * Crea una solicitud de afiliación (Para Station Admins).
 * @param {Object} data - { station: id, target_institution: id }
 */
export const createAffiliationRequest = (data) => {
  return apiFetch("/stations/affiliations/", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Obtiene el listado de solicitudes (Para ambos roles).
 * El backend ya filtra automáticamente según quién seas.
 */
export const getAffiliationRequests = () => {
  return apiFetch("/stations/affiliations/");
};

/**
 * Responde a una solicitud (Para Institution Admins).
 * @param {number} requestId - ID de la solicitud
 * @param {string} status - 'ACCEPTED' | 'REJECTED'
 * @param {string} comments - Comentarios opcionales
 */
export const reviewAffiliationRequest = (requestId, status, comments = "") => {
  return apiFetch(`/stations/affiliations/${requestId}/review/`, {
    method: "POST",
    body: JSON.stringify({ status, comments }),
  });
};

/**
 * Crea una solicitud para registrar una nueva estación.
 * Endpoint: /api/stations/registration-requests/
 * @param {FormData} formData - Datos de la estación + sensor + certificado
 * @returns {Promise<Object>} Solicitud creada con estado PENDING
 */
export const requestStationRegistration = (formData) => {
  return apiFetch("/stations/registration-requests/", {
    method: "POST",
    body: formData,
  });
};

/**
 * Obtiene el listado de solicitudes de registro de estaciones.
 * Endpoint: /api/stations/registration-requests/
 * @returns {Promise<Array>} Array de solicitudes de registro
 */
export const getRegistrationRequests = () => {
  return apiFetch("/stations/registration-requests/");
};

/**
 * Revisa una solicitud de registro (aprobar/rechazar).
 * Endpoint: /api/stations/registration-requests/:id/review/
 * @param {number} requestId - ID de la solicitud
 * @param {string} status - 'ACCEPTED' o 'REJECTED'
 * @param {string} comments - Comentarios de la revisión
 * @returns {Promise<Object>} Solicitud actualizada
 */
export const reviewRegistrationRequest = (requestId, status, comments = "") => {
  return apiFetch(`/stations/registration-requests/${requestId}/review/`, {
    method: "POST",
    body: JSON.stringify({ status, comments }),
  });
};

export const StationAPI = {
  getStations,
  getStationById,
  createAffiliationRequest,
  getAffiliationRequests,
  reviewAffiliationRequest,
  requestStationRegistration,
  getRegistrationRequests,
  reviewRegistrationRequest,
};