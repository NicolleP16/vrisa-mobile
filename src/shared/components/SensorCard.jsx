import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Tarjeta para mostrar información de un sensor
 */
export const SensorCard = ({ sensor, onPress }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'activo':
        return '#10B981'; // green
      case 'inactive':
      case 'inactivo':
        return '#6B7280'; // gray
      case 'maintenance':
      case 'mantenimiento':
        return '#F59E0B'; // amber
      default:
        return '#6B7280';
    }
  };

  const statusColor = getStatusColor(sensor.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 mb-3 shadow-md"
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <View className="bg-blue-50 rounded-full p-2 mr-3">
              <Ionicons name="hardware-chip" size={24} color="#394BBD" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800">
                {sensor.model || 'Sensor'}
              </Text>
              <Text className="text-sm text-gray-600">
                S/N: {sensor.serial_number || 'N/A'}
              </Text>
            </View>
          </View>

          {sensor.manufacturer && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="business-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {sensor.manufacturer}
              </Text>
            </View>
          )}

          {sensor.installation_date && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="calendar-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                Instalado: {new Date(sensor.installation_date).toLocaleDateString('es-ES')}
              </Text>
            </View>
          )}
        </View>

        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${statusColor}20` }}
        >
          <Text
            className="text-xs font-semibold capitalize"
            style={{ color: statusColor }}
          >
            {sensor.status || 'Desconocido'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};