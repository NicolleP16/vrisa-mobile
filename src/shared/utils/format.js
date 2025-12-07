import { ApiError } from "../api/http";

/**
 * Procesa un error de la API y devuelve un array de mensajes legibles.
 * Maneja errores de validación de Django (400) y errores genéricos.
 * 
 * @param {Error} error - El objeto de error capturado en el catch.
 * @param {string} defaultMessage - Mensaje por defecto si no hay detalles.
 * @returns {string[]} Array de strings con los mensajes de error.
 */
export function formatApiErrors(error, defaultMessage = "Ocurrió un error inesperado.") {
  if (error instanceof ApiError && error.status === 400 && error.data) {
    const messages = [];

    // Django devuelve un objeto: { email: ["Error1"], non_field_errors: ["Error2"] }
    // Se itera sobre las claves para formar una lista plana de mensajes
    Object.entries(error.data).forEach(([field, errors]) => {
      const prefix = field === "non_field_errors" ? "" : `${field}: `;
      const errorText = Array.isArray(errors) ? errors.join(" ") : String(errors);
      messages.push(`${prefix}${errorText}`);
    });

    return messages.length > 0 ? messages : [defaultMessage];
  }

  // Para otros errores (500, red, etc.)
  return [error.message || defaultMessage];
}
