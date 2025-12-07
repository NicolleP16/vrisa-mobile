import { apiFetch } from "./http";

/**
 * Función para iniciar sesión del usuario.
 * @param {*} email - correo electrónico del usuario. E.g. 'pepito.perez@example.com'
 * @param {*} password - contraseña del usuario. E.g. 'mi_contraseña_segura'
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
 * @param {*} userData - objeto con los datos del usuario. E.g. {
 *  firs_name: 'Pepito',
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
 * Se elimina el token de autenticación del almacenamiento local.
 * @returns una promesa resuelta inmediatamente.
 */
export function logout() {
  localStorage.removeItem("/token/");
  return Promise.resolve();
}
