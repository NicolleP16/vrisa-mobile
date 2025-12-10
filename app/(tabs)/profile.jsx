import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/shared/context/AuthContext';
import { UserAPI } from '../../src/shared/api';

/**
 * Página de Perfil de Usuario
 */
export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('personal'); // personal, security

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await UserAPI.getUserById(user.id);
        setUserData(response);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ]
    );
  };

  const getRoleLabel = (role) => {
    const roles = {
      citizen: 'Ciudadano',
      station_admin: 'Administrador de Estación',
      researcher: 'Investigador',
      institution: 'Representante de Institución',
      super_admin: 'Super Administrador',
    };
    return roles[role] || role;
  };

  const getRoleIcon = (role) => {
    const icons = {
      citizen: 'person',
      station_admin: 'radio',
      researcher: 'flask',
      institution: 'business',
      super_admin: 'shield-checkmark',
    };
    return icons[role] || 'person';
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando perfil...</Text>
      </View>
    );
  }

  const displayData = userData || user;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header con información básica */}
      <View className="bg-primario px-4 pt-6 pb-20">
        <View className="items-center">
          <View className="bg-white rounded-full w-24 h-24 items-center justify-center mb-4">
            <Ionicons
              name={getRoleIcon(displayData?.primary_role)}
              size={48}
              color="#394BBD"
            />
          </View>
          <Text className="text-white text-2xl font-bold">
            {displayData?.first_name} {displayData?.last_name}
          </Text>
          <View className="bg-white/20 px-4 py-2 rounded-full mt-2">
            <Text className="text-white text-sm">
              {getRoleLabel(displayData?.primary_role)}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="px-4 -mt-12 mb-6">
        <View className="bg-white rounded-lg p-1 shadow-md flex-row">
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              activeTab === 'personal' ? 'bg-primario' : ''
            }`}
            onPress={() => setActiveTab('personal')}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'personal' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Datos Personales
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded ${
              activeTab === 'security' ? 'bg-primario' : ''
            }`}
            onPress={() => setActiveTab('security')}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'security' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Seguridad
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido del tab */}
      <View className="px-4">
        {activeTab === 'personal' ? (
          <View className="bg-white rounded-lg p-4 shadow-md">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Información Personal
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Nombre
              </Text>
              <View className="bg-gray-50 rounded-lg px-4 py-3">
                <Text className="text-gray-800">{displayData?.first_name}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Apellido
              </Text>
              <View className="bg-gray-50 rounded-lg px-4 py-3">
                <Text className="text-gray-800">{displayData?.last_name}</Text>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Correo Electrónico
              </Text>
              <View className="bg-gray-50 rounded-lg px-4 py-3">
                <Text className="text-gray-800">{displayData?.email}</Text>
              </View>
            </View>

            {displayData?.phone && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Teléfono
                </Text>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Text className="text-gray-800">{displayData.phone}</Text>
                </View>
              </View>
            )}

            {displayData?.job_title && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Cargo
                </Text>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Text className="text-gray-800">{displayData.job_title}</Text>
                </View>
              </View>
            )}

            {displayData?.institution_name && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">
                  Institución
                </Text>
                <View className="bg-gray-50 rounded-lg px-4 py-3">
                  <Text className="text-gray-800">{displayData.institution_name}</Text>
                </View>
              </View>
            )}

            <View className="bg-blue-50 rounded-lg p-4 mt-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-sm text-blue-700 ml-2 flex-1">
                  Los datos personales no pueden ser modificados directamente.
                  Contacta al administrador para realizar cambios.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-lg p-4 shadow-md">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              Seguridad
            </Text>

            <View className="bg-amber-50 rounded-lg p-4">
              <View className="flex-row items-start">
                <Ionicons name="lock-closed" size={20} color="#F59E0B" />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-amber-700 mb-1">
                    Cambio de Contraseña
                  </Text>
                  <Text className="text-sm text-amber-600">
                    Para modificar tu contraseña, debes contactar al administrador
                    del sistema o usar el flujo de recuperación de contraseña.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Botón de cerrar sesión */}
      <View className="px-4 mt-6 mb-8">
        <TouchableOpacity
          className="bg-red-500 rounded-lg py-4 flex-row items-center justify-center shadow-md"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text className="text-white font-bold text-lg ml-2">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
