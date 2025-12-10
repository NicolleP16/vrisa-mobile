import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/shared/context/AuthContext';
import { ReportAPI, StationAPI } from '../../src/shared/api';

/**
 * Página de Reportes
 */
export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('air_quality'); // air_quality, trends, critical_alerts
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadReports();
  }, [reportType, selectedStation]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const stationsResponse = await StationAPI.getStations();
      setStations(Array.isArray(stationsResponse) ? stationsResponse : []);
      await loadReports();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const filters = {
        type: reportType,
        ...(selectedStation !== 'all' && { station: selectedStation }),
      };

      const response = await ReportAPI.getReports(filters);
      setReports(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading reports:', error);
      setReports([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleDownloadReport = async (reportId) => {
    try {
      Alert.alert(
        'Descargar Reporte',
        '¿Deseas descargar este reporte en PDF?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Descargar',
            onPress: async () => {
              try {
                const response = await ReportAPI.downloadReport(reportId);
                // En una implementación real, aquí manejarías la descarga del PDF
                Alert.alert('Éxito', 'Reporte descargado correctamente');
              } catch (error) {
                Alert.alert('Error', 'No se pudo descargar el reporte');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const getReportTypeInfo = (type) => {
    switch (type) {
      case 'air_quality':
        return {
          title: 'Calidad del Aire',
          icon: 'cloud',
          color: '#10B981',
        };
      case 'trends':
        return {
          title: 'Tendencias',
          icon: 'trending-up',
          color: '#3B82F6',
        };
      case 'critical_alerts':
        return {
          title: 'Alertas Críticas',
          icon: 'warning',
          color: '#EF4444',
        };
      default:
        return {
          title: 'Reporte',
          icon: 'document-text',
          color: '#6B7280',
        };
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando reportes...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <Text className="text-white text-2xl font-bold">Reportes</Text>
        <Text className="text-white/80 text-sm mt-1">
          Historial de reportes y análisis
        </Text>
      </View>

      {/* Filtros de tipo de reporte */}
      <View className="px-4 -mt-4 mb-4">
        <View className="bg-white rounded-lg p-2 shadow-md flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              reportType === 'air_quality' ? 'bg-primario' : ''
            }`}
            onPress={() => setReportType('air_quality')}
          >
            <Text
              className={`text-center text-xs font-semibold ${
                reportType === 'air_quality' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Calidad Aire
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              reportType === 'trends' ? 'bg-primario' : ''
            }`}
            onPress={() => setReportType('trends')}
          >
            <Text
              className={`text-center text-xs font-semibold ${
                reportType === 'trends' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Tendencias
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              reportType === 'critical_alerts' ? 'bg-primario' : ''
            }`}
            onPress={() => setReportType('critical_alerts')}
          >
            <Text
              className={`text-center text-xs font-semibold ${
                reportType === 'critical_alerts' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Alertas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtro de estación */}
      <View className="px-4 mb-6">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Filtrar por estación
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedStation === 'all'
                ? 'bg-primario'
                : 'bg-white border border-gray-300'
            }`}
            onPress={() => setSelectedStation('all')}
          >
            <Text
              className={`text-sm font-medium ${
                selectedStation === 'all' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Todas
            </Text>
          </TouchableOpacity>
          {stations.map((station) => (
            <TouchableOpacity
              key={station.id}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedStation === station.id
                  ? 'bg-primario'
                  : 'bg-white border border-gray-300'
              }`}
              onPress={() => setSelectedStation(station.id)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedStation === station.id ? 'text-white' : 'text-gray-700'
                }`}
              >
                {station.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de reportes */}
      <View className="px-4 pb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          {getReportTypeInfo(reportType).title} ({reports.length})
        </Text>
        {reports.length > 0 ? (
          reports.map((report, index) => {
            const typeInfo = getReportTypeInfo(report.type || reportType);
            return (
              <View key={report.id || index} className="bg-white rounded-lg p-4 mb-3 shadow-md">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View
                        className="rounded-full p-2 mr-3"
                        style={{ backgroundColor: `${typeInfo.color}20` }}
                      >
                        <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-800">
                          {report.name || `Reporte ${typeInfo.title}`}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {report.station_name || 'Todas las estaciones'}
                        </Text>
                      </View>
                    </View>
                    {report.date_range && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-2">
                          {report.date_range}
                        </Text>
                      </View>
                    )}
                    {report.created_at && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-2">
                          Generado: {new Date(report.created_at).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  className="bg-primario rounded-lg py-3 flex-row items-center justify-center"
                  onPress={() => handleDownloadReport(report.id)}
                >
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Descargar PDF
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">
              No hay reportes disponibles{'\n'}
              para los filtros seleccionados
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
