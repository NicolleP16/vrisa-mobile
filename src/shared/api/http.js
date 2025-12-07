import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// CONFIGURACIÓN
//const API_HOST = 'aqui va la ip';

const BASE_URL = `http://${API_HOST}:8000/api`;

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = await SecureStore.getItemAsync("token");

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("userData");
    }
    
    const errorMessage = data?.message || data?.detail || "Error en el servidor";
    throw new ApiError(errorMessage, response.status, data);
  }
  
  return data;
}