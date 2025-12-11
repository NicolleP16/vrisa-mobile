import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/shared/context/AuthContext';
import { StationAPI, InstitutionAPI, MeasurementAPI } from '../../src/shared/api';
import { StatCard, StationCard } from '../../src/shared/components';

/**
 * Panel de Dashboard para Representantes de Institución
 */
export default function InstitutionDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [institutionData, setInstitutionData] = useState(null);
  const [affiliatedStations, setAffiliatedStations] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [overallAQI, setOverallAQI] = useState(null);

  useEffect(() => {
    loadInstitutionDashboard();
  }, []);

  const loadInstitutionDashboard = async () => {
    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [stations, affiliationRequests] = await Promise.all([
        StationAPI.getStations().catch(() => []),
        StationAPI.getAffiliationRequests().catch(() => []),
      ]);

      console.log('Estaciones afiliadas:', stations);
      console.log('Solicitudes de afiliación:', affiliationRequests);

      setAffiliatedStations(Array.isArray(stations) ? stations : []);

      // Filtrar solicitudes pendientes
      const pending = Array.isArray(affiliationRequests)
        ? affiliationRequests.filter(req => req.status === 'PENDING')
        : [];
      setPendingRequests(pending);

      // Calcular AQI promedio si hay estaciones
      if (stations && stations.length > 0) {
        try {
          const aqiResponse = await MeasurementAPI.getCurrentAQI(stations[0].id);
          setOverallAQI(aqiResponse);
        } catch (error) {
          console.log('Error obteniendo AQI:', error);
        }
      }

    } catch (error) {
      console.error('Error cargando dashboard de institución:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInstitutionDashboard();
    setRefreshing(false);
  };

  const handleStationPress = (station) => {
    router.push(`/stations/${station.id}`);
  };

  const handleViewRequests = () => {
    // Navegar a pantalla de solicitudes
    Alert.alert('Información', 'Funcionalidad de solicitudes en desarrollo');
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando dashboard...</Text>
      </View>
    );
  }

  const activeStations = affiliatedStations.filter(s => s.status === 'active' || s.status === 'online').length;
  const maintenanceStations = affiliatedStations.filter(s => s.status === 'maintenance').length;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-12 mb-[-30px]">
        <Text className="text-white text-lg">
          Panel de Institución
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">
          {user?.institution_name || 'Mi Institución'}
        </Text>
        <Text className="text-white/80 text-sm mt-1">
          Gestiona tu red de monitoreo ambiental
        </Text>
      </View>

      {/* Tarjetas de Estadísticas */}
      <View className="px-4 mb-4">
        <View className="flex-row flex-wrap">
          <View className="w-1/3 pr-1">
            <StatCard
              title="Estaciones"
              value={affiliatedStations.length}
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

      {/* Solicitudes Pendientes */}
      {pendingRequests.length > 0 && (
        <View className="px-4 mb-4">
          <TouchableOpacity
            className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg flex-row items-center justify-between"
            onPress={handleViewRequests}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="alert-circle" size={24} color="#F97316" />
              <View className="flex-1 ml-3">
                <Text className="font-bold text-orange-800">
                  Solicitudes pendientes
                </Text>
                <Text className="text-orange-700 text-xs mt-1">
                  {pendingRequests.length} solicitud{pendingRequests.length !== 1 ? 'es' : ''} de afiliación requieren revisión
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#F97316" />
          </TouchableOpacity>
        </View>
      )}

      {/* AQI Promedio */}
      {overallAQI && (
        <View className="px-4 mb-4">
          <StatCard
            label="CALIDAD DEL AIRE (PROMEDIO)"
            value={Math.round(overallAQI.aqi)}
            unit={overallAQI.category || "Sin datos"}
            icon={<Ionicons name="pulse" size={24} color={overallAQI.color || "#64748b"} />}
            colorHex={overallAQI.color || "#e2e8f0"}
            statusColor={overallAQI.color}
            borderType="full"
          />
        </View>
      )}

      {/* Accesos Rápidos */}
      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">
          Accesos Rápidos
        </Text>
        <View className="flex-row flex-wrap">
          <TouchableOpacity
            className="w-1/2 pr-2 mb-3"
            onPress={() => router.push('/(tabs)/institution-stations')}
          >
            <View className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-primario">
              <Ionicons name="radio" size={28} color="#394BBD" />
              <Text className="text-gray-800 font-bold mt-2">Mis Estaciones</Text>
              <Text className="text-gray-500 text-xs mt-1">Ver y gestionar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/2 pl-2 mb-3"
            onPress={() => router.push('/(tabs)/reports')}
          >
            <View className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
              <Ionicons name="document-text" size={28} color="#10B981" />
              <Text className="text-gray-800 font-bold mt-2">Reportes</Text>
              <Text className="text-gray-500 text-xs mt-1">Generar informes</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/2 pr-2 mb-3"
            onPress={handleViewRequests}
          >
            <View className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
              <Ionicons name="people" size={28} color="#F97316" />
              <Text className="text-gray-800 font-bold mt-2">Solicitudes</Text>
              <Text className="text-gray-500 text-xs mt-1">
                {pendingRequests.length} pendiente{pendingRequests.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-1/2 pl-2 mb-3"
            onPress={() => router.push('/(tabs)/dashboard')}
          >
            <View className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
              <Ionicons name="analytics" size={28} color="#3B82F6" />
              <Text className="text-gray-800 font-bold mt-2">Dashboard</Text>
              <Text className="text-gray-500 text-xs mt-1">Ver métricas</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Listado de Estaciones Afiliadas */}
      <View className="px-4 pb-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-gray-800">
            Estaciones Afiliadas ({affiliatedStations.length})
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/institution-stations')}>
            <Text className="text-primario font-semibold">Ver todas</Text>
          </TouchableOpacity>
        </View>

        {affiliatedStations.length > 0 ? (
          affiliatedStations.slice(0, 3).map((station, index) => (
            <StationCard
              key={station.id || index}
              station={station}
              onPress={() => handleStationPress(station)}
            />
          ))
        ) : (
          <View className="bg-white rounded-lg p-6 items-center shadow-sm">
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