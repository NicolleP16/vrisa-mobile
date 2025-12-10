import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Tarjeta de estadística para mostrar métricas
 */
export const StatCard = ({ 
  title, 
  label,
  value, 
  unit, 
  icon, 
  color = '#394BBD', 
  subtitle,
  statusColor,
  colorHex
}) => {

  const displayTitle = title || label;
  const displayColor = statusColor || colorHex || color;

  return (
    <View className="bg-white rounded-lg p-4 shadow-md flex-1 mx-1 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-600 text-sm font-medium uppercase">
          {displayTitle}
        </Text>
        
        {icon && (
          <View className="bg-blue-50 rounded-full p-2">
            {typeof icon === 'string' ? (
              <Ionicons name={icon} size={20} color={displayColor} />
            ) : (
              icon
            )}
          </View>
        )}
      </View>
      
      <View className="flex-row items-baseline">
        <Text className="text-2xl font-bold" style={{ color: displayColor }}>
          {value}
        </Text>
        {unit && (
          <Text className="text-gray-500 text-sm ml-1">{unit}</Text>
        )}
      </View>
      
      {subtitle && (
        <Text className="text-gray-400 text-xs mt-1">{subtitle}</Text>
      )}
    </View>
  );
};