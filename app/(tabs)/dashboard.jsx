import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../src/shared/context/AuthContext';
import { MeasurementAPI, StationAPI } from '../../src/shared/api';
import { StatCard, StationCard } from '../../src/shared/components';

/**
 * Página principal del Dashboard - Calidad del Aire
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aqiData, setAqiData] = useState(null);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [aqiResponse, stationsResponse] = await Promise.all([
        MeasurementAPI.getCurrentAQI().catch(() => null),
        StationAPI.getStations().catch(() => []),
      ]);

      setAqiData(aqiResponse);
      setStations(Array.isArray(stationsResponse) ? stationsResponse : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return { text: 'Bueno', color: '#10B981' };
    if (aqi <= 100) return { text: 'Moderado', color: '#F59E0B' };
    if (aqi <= 150) return { text: 'Poco Saludable (SG)', color: '#F97316' };
    if (aqi <= 200) return { text: 'Poco Saludable', color: '#EF4444' };
    if (aqi <= 300) return { text: 'Muy Poco Saludable', color: '#9333EA' };
    return { text: 'Peligroso', color: '#7F1D1D' };
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando datos...</Text>
      </View>
    );
  }

  const currentAQI = aqiData?.aqi || 42;
  const aqiLevel = getAQILevel(currentAQI);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header con saludo */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <Text className="text-white text-lg">
          Hola, {user?.first_name || 'Usuario'}
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">
          Calidad del Aire en Cali
        </Text>
      </View>

      {/* Tarjeta principal de AQI */}
      <View className="px-4 -mt-4">
        <View className="bg-white rounded-xl p-6 shadow-lg">
          <Text className="text-gray-600 text-sm font-medium mb-2">
            Índice de Calidad del Aire
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className="text-5xl font-bold"
              style={{ color: aqiLevel.color }}
            >
              {currentAQI}
            </Text>
            <Text className="text-gray-500 text-lg ml-2">AQI</Text>
          </View>
          <View
            className="mt-3 px-4 py-2 rounded-lg self-start"
            style={{ backgroundColor: `${aqiLevel.color}20` }}
          >
            <Text
              className="font-semibold"
              style={{ color: aqiLevel.color }}
            >
              {aqiLevel.text}
            </Text>
          </View>
          <Text className="text-gray-500 text-xs mt-4">
            Actualizado: {new Date().toLocaleString('es-ES')}
          </Text>
        </View>
      </View>

      {/* Métricas resumen */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Métricas Principales
        </Text>
        <View className="flex-row flex-wrap">
          <View className="w-1/2">
            <StatCard
              title="PM2.5"
              value={aqiData?.pm25 || "12.3"}
              unit="µg/m³"
              icon="water"
              color="#10B981"
            />
          </View>
          <View className="w-1/2">
            <StatCard
              title="PM10"
              value={aqiData?.pm10 || "28.5"}
              unit="µg/m³"
              icon="cloud"
              color="#3B82F6"
            />
          </View>
          <View className="w-1/2">
            <StatCard
              title="Temperatura"
              value={aqiData?.temperature || "24"}
              unit="°C"
              icon="thermometer"
              color="#F59E0B"
            />
          </View>
          <View className="w-1/2">
            <StatCard
              title="Humedad"
              value={aqiData?.humidity || "68"}
              unit="%"
              icon="water-outline"
              color="#06B6D4"
            />
          </View>
        </View>
      </View>

      {/* Estaciones de monitoreo */}
      <View className="px-4 mt-6 pb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Estaciones de Monitoreo
        </Text>
        {stations.length > 0 ? (
          stations.map((station, index) => (
            <StationCard
              key={station.id || index}
              station={station}
              onPress={() => {
                // Navegar a detalle de estación si se requiere
                console.log('Station pressed:', station.id);
              }}
            />
          ))
        ) : (
          <View className="bg-white rounded-lg p-6 items-center">
            <Text className="text-gray-500">
              No hay estaciones disponibles
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
