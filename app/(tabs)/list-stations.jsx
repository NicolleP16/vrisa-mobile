import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/shared/context/AuthContext';
import { StationAPI } from '../../src/shared/api';
import { StationCard, StatCard } from '../../src/shared/components';

export default function ListStationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState([]);

  // Título dinámico según rol
  const pageTitle = user?.primary_role === 'super_admin' ? 'Todas las Estaciones' : 'Estaciones de la Institución';

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      // El backend decide qué devolver basado en el token del usuario (SuperAdmin=Todo, Head=Suyas)
      const response = await StationAPI.getStations();
      setStations(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error cargando estaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStations();
    setRefreshing(false);
  };

  if (loading) return <ActivityIndicator size="large" color="#394BBD" className="flex-1" />;

  const activeStations = stations.filter(s => s.operative_status === 'ACTIVE').length;
  const maintenanceStations = stations.filter(s => s.operative_status === 'MAINTENANCE').length;

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-8">
        <Text className="text-white text-2xl font-bold">{pageTitle}</Text>
        <Text className="text-white/80 text-sm mt-1">Gestión y monitoreo</Text>
      </View>

      {/* Resumen */}
      <View className="px-4 -mt-4 mb-6">
        <View className="flex-row flex-wrap">
          <View className="w-1/3 pr-1"><StatCard title="Total" value={stations.length} icon="radio" color="#394BBD" /></View>
          <View className="w-1/3 px-1"><StatCard title="Activas" value={activeStations} icon="checkmark-circle" color="#10B981" /></View>
          <View className="w-1/3 pl-1"><StatCard title="Mant." value={maintenanceStations} icon="construct" color="#F59E0B" /></View>
        </View>
      </View>

      {/* Lista */}
      <View className="px-4 pb-6">
        {stations.map((station, index) => (
          <StationCard 
            key={station.id || index} 
            station={station} 
            // Al hacer click, un admin/head podría querer ver detalles o editar
            onPress={() => router.push(`/stations/${station.id}`)} 
          />
        ))}
        {stations.length === 0 && (
          <Text className="text-center text-gray-500 mt-10">No hay estaciones registradas.</Text>
        )}
      </View>
    </ScrollView>
  );
}
