import { apiFetch } from './http';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API para reportes
 */

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
 * * @param {string} endpoint - La URL relativa del endpoint de la API.
 * @param {string} filename - Nombre del archivo a guardar.
 * @returns {Promise<void>}
 */
const downloadBlob = async (endpoint, filename = 'reporte_vrisa.pdf') => {
    const token = await AsyncStorage.getItem('token');
    
    const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'; 
    
    try {
      console.log(`Iniciando descarga desde: ${endpoint}`);
      
      const url = `${API_URL}${endpoint}`;
      
      // Definir ruta local
      const fileUri = FileSystem.documentDirectory + filename;
      const result = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
  
      const uri = result.uri;
  
      console.log('Archivo descargado en:', uri);
  
      // Compartir el archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Guardar reporte',
          UTI: 'com.adobe.pdf',
        });
      } else {
        throw new Error('Compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      console.error('Error crítico en downloadBlob:', error);
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
  
  if (endDate) {
    url = `/measurements/reports/air-quality/?station_id=${stationId}&start_date=${startDate}&end_date=${endDate}`;
  } else {
    url = `/measurements/reports/air-quality/?station_id=${stationId}&date=${startDate}`;
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
  let url = `/measurements/reports/trends/?station_id=${stationId}&start_date=${startDate}&end_date=${endDate}`;
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
  let url = `/measurements/reports/alerts/?station_id=${stationId}&start_date=${startDate}&end_date=${endDate}`;
  
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