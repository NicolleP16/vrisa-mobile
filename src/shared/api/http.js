import * as SecureStore from 'expo-secure-store';
import { API_HOST, API_PORT } from '@env';

// Validar que las variables estén configuradas
if (!API_HOST || !API_PORT) {
  throw new Error(
    'Configura tu archivo .env\n\n' +
    '1. Copia .env.example a .env\n' +
    '2. Configura tu IP local en API_HOST\n' +
    '3. Reinicia con: npx expo start -c'
  );
}

// Construir la URL base de la API, considerando el puerto 443 para Ngrok
const BASE_URL = API_PORT === '443' 
  ? `https://${API_HOST}/api`
  : `http://${API_HOST}:${API_PORT}/api`;

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

  try {
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
  } catch (error) {
    if (error instanceof ApiError) throw error;
    
    throw new ApiError(
      `No se pudo conectar al servidor en ${API_HOST}:${API_PORT}. Verifica tu configuración.`,
      0,
      null
    );
  }
}

export const getApiConfig = () => ({
  host: API_HOST,
  port: API_PORT,
  baseUrl: BASE_URL
});