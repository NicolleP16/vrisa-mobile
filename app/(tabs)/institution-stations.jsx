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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/shared/context/AuthContext';
import { StationAPI, SensorAPI } from '../../src/shared/api';
import { StationCard, SensorCard, StatCard } from '../../src/shared/components';

/**
 * Pantalla de Mis Estaciones para Representantes de Institución
 */
export default function InstitutionStationsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);

      // Cargar todas las estaciones afiliadas a la institución
      const response = await StationAPI.getStations();

      console.log('Estaciones cargadas:', response);

      const stationsArray = Array.isArray(response) ? response : [];
      setStations(stationsArray);

    } catch (error) {
      console.error('Error al cargar estaciones:', error);

      if (error.status === 0) {
        Alert.alert(
          'Error de conexión',
          'No se pudo conectar con el servidor. Verifica tu conexión a internet.'
        );
      } else {
        Alert.alert(
          'Error',
          'No se pudieron cargar las estaciones. Por favor, intenta nuevamente.'
        );
      }
      setStations([]);
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
    setShowDetails(true);
    await loadSensors(station.id);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedStation(null);
    setSensors([]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando estaciones...</Text>
      </View>
    );
  }

  // Vista de detalle de estación con sensores
  if (showDetails && selectedStation) {
    const activeSensors = sensors.filter(s => s.status?.toLowerCase() === 'active').length;
    const maintenanceSensors = sensors.filter(s => s.status?.toLowerCase() === 'maintenance').length;

    return (
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con botón de regreso */}
        <View className="bg-primario px-4 pt-6 pb-8">
          <TouchableOpacity
            onPress={handleBackToList}
            className="flex-row items-center mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white ml-2 font-semibold">Volver</Text>
          </TouchableOpacity>

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">
                {selectedStation.name || selectedStation.station_name}
              </Text>
              {selectedStation.location && (
                <View className="flex-row items-center mt-2">
                  <Ionicons name="location" size={16} color="white" />
                  <Text className="text-white/80 text-sm ml-2">
                    {selectedStation.location}
                  </Text>
                </View>
              )}
            </View>
            <Ionicons name="settings-outline" size={24} color="white" />
          </View>
        </View>

        {/* Estadísticas de sensores */}
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
        <View className="px-4 mt-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Información de la Estación
          </Text>
          <View className="bg-white rounded-lg p-4 shadow-md">
            <View className="flex-row items-center mb-3">
              <View className="bg-blue-50 rounded-full p-3 mr-3">
                <Ionicons name="radio" size={24} color="#394BBD" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">
                  {selectedStation.name || selectedStation.station_name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View
                    className="rounded-full px-3 py-1"
                    style={{
                      backgroundColor: selectedStation.status === 'online' || selectedStation.status === 'active'
                        ? '#DCFCE7'
                        : '#FEF3C7',
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{
                        color: selectedStation.status === 'online' || selectedStation.status === 'active'
                          ? '#16A34A'
                          : '#D97706',
                      }}
                    >
                      {selectedStation.status === 'online' || selectedStation.status === 'active'
                        ? 'En línea'
                        : selectedStation.status === 'maintenance'
                        ? 'Mantenimiento'
                        : 'Fuera de línea'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {selectedStation.location && (
              <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">
                  {selectedStation.location}
                </Text>
              </View>
            )}

            {selectedStation.aqi && (
              <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
                <Ionicons name="pulse" size={16} color="#6B7280" />
                <Text className="text-gray-600 ml-2">
                  AQI Actual: <Text className="font-semibold">{selectedStation.aqi}</Text>
                </Text>
              </View>
            )}
          </View>
        </View>

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
                  console.log('Sensor pressed:', sensor.id);
                }}
              />
            ))
          ) : (
            <View className="bg-white rounded-lg p-6 items-center">
              <Ionicons name="hardware-chip-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4">
                No hay sensores registrados en esta estación
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Vista principal: Lista de estaciones
  const activeStations = stations.filter(s => s.status === 'active' || s.status === 'online').length;
  const maintenanceStations = stations.filter(s => s.status === 'maintenance').length;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-4"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
          <Text className="text-white ml-2 font-semibold">Volver</Text>
        </TouchableOpacity>

        <Text className="text-white text-2xl font-bold">
          Mis Estaciones
        </Text>
        <Text className="text-white/80 text-sm mt-1">
          {user?.institution_name || 'Red de monitoreo de tu institución'}
        </Text>
      </View>

      {/* Resumen de estaciones */}
      <View className="px-4 -mt-4 mb-6">
        <View className="flex-row flex-wrap">
          <View className="w-1/3 pr-1">
            <StatCard
              title="Total"
              value={stations.length}
              icon="radio"
              color="#394BBD"
            />
          </View>
          <View className="w-1/3 px-1">
            <StatCard
              title="Activas"
              value={activeStations}
              icon="checkmark-circle"
              color="#10B981"
            />
          </View>
          <View className="w-1/3 pl-1">
            <StatCard
              title="Mantenimiento"
              value={maintenanceStations}
              icon="construct"
              color="#F59E0B"
            />
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
            <Text className="text-gray-500 mt-4 text-center">
              No hay estaciones afiliadas a tu institución
            </Text>
            <Text className="text-gray-400 text-xs mt-2 text-center">
              Las estaciones aparecerán aquí una vez que sean aprobadas
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}