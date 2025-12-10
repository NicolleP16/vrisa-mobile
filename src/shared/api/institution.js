import { apiFetch } from "./http";

/**
 * Registra una nueva institución (Solicitud).
 * @param {FormData} formData - Datos del formulario incluyendo archivos.
 */
export function registerInstitution(formData) {
  return apiFetch("/institutions/register/", {
    method: "POST",
    body: formData
  });
}

/**
 * Obtiene el listado de instituciones registradas.
 */
export function getInstitutions() {
  return apiFetch("/institutions/institutes/");
}

/**
 * Aprueba la creación de una institución específica.
 * Endpoint: POST /api/institutions/requests/{id}/approve/
 */
export function approveInstitution(institutionId) {
  return apiFetch(`/institutions/requests/${institutionId}/approve/`, {
    method: "POST",
  });
}

export const InstitutionAPI = {
  registerInstitution,
  getInstitutions,
  approveInstitution,
};