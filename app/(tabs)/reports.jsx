import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { MeasurementAPI, ReportAPI, StationAPI } from '../../src/shared/api';

/**
 * Página de Reportes
 * Genera reportes virtuales basados en filtros
 */
export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState([]);
  const [variables, setVariables] = useState([]);
  
  // Estados de Filtros
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedVariable, setSelectedVariable] = useState('');
  const [reportCategory, setReportCategory] = useState('QUALITY');
  const [timeFilter, setTimeFilter] = useState('WEEKLY');
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      setLoading(true);
      
      // Cargar estaciones y variables
      const [stationsData, variablesData] = await Promise.all([
        StationAPI.getStations().catch(() => []),
        MeasurementAPI.getVariables().catch(() => []),
      ]);

      setStations(Array.isArray(stationsData) ? stationsData : []);
      setVariables(Array.isArray(variablesData) ? variablesData : []);

      // Seleccionar "Todas las estaciones" por defecto
      if (stationsData.length > 0) {
        setSelectedStation('all');
      }
    } catch (error) {
      console.error('Error loading metadata:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMetadata();
    setRefreshing(false);
  };

  // Generar reportes virtuales basados en filtros
  const generateVirtualReports = () => {
    const reports = [];
    const stationName = 
      selectedStation === 'all' || !selectedStation
        ? 'Todas las estaciones'
        : stations.find((s) => s.station_id === selectedStation)?.station_name || 'Todas';
    
    const today = new Date();
    const periodsToGenerate = 5;

    for (let i = 0; i < periodsToGenerate; i++) {
      let start = new Date();
      let end = new Date();
      let label = '';

      if (timeFilter === 'WEEKLY') {
        start.setDate(today.getDate() - i * 7 - 7);
        end.setDate(today.getDate() - i * 7);
        label = 'Reporte Semanal';
      } else {
        start.setMonth(today.getMonth() - i);
        start.setDate(1);
        end.setMonth(today.getMonth() - i + 1);
        end.setDate(0);
        label = 'Reporte Mensual';
      }

      reports.push({
        id: i,
        name: label,
        station_name: stationName,
        type: timeFilter === 'WEEKLY' ? 'Semanal' : 'Mensual',
        created_at: end.toISOString(),
        date_range: `${formatDate(start)} - ${formatDate(end)}`,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      });
    }
    return reports;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownloadReport = async (report) => {
    setDownloadingId(report.id);
    
    try {
      // Llamar al API correspondiente según la categoría
      if (reportCategory === 'QUALITY') {
        await ReportAPI.downloadAirQualityReport(
          selectedStation === 'all' ? '' : selectedStation,
          report.startDate,
          report.endDate,
          selectedVariable
        );
        Alert.alert('Éxito', 'Reporte de Calidad del Aire descargado');
      } else if (reportCategory === 'TRENDS') {
        await ReportAPI.downloadTrendsReport(
          selectedStation === 'all' ? '' : selectedStation,
          report.startDate,
          report.endDate,
          selectedVariable
        );
        Alert.alert('Éxito', 'Reporte de Tendencias descargado');
      } else if (reportCategory === 'ALERTS') {
        await ReportAPI.downloadAlertsReport(
          selectedStation === 'all' ? '' : selectedStation,
          report.startDate,
          report.endDate
        );
        Alert.alert('Éxito', 'Reporte de Alertas Críticas descargado');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const getReportCategoryInfo = (category) => {
    switch (category) {
      case 'QUALITY':
        return {
          title: 'Calidad del Aire',
          icon: 'cloud',
          color: '#10B981',
        };
      case 'TRENDS':
        return {
          title: 'Tendencias',
          icon: 'trending-up',
          color: '#3B82F6',
        };
      case 'ALERTS':
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

  const virtualReports = generateVirtualReports();
  const categoryInfo = getReportCategoryInfo(reportCategory);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <Text className="text-white text-2xl font-bold">Historial de Reportes</Text>
        <Text className="text-white/80 text-sm mt-1">
          Descarga informes oficiales y certificados
        </Text>
      </View>

      {/* Tabs de categoría de reporte */}
      <View className="px-4 -mt-4 mb-4">
        <View className="bg-white rounded-lg p-2 shadow-md flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              reportCategory === 'QUALITY' ? 'bg-primario' : ''
            }`}
            onPress={() => setReportCategory('QUALITY')}
          >
            <Text
              className={`text-center text-xs font-semibold ${
                reportCategory === 'QUALITY' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Calidad Aire
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              reportCategory === 'TRENDS' ? 'bg-primario' : ''
            }`}
            onPress={() => setReportCategory('TRENDS')}
          >
            <Text
              className={`text-center text-xs font-semibold ${
                reportCategory === 'TRENDS' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Tendencias
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              reportCategory === 'ALERTS' ? 'bg-primario' : ''
            }`}
            onPress={() => setReportCategory('ALERTS')}
          >
            <Text
              className={`text-center text-xs font-semibold ${
                reportCategory === 'ALERTS' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Alertas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtro de periodo */}
      <View className="px-4 mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Periodo
        </Text>
        <View className="flex-row">
          <TouchableOpacity
            className={`flex-1 mr-2 px-4 py-3 rounded-lg ${
              timeFilter === 'WEEKLY'
                ? 'bg-primario'
                : 'bg-white border border-gray-300'
            }`}
            onPress={() => setTimeFilter('WEEKLY')}
          >
            <Text
              className={`text-center text-sm font-medium ${
                timeFilter === 'WEEKLY' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Semanal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 px-4 py-3 rounded-lg ${
              timeFilter === 'MONTHLY'
                ? 'bg-primario'
                : 'bg-white border border-gray-300'
            }`}
            onPress={() => setTimeFilter('MONTHLY')}
          >
            <Text
              className={`text-center text-sm font-medium ${
                timeFilter === 'MONTHLY' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Mensual
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtro de estación */}
      <View className="px-4 mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">
          Estación
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${
              selectedStation === 'all' || !selectedStation
                ? 'bg-primario'
                : 'bg-white border border-gray-300'
            }`}
            onPress={() => setSelectedStation('all')}
          >
            <Text
              className={`text-sm font-medium ${
                selectedStation === 'all' || !selectedStation
                  ? 'text-white'
                  : 'text-gray-700'
              }`}
            >
              Todas las estaciones
            </Text>
          </TouchableOpacity>
          {stations.map((station) => (
            <TouchableOpacity
              key={station.station_id}
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedStation === station.station_id
                  ? 'bg-primario'
                  : 'bg-white border border-gray-300'
              }`}
              onPress={() => setSelectedStation(station.station_id)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedStation === station.station_id
                    ? 'text-white'
                    : 'text-gray-700'
                }`}
              >
                {station.station_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filtro de variable */}
      {reportCategory !== 'ALERTS' && (
        <View className="px-4 mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Variable
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full ${
                !selectedVariable
                  ? 'bg-primario'
                  : 'bg-white border border-gray-300'
              }`}
              onPress={() => setSelectedVariable('')}
            >
              <Text
                className={`text-sm font-medium ${
                  !selectedVariable ? 'text-white' : 'text-gray-700'
                }`}
              >
                Todas las variables
              </Text>
            </TouchableOpacity>
            {variables.map((variable) => (
              <TouchableOpacity
                key={variable.code}
                className={`mr-2 px-4 py-2 rounded-full ${
                  selectedVariable === variable.code
                    ? 'bg-primario'
                    : 'bg-white border border-gray-300'
                }`}
                onPress={() => setSelectedVariable(variable.code)}
              >
                <Text
                  className={`text-sm font-medium ${
                    selectedVariable === variable.code
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                >
                  {variable.name} ({variable.code})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Lista de reportes generados */}
      <View className="px-4 pb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          {categoryInfo.title} ({virtualReports.length})
        </Text>
        {virtualReports.length > 0 ? (
          virtualReports.map((report) => (
            <View
              key={report.id}
              className="bg-white rounded-lg p-4 mb-3 shadow-md"
            >
              <View className="flex-row items-start justify-between mb-3">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="rounded-full p-2 mr-3"
                      style={{ backgroundColor: `${categoryInfo.color}20` }}
                    >
                      <Ionicons
                        name={categoryInfo.icon}
                        size={20}
                        color={categoryInfo.color}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-800">
                        {report.name}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {report.station_name}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text className="text-xs text-gray-600 ml-2">
                      {report.date_range}
                    </Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-600 ml-2">
                      Creado el {formatDate(new Date(report.created_at))}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                className="bg-primario rounded-lg py-3 flex-row items-center justify-center"
                onPress={() => handleDownloadReport(report)}
                disabled={downloadingId === report.id}
              >
                <Ionicons name="download-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">
                  {downloadingId === report.id
                    ? 'Generando...'
                    : 'Descargar PDF'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons
              name="document-text-outline"
              size={48}
              color="#9CA3AF"
            />
            <Text className="text-gray-500 mt-4 text-center">
              No hay reportes disponibles{'\n'}
              para los filtros seleccionados
            </Text>
          </View>
        )}
      </View>

      {/* Footer informativo */}
      <View className="px-4 pb-6">
        <Text className="text-center text-xs text-gray-400">
          * Mostrando historial simulado basado en datos reales de VriSA
        </Text>
      </View>
    </ScrollView>
  );
}