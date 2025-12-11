import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { StationAPI } from '../../src/shared/api';
import { StationCard } from '../../src/shared/components';

export default function PublicNetworkPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      // El backend, para ciudadanos/anonimos, debería devolver solo las activas
      // O podemos filtrar aquí por si acaso
      const response = await StationAPI.getStations();
      setStations(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View className="bg-primario px-4 pt-6 pb-8">
        <Text className="text-white text-2xl font-bold">Red de Monitoreo</Text>
        <Text className="text-white/80 text-sm mt-1">Estaciones públicas de VriSA</Text>
      </View>

      <View className="px-4 mt-6 pb-6">
        {stations.length > 0 ? (
          stations.map((station, index) => (
            <StationCard 
              key={station.id || index} 
              station={station} 
              onPress={() => router.push(`/stations/${station.id}`)} // Ver detalle público
            />
          ))
        ) : (
            <View className="items-center mt-10">
                <Ionicons name="map-outline" size={48} color="#ccc" />
                <Text className="text-gray-500 mt-2">No hay estaciones públicas disponibles.</Text>
            </View>
        )}
      </View>
    </ScrollView>
  );
}