import { apiFetch } from "./http";
import * as SecureStore from 'expo-secure-store';

/**
 * Decodifica el JWT para obtener el user_id
 */
const getUserIdFromToken = async () => {
  try {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);
    return decoded.user_id;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

export async function getCurrentUser() {
  const userId = await getUserIdFromToken();
  if (!userId) {
    throw new Error('No se pudo obtener el ID del usuario del token');
  }
  return apiFetch(`/users/${userId}/`);
}

export function getUserById(userId) {
  return apiFetch(`/users/${userId}/`);
}

export function updateUser(data) {
  return apiFetch("/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function updateUserProfile(userId, data) {
  return apiFetch(`/users/${userId}/`, {
    method: "PUT",
    body: data,
  });
}