import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Tarjeta para mostrar información de una estación de monitoreo
 */
export const StationCard = ({ station, onPress }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'online':
      case 'active':
        return '#10B981'; // green
      case 'offline':
      case 'inactive':
        return '#EF4444'; // red
      case 'maintenance':
        return '#F59E0B'; // amber
      default:
        return '#6B7280'; // gray
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#10B981'; // Good - green
    if (aqi <= 100) return '#F59E0B'; // Moderate - amber
    if (aqi <= 150) return '#F97316'; // Unhealthy for sensitive - orange
    if (aqi <= 200) return '#EF4444'; // Unhealthy - red
    if (aqi <= 300) return '#9333EA'; // Very unhealthy - purple
    return '#7F1D1D'; // Hazardous - maroon
  };

  const statusColor = getStatusColor(station.status);
  const aqiColor = station.aqi ? getAQIColor(station.aqi) : '#6B7280';

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-4 mb-3 shadow-md"
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">{station.name}</Text>
          {station.location && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-1">{station.location}</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center">
          <View
            className="w-2 h-2 rounded-full mr-2"
            style={{ backgroundColor: statusColor }}
          />
          <Text className="text-xs text-gray-600 capitalize">
            {station.status || 'Desconocido'}
          </Text>
        </View>
      </View>

      {station.aqi !== undefined && (
        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <Text className="text-sm text-gray-600">AQI</Text>
          <View className="flex-row items-center">
            <Text
              className="text-lg font-bold mr-2"
              style={{ color: aqiColor }}
            >
              {station.aqi}
            </Text>
            <View
              className="px-2 py-1 rounded"
              style={{ backgroundColor: `${aqiColor}20` }}
            >
              <Text className="text-xs font-semibold" style={{ color: aqiColor }}>
                {station.aqi <= 50 ? 'Bueno' :
                 station.aqi <= 100 ? 'Moderado' :
                 station.aqi <= 150 ? 'Poco Saludable (SG)' :
                 station.aqi <= 200 ? 'Poco Saludable' :
                 station.aqi <= 300 ? 'Muy Poco Saludable' : 'Peligroso'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {station.last_reading && (
        <Text className="text-xs text-gray-400 mt-2">
          Última lectura: {station.last_reading}
        </Text>
      )}
    </TouchableOpacity>
  );
};
