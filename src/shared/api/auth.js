import { apiFetch } from "./http";
import * as SecureStore from 'expo-secure-store';

/**
 * Función para iniciar sesión del usuario.
 * @param {string} email - correo electrónico del usuario. E.g. 'pepito.perez@example.com'
 * @param {string} password - contraseña del usuario. E.g. 'mi_contraseña_segura'
 * @returns una promesa que resuelve los datos del usuario y token de autenticación.
 */
export function login(email, password) {
  return apiFetch("/users/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Función para registrar un nuevo usuario.
 * @param {Object} userData - objeto con los datos del usuario. E.g. {
 *  first_name: 'Pepito',
 *  last_name: 'Perez',
 *  email: 'pepito.perez@example.com',
 *  password: 'mi_contraseña_segura'
 * }
 * @returns una promesa que resuelve los datos del usuario registrado.
 */
export function register(userData) {
  return apiFetch("/users/register/", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

/**
 * Función para cerrar la sesión del usuario.
 * Se elimina el token de autenticación del almacenamiento seguro.
 * @returns una promesa resuelta inmediatamente.
 */
export async function logout() {
  await SecureStore.deleteItemAsync("token");
  await SecureStore.deleteItemAsync("refreshToken");
  await SecureStore.deleteItemAsync("userData");
  return Promise.resolve();
}

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

export const AuthAPI = {
  login,
  register,
  logout,
  registerInstitution,
};