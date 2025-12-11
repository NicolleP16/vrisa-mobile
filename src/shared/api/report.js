import { apiFetch } from './http';
import { documentDirectory, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { API_HOST, API_PORT } from '@env';

/**
 * API para reportes
 */
const BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

/**
 * Obtiene el listado general de reportes disponibles (metadata).
 * @returns {Promise<Array>} Lista de reportes.
 */
export const getGeneralReports = () => {
  return apiFetch('/measurements/reports/');
};

/**
 * Función genérica para descargar archivos PDF.
 * Descarga el archivo y lo abre para compartir.
 * @param {string} endpoint - La URL relativa del endpoint de la API.
 * @param {string} filename - Nombre del archivo a guardar.
 * @returns {Promise<void>}
 */
const downloadBlob = async (endpoint, filename = 'reporte_vrisa.pdf') => {
  try {
    const token = await SecureStore.getItemAsync('token');
    
    if (!token) {
      throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente.');
    }
    
    const url = `${BASE_URL}${endpoint}`;
    
    console.log(`Iniciando descarga desde: ${url}`);
    console.log('Token presente:', token ? 'Sí' : 'No');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status de respuesta:', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Sin mensaje de error');
      console.error('Error del servidor:', errorText);
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText || errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    
    console.log('Descarga completa. Tamaño:', arrayBuffer.byteLength, 'bytes');

    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, chunk);
    }
    
    const base64Data = btoa(binary);

    console.log('Conversión a base64 completa');

    const file = new File(documentDirectory, filename);
    await file.create();
    
    console.log('Archivo creado en:', file.uri);
    
    await file.write(base64Data, { encoding: 'base64' });

    console.log('Contenido escrito exitosamente');

    const exists = await file.exists();
    
    if (!exists) {
      throw new Error('El archivo no se guardó correctamente');
    }

    const fileInfo = await file.stat();
    console.log('Tamaño del archivo guardado:', fileInfo.size, 'bytes');

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Guardar reporte',
        UTI: 'com.adobe.pdf',
      });
      console.log('Archivo compartido exitosamente');
    } else {
      throw new Error('Compartir no está disponible en este dispositivo');
    }
  } catch (error) {
    console.error('Error crítico en downloadBlob:', error);
    console.error('URL intentada:', `${BASE_URL}${endpoint}`);
    console.error('Detalles del error:', error.message);
    throw error;
  }
};

/**
 * Descarga el Reporte de Calidad del Aire (Resumen Estadístico).
 * Soporta tanto la consulta de un día específico (legacy) como un rango de fechas.
 * 
 * @param {number|string} stationId - Identificador de la estación de monitoreo.
 * @param {string} startDate - Fecha de inicio (formato YYYY-MM-DD).
 * @param {string|null} [endDate=null] - Fecha de fin (formato YYYY-MM-DD). Si es null, se asume reporte de un solo día.
 * @param {string} [variableCode=""] - (Opcional) Código de la variable para filtrar (ej: "PM2.5").
 * @returns {Promise<void>} Promesa resuelta al iniciar la descarga.
 */
export const downloadAirQualityReport = (
  stationId,
  startDate,
  endDate = null,
  variableCode = ''
) => {
  let url = '';
  
  const stationParam = stationId && stationId !== '' && stationId !== 'all' 
    ? `station_id=${stationId}&` 
    : '';
  
  if (endDate) {
    url = `/measurements/reports/air-quality/?${stationParam}start_date=${startDate}&end_date=${endDate}`;
  } else {
    url = `/measurements/reports/air-quality/?${stationParam}date=${startDate}`;
  }

  if (variableCode) url += `&variable_code=${variableCode}`;
  
  const filename = `calidad_aire_${startDate}_${endDate || startDate}.pdf`;
  return downloadBlob(url, filename);
};

/**
 * Descarga el Reporte de Tendencias (Gráficas de comportamiento).
 * Requiere obligatoriamente un rango de fechas.
 * 
 * @param {number|string} stationId - Identificador de la estación.
 * @param {string} startDate - Fecha de inicio del análisis (YYYY-MM-DD).
 * @param {string} endDate - Fecha de fin del análisis (YYYY-MM-DD).
 * @param {string} [variableCode=""] - (Opcional) Filtro por variable específica.
 * @returns {Promise<void>} Promesa resuelta al iniciar la descarga.
 */
export const downloadTrendsReport = (
  stationId,
  startDate,
  endDate,
  variableCode = ''
) => {
  const stationParam = stationId && stationId !== '' && stationId !== 'all' 
    ? `station_id=${stationId}&` 
    : '';
    
  let url = `/measurements/reports/trends/?${stationParam}start_date=${startDate}&end_date=${endDate}`;
  if (variableCode) url += `&variable_code=${variableCode}`;
  
  const filename = `tendencias_${startDate}_${endDate}.pdf`;
  return downloadBlob(url, filename);
};

/**
 * Descarga el Reporte de Alertas Críticas.
 * Por defecto analiza las últimas 24 horas.
 * 
 * @param {number|string} stationId - (Opcional) ID de la estación. Si se omite, busca en todas las estaciones.
 * @param {string} startDate - Fecha de inicio del análisis (YYYY-MM-DD).
 * @param {string} endDate - Fecha de fin del análisis (YYYY-MM-DD).
 * @returns {Promise<void>} Promesa resuelta al iniciar la descarga.
 */
export const downloadAlertsReport = (
  stationId = '',
  startDate,
  endDate
) => {
  let url = `/measurements/reports/alerts/?start_date=${startDate}&end_date=${endDate}`;
  if (stationId && stationId !== '' && stationId !== 'all') {
    url += `&station_id=${stationId}`;
  }
  
  const filename = `alertas_${startDate}_${endDate}.pdf`;
  return downloadBlob(url, filename);
};

/**
 * API
 */
export const ReportAPI = {
  // Métodos de descarga
  downloadAirQualityReport,
  downloadTrendsReport,
  downloadAlertsReport,
  getGeneralReports,

  /**
   * Obtiene la lista de reportes
   */
  async getReports(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/reports/?${queryParams}` : '/reports/';
    return await apiFetch(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Genera un nuevo reporte
   */
  async generateReport(reportData) {
    return await apiFetch('/reports/generate/', {
      method: 'POST',
      body: reportData,
    });
  },

  /**
   * Obtiene reportes de calidad del aire
   */
  async getAirQualityReports(filters = {}) {
    const queryParams = new URLSearchParams({
      ...filters,
      type: 'air_quality',
    }).toString();
    return await apiFetch(`/reports/?${queryParams}`, {
      method: 'GET',
    });
  },

  /**
   * Obtiene reportes de tendencias
   */
  async getTrendsReports(filters = {}) {
    const queryParams = new URLSearchParams({
      ...filters,
      type: 'trends',
    }).toString();
    return await apiFetch(`/reports/?${queryParams}`, {
      method: 'GET',
    });
  },

  /**
   * Obtiene reportes de alertas críticas
   */
  async getCriticalAlertsReports(filters = {}) {
    const queryParams = new URLSearchParams({
      ...filters,
      type: 'critical_alerts',
    }).toString();
    return await apiFetch(`/reports/?${queryParams}`, {
      method: 'GET',
    });
  },
};