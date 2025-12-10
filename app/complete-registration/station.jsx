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
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/shared/context/AuthContext';
import { StationAPI, InstitutionAPI } from '../../src/shared/api';

/**
 * Página de Registro Completo de Estación
 */
export default function RegisterStationPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    institution: '',
  });

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      const response = await InstitutionAPI.getInstitutions();
      setInstitutions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Debes ingresar el nombre de la estación');
      return;
    }
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Debes ingresar la ubicación');
      return;
    }
    if (!formData.institution) {
      Alert.alert('Error', 'Debes seleccionar una institución');
      return;
    }

    try {
      setSubmitting(true);

      const stationData = {
        name: formData.name,
        location: formData.location,
        institution: formData.institution,
      };

      if (formData.latitude && formData.longitude) {
        stationData.latitude = parseFloat(formData.latitude);
        stationData.longitude = parseFloat(formData.longitude);
      }

      await StationAPI.registerStation(stationData);

      Alert.alert(
        'Éxito',
        'Estación registrada correctamente. Será revisada por un administrador.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error registering station:', error);
      Alert.alert('Error', 'No se pudo completar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando instituciones...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView>
        {/* Header */}
        <View className="bg-primario px-4 pt-12 pb-8">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">
                Registro de Estación
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Registra tu estación de monitoreo
              </Text>
            </View>
          </View>
        </View>

        {/* Formulario */}
        <View className="px-4 mt-6">
          <View className="bg-blue-50 rounded-lg p-4 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
              <Text className="text-sm text-blue-700 ml-2 flex-1">
                Conecta tu estación de monitoreo a una red institucional existente.
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Nombre de la Estación <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Ej: Estación Norte"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Ubicación <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Dirección o descripción del lugar"
              value={formData.location}
              onChangeText={(text) =>
                setFormData({ ...formData, location: text })
              }
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Latitud (Opcional)
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="3.4516"
              value={formData.latitude}
              onChangeText={(text) =>
                setFormData({ ...formData, latitude: text })
              }
              keyboardType="decimal-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Longitud (Opcional)
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="-76.5319"
              value={formData.longitude}
              onChangeText={(text) =>
                setFormData({ ...formData, longitude: text })
              }
              keyboardType="decimal-pad"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Institución <Text className="text-red-500">*</Text>
            </Text>
            {institutions.length > 0 ? (
              <View className="bg-white border border-gray-300 rounded-lg">
                <ScrollView style={{ maxHeight: 200 }}>
                  {institutions.map((institution) => (
                    <TouchableOpacity
                      key={institution.id}
                      className={`px-4 py-3 border-b border-gray-200 ${
                        formData.institution === institution.id
                          ? 'bg-blue-50'
                          : ''
                      }`}
                      onPress={() =>
                        setFormData({ ...formData, institution: institution.id })
                      }
                    >
                      <Text
                        className={`font-medium ${
                          formData.institution === institution.id
                            ? 'text-primario'
                            : 'text-gray-700'
                        }`}
                      >
                        {institution.name}
                      </Text>
                      {institution.city && (
                        <Text className="text-xs text-gray-500 mt-1">
                          {institution.city}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View className="bg-white border border-gray-300 rounded-lg p-6 items-center">
                <Ionicons name="business-outline" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2 text-center">
                  No hay instituciones disponibles
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row space-x-3 mb-8">
            <TouchableOpacity
              className="flex-1 bg-gray-300 rounded-lg py-4 mr-2"
              onPress={() => router.back()}
              disabled={submitting}
            >
              <Text className="text-gray-700 font-bold text-center">
                Cancelar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-primario rounded-lg py-4 ml-2"
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-center">
                  Registrar Estación
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
