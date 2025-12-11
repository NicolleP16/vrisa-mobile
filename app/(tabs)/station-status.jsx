import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StationAPI, SensorAPI } from '../../src/shared/api';
import { SensorCard, StatCard } from '../../src/shared/components';

export default function StationStatusPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myStation, setMyStation] = useState(null);
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    loadMyStationData();
  }, []);

  const loadMyStationData = async () => {
    try {
      setLoading(true);
      // El backend filtra y devuelve las estaciones donde el usuario es manager
      const stations = await StationAPI.getStations();
      
      if (Array.isArray(stations) && stations.length > 0) {
        const station = stations[0]; // Un admin de estación suele tener una sola asignada
        setMyStation(station);
        
        // Cargar sensores de esa estación
        const sensorsData = await SensorAPI.getSensors(station.id);
        setSensors(Array.isArray(sensorsData) ? sensorsData : []);
      } else {
        setMyStation(null);
      }
    } catch (error) {
      console.error('Error cargando mi estación:', error);
      Alert.alert('Error', 'No se pudo cargar la información de tu estación.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMyStationData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
      </View>
    );
  }

  if (!myStation) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
        <Text className="text-gray-500 mt-4 text-center">
          No tienes una estación asignada o aún no ha sido aprobada.
        </Text>
      </View>
    );
  }

  const activeSensors = sensors.filter(s => s.status?.toLowerCase() === 'active').length;
  const maintenanceSensors = sensors.filter(s => s.status?.toLowerCase() === 'maintenance').length;

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">Estado de Estación</Text>
            <Text className="text-white/80 text-sm mt-1">
              Panel de control técnico
            </Text>
          </View>
          <Ionicons name="settings-outline" size={24} color="white" />
        </View>
      </View>

      {/* Estadísticas Rápidas */}
      <View className="px-4 -mt-4">
        <View className="flex-row flex-wrap">
          <View className="w-1/3 pr-1">
            <StatCard title="Activos" value={activeSensors} icon="checkmark-circle" color="#10B981" />
          </View>
          <View className="w-1/3 px-1">
            <StatCard title="Mantenimiento" value={maintenanceSensors} icon="construct" color="#F59E0B" />
          </View>
          <View className="w-1/3 pl-1">
            <StatCard title="Total" value={sensors.length} icon="hardware-chip" color="#394BBD" />
          </View>
        </View>
      </View>

      {/* Info Estación */}
      <View className="px-4 mt-6">
        <Text className="text-lg font-bold text-gray-800 mb-3">Información General</Text>
        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-xl font-bold text-gray-800">{myStation.station_name}</Text>
          <View className="flex-row items-center mt-2">
            <View className={`w-3 h-3 rounded-full mr-2 ${myStation.operative_status === 'ACTIVE' ? 'bg-green-500' : 'bg-orange-500'}`} />
            <Text className="text-gray-600">{myStation.operative_status}</Text>
          </View>
          {myStation.location && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="location" size={16} color="#6B7280" />
              <Text className="text-gray-600 ml-2">{myStation.address_reference || "Sin dirección"}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Lista Sensores */}
      <View className="px-4 mt-6 pb-6">
        <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold text-gray-800">Sensores Instalados</Text>
            <Ionicons name="add-circle-outline" size={24} color="#394BBD" onPress={() => Alert.alert("Info", "Contacta a tu institución para agregar sensores.")} />
        </View>
        
        {sensors.map((sensor, index) => (
          <SensorCard 
            key={sensor.id || index} 
            sensor={sensor} 
            onPress={() => router.push('/maintenance/logs')} // Podría llevar al historial de ese sensor
          />
        ))}
      </View>
    </ScrollView>
  );
}
