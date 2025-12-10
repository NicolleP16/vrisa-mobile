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
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../src/shared/context/AuthContext';
import { UserAPI, InstitutionAPI } from '../../src/shared/api';

/**
 * Página de Registro Completo de Investigador
 */
export default function RegisterResearcherPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [formData, setFormData] = useState({
    job_title: '',
    institution: '',
    research_area: '',
    credentials: null,
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

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success' || !result.canceled) {
        const file = result.assets ? result.assets[0] : result;

        if (file.size > 10 * 1024 * 1024) {
          Alert.alert('Error', 'El archivo no debe superar los 10MB');
          return;
        }

        setFormData({ ...formData, credentials: file });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleSubmit = async () => {
    if (!formData.job_title.trim()) {
      Alert.alert('Error', 'Debes ingresar tu cargo o título');
      return;
    }
    if (!formData.institution) {
      Alert.alert('Error', 'Debes seleccionar una institución');
      return;
    }
    if (!formData.research_area.trim()) {
      Alert.alert('Error', 'Debes ingresar tu área de investigación');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('job_title', formData.job_title);
      submitData.append('institution', formData.institution);
      submitData.append('research_area', formData.research_area);

      if (formData.credentials) {
        submitData.append('credentials', {
          uri: formData.credentials.uri,
          type: 'application/pdf',
          name: formData.credentials.name || 'credentials.pdf',
        });
      }

      await UserAPI.updateUserProfile(user.id, submitData);

      Alert.alert(
        'Éxito',
        'Perfil de investigador actualizado. Será revisado por un administrador.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating researcher profile:', error);
      Alert.alert('Error', 'No se pudo completar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando datos...</Text>
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
                Registro de Investigador
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Completa tu perfil de investigador
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
                Como investigador, tendrás acceso a datos históricos y herramientas
                de análisis avanzadas.
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Cargo o Título <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Ej: PhD en Ciencias Ambientales"
              value={formData.job_title}
              onChangeText={(text) =>
                setFormData({ ...formData, job_title: text })
              }
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Área de Investigación <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Ej: Calidad del Aire, Cambio Climático"
              value={formData.research_area}
              onChangeText={(text) =>
                setFormData({ ...formData, research_area: text })
              }
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-4">
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

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Credenciales (Opcional)
            </Text>
            <TouchableOpacity
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
              onPress={handlePickDocument}
            >
              {formData.credentials ? (
                <View className="items-center">
                  <Ionicons name="document-attach" size={48} color="#10B981" />
                  <Text className="text-green-600 font-semibold mt-2">
                    {formData.credentials.name}
                  </Text>
                  <TouchableOpacity
                    className="mt-3"
                    onPress={() =>
                      setFormData({ ...formData, credentials: null })
                    }
                  >
                    <Text className="text-red-500 text-sm">Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons
                    name="cloud-upload-outline"
                    size={48}
                    color="#9CA3AF"
                  />
                  <Text className="text-gray-600 font-semibold mt-2">
                    Seleccionar PDF
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Diploma, certificaciones, publicaciones
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
                  Enviar Solicitud
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
