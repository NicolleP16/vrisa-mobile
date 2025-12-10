import { apiFetch } from './http';

/**
 * API para gestión de instituciones
 */
export const InstitutionAPI = {
  /**
   * Obtiene todas las instituciones
   */
  async getInstitutions(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/institutions/?${queryParams}` : '/institutions/';
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Obtiene una institución por ID
   */
  async getInstitutionById(institutionId) {
    return await apiFetch(`/institutions/${institutionId}/`, {
      method: 'GET',
    });
  },

  /**
   * Registra una nueva institución
   */
  async registerInstitution(institutionData) {
    return await apiFetch('/institutions/register/', {
      method: 'POST',
      body: institutionData,
    });
  },

  /**
   * Aprueba una institución (solo admin)
   */
  async approveInstitution(institutionId) {
    return await apiFetch(`/institutions/${institutionId}/approve/`, {
      method: 'POST',
    });
  },
};
