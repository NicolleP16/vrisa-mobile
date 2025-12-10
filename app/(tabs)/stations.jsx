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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/shared/context/AuthContext';
import { StationAPI, SensorAPI } from '../../src/shared/api';
import { StationCard, SensorCard, StatCard } from '../../src/shared/components';

/**
 * Página de Estaciones de Monitoreo
 */
export default function StationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showSensors, setShowSensors] = useState(false);

  // Usuario es administrador de estación
  const isStationAdmin = user?.primary_role === 'station_admin';

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);

      // Si es admin de estación, cargar solo sus estaciones
      const response = isStationAdmin
        ? await StationAPI.getStations()
        : await StationAPI.getStations();

      setStations(Array.isArray(response) ? response : []);

      // Si es admin de estación y hay estaciones, cargar sensores de la primera
      if (isStationAdmin && response?.length > 0) {
        await loadSensors(response[0].id);
        setSelectedStation(response[0]);
      }
    } catch (error) {
      console.error('Error loading stations:', error);
      Alert.alert('Error', 'No se pudieron cargar las estaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadSensors = async (stationId) => {
    try {
      const response = await SensorAPI.getSensors(stationId);
      setSensors(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading sensors:', error);
      setSensors([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  };

  const handleStationPress = async (station) => {
    setSelectedStation(station);
    setShowSensors(true);
    await loadSensors(station.id);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando estaciones...</Text>
      </View>
    );
  }

  // Vista para administrador de estación
  if (isStationAdmin) {
    const activeSensors = sensors.filter(s => s.status?.toLowerCase() === 'active').length;
    const maintenanceSensors = sensors.filter(s => s.status?.toLowerCase() === 'maintenance').length;

    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="bg-primario px-4 pt-6 pb-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">Mi Estación</Text>
              <Text className="text-white/80 text-sm mt-1">
                Gestiona tus sensores y equipos
              </Text>
            </View>
            <Ionicons name="settings-outline" size={24} color="white" />
          </View>
        </View>

        {/* Estadísticas */}
        <View className="px-4 -mt-4">
          <View className="flex-row flex-wrap">
            <View className="w-1/3">
              <StatCard
                title="Activos"
                value={activeSensors}
                icon="checkmark-circle"
                color="#10B981"
              />
            </View>
            <View className="w-1/3">
              <StatCard
                title="Mantenimiento"
                value={maintenanceSensors}
                icon="construct"
                color="#F59E0B"
              />
            </View>
            <View className="w-1/3">
              <StatCard
                title="Total"
                value={sensors.length}
                icon="hardware-chip"
                color="#394BBD"
              />
            </View>
          </View>
        </View>

        {/* Información de la estación */}
        {selectedStation && (
          <View className="px-4 mt-6">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Información de la Estación
            </Text>
            <View className="bg-white rounded-lg p-4 shadow-md">
              <Text className="text-xl font-bold text-gray-800">
                {selectedStation.name}
              </Text>
              {selectedStation.location && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="location" size={16} color="#6B7280" />
                  <Text className="text-gray-600 ml-2">
                    {selectedStation.location}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Lista de sensores */}
        <View className="px-4 mt-6 pb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Sensores ({sensors.length})
          </Text>
          {sensors.length > 0 ? (
            sensors.map((sensor, index) => (
              <SensorCard
                key={sensor.id || index}
                sensor={sensor}
                onPress={() => {
                  // Navegar a detalle de sensor
                  console.log('Sensor pressed:', sensor.id);
                }}
              />
            ))
          ) : (
            <View className="bg-white rounded-lg p-6 items-center">
              <Ionicons name="hardware-chip-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">
                No hay sensores registrados
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Vista para usuarios regulares (ciudadanos, investigadores)
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <Text className="text-white text-2xl font-bold">
          Estaciones de Monitoreo
        </Text>
        <Text className="text-white/80 text-sm mt-1">
          Red de monitoreo de calidad del aire en Cali
        </Text>
      </View>

      {/* Resumen */}
      <View className="px-4 -mt-4 mb-6">
        <View className="bg-white rounded-lg p-4 shadow-md">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-600 text-sm">Total de Estaciones</Text>
              <Text className="text-3xl font-bold text-primario mt-1">
                {stations.length}
              </Text>
            </View>
            <View className="bg-blue-50 rounded-full p-4">
              <Ionicons name="radio" size={32} color="#394BBD" />
            </View>
          </View>
        </View>
      </View>

      {/* Lista de estaciones */}
      <View className="px-4 pb-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Todas las Estaciones
        </Text>
        {stations.length > 0 ? (
          stations.map((station, index) => (
            <StationCard
              key={station.id || index}
              station={station}
              onPress={() => handleStationPress(station)}
            />
          ))
        ) : (
          <View className="bg-white rounded-lg p-6 items-center">
            <Ionicons name="radio-outline" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4">
              No hay estaciones disponibles
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}