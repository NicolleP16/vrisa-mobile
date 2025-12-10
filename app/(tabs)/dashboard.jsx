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
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { UserAPI, MeasurementAPI, StationAPI } from '../../src/shared/api';
import { StatCard, StationCard } from '../../src/shared/components';

/**
 * Página principal del Dashboard
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aqiData, setAqiData] = useState(null);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    try {
      setLoading(true);

      const storedData = await AsyncStorage.getItem('userData');
      const token = await AsyncStorage.getItem('token');

      if (!token || !storedData) {
        router.replace('/');
        return;
      }

      const parsedUser = JSON.parse(storedData);
      setUser(parsedUser);

      if (parsedUser.user_id) {
        try {
          const freshUserData = await UserAPI.getUserById(parsedUser.user_id);

          const mergedUser = {
            ...parsedUser,
            ...freshUserData,
            institution_name: freshUserData.institution?.institute_name,
          };

          setUser(mergedUser);
          await AsyncStorage.setItem('userData', JSON.stringify(mergedUser));
        } catch (apiError) {
          console.error('Could not fetch fresh user data:', apiError);
        }
      }

      await loadDashboardData();
    } catch (err) {
      console.error('Dashboard initialization error:', err);
      Alert.alert('Error', 'Error cargando sesión');
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'userData']);
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [aqiResponse, stationsResponse] = await Promise.all([
        MeasurementAPI.getCurrentAQI().catch(() => null),
        StationAPI.getStations().catch(() => []),
      ]);

      setAqiData(aqiResponse);
      setStations(Array.isArray(stationsResponse) ? stationsResponse : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del dashboard');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'refreshToken', 'userData']);
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getAQILevel = (aqi) => {
    if (aqi <= 50) return { text: 'Bueno', color: '#10B981' };
    if (aqi <= 100) return { text: 'Moderado', color: '#F59E0B' };
    if (aqi <= 150) return { text: 'Poco Saludable (SG)', color: '#F97316' };
    if (aqi <= 200) return { text: 'Poco Saludable', color: '#EF4444' };
    if (aqi <= 300) return { text: 'Muy Poco Saludable', color: '#9333EA' };
    return { text: 'Peligroso', color: '#7F1D1D' };
  };

  // Verificar si el usuario necesita completar su registro
  const isCitizen = !user?.belongs_to_organization || user?.requested_role === 'citizen';
  const hasInstitutionAssigned = user?.institution_id || user?.institution;
  const needsRegistrationCompletion = !isCitizen && !user?.registration_complete && !hasInstitutionAssigned;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando dashboard...</Text>
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
      {/* Banner de completar registro */}
      {needsRegistrationCompletion && (
        <View className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded-lg">
          <View className="flex-row items-center">
            <Ionicons name="alert-circle-outline" size={24} color="#F59E0B" />
            <View className="flex-1 ml-3">
              <Text className="font-bold text-yellow-800">
                Tu registro está incompleto
              </Text>
              <Text className="text-yellow-700 text-sm mt-1">
                Completa tu registro para acceder a todas las funcionalidades.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            className="bg-yellow-400 rounded-lg py-2 px-4 mt-3"
            onPress={() => router.push('/complete-registration')}
          >
            <Text className="text-yellow-900 font-semibold text-center">
              Completar registro
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <Text className="text-white text-lg">
          Hola, {user?.first_name || 'Usuario'}
        </Text>
        <Text className="text-white text-2xl font-bold mt-1">
          Calidad del Aire en Cali
        </Text>
        {user?.institution_name && (
          <Text className="text-white/80 text-sm mt-1">
            {user.institution_name}
          </Text>
        )}
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
                router.push(`/stations/${station.id}`);
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