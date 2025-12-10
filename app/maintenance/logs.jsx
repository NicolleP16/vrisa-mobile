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
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/shared/context/AuthContext';
import { SensorAPI } from '../../src/shared/api';

/**
 * Página de Mantenimiento
 */
export default function MaintenanceLogsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadMaintenanceLogs();
  }, []);

  const loadMaintenanceLogs = async () => {
    try {
      setLoading(true);
      const response = await SensorAPI.getMaintenanceLogs();
      setLogs(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading maintenance logs:', error);
      Alert.alert('Error', 'No se pudieron cargar los registros de mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMaintenanceLogs();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando registros...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="bg-primario px-4 pt-12 pb-8">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">
                Registros de Mantenimiento
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Historial de mantenimientos realizados
              </Text>
            </View>
          </View>
        </View>

        {/* Botón para nuevo registro */}
        <View className="px-4 -mt-4 mb-6">
          <TouchableOpacity
            className="bg-white rounded-lg p-4 shadow-md flex-row items-center justify-between"
            onPress={() => router.push('/maintenance/register')}
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-green-50 rounded-full p-3 mr-3">
                <Ionicons name="add-circle" size={24} color="#10B981" />
              </View>
              <Text className="text-lg font-bold text-gray-800">
                Nuevo Mantenimiento
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Lista de registros */}
        <View className="px-4 pb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Historial ({logs.length})
          </Text>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <View key={log.id || index} className="bg-white rounded-lg p-4 mb-3 shadow-md">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-blue-50 rounded-full p-2 mr-3">
                        <Ionicons name="construct" size={20} color="#394BBD" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-800">
                          {log.sensor_model || 'Sensor'}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          S/N: {log.sensor_serial || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    {log.description && (
                      <Text className="text-sm text-gray-700 mb-2">
                        {log.description}
                      </Text>
                    )}

                    <View className="flex-row items-center mt-2">
                      <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                      <Text className="text-xs text-gray-600 ml-2">
                        {new Date(log.log_date).toLocaleString('es-ES', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </Text>
                    </View>

                    {log.performed_by && (
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="person-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-600 ml-2">
                          Realizado por: {log.performed_by}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {log.has_certificate && (
                  <View className="border-t border-gray-100 pt-3 mt-2">
                    <TouchableOpacity className="flex-row items-center">
                      <Ionicons name="document-attach" size={16} color="#394BBD" />
                      <Text className="text-sm text-primario font-semibold ml-2">
                        Ver certificado de calibración
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className="bg-white rounded-lg p-6 items-center">
              <Ionicons name="construct-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-4 text-center">
                No hay registros de mantenimiento
              </Text>
              <TouchableOpacity
                className="bg-primario rounded-lg px-6 py-3 mt-4"
                onPress={() => router.push('/maintenance/register')}
              >
                <Text className="text-white font-semibold">
                  Crear Primer Registro
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}