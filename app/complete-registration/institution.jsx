import React, { useState } from 'react';
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
import { InstitutionAPI } from '../../src/shared/api';

/**
 * Página de Registro Completo de Institución
 */
export default function RegisterInstitutionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nit: '',
    address: '',
    city: 'Cali',
    representative_name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
    email: user?.email || '',
    phone: user?.phone || '',
    documentation: null,
  });

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

        setFormData({ ...formData, documentation: file });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Debes ingresar el nombre de la institución');
      return;
    }
    if (!formData.nit.trim()) {
      Alert.alert('Error', 'Debes ingresar el NIT');
      return;
    }
    if (!formData.address.trim()) {
      Alert.alert('Error', 'Debes ingresar la dirección');
      return;
    }

    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('nit', formData.nit);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('representative_name', formData.representative_name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);

      if (formData.documentation) {
        submitData.append('documentation', {
          uri: formData.documentation.uri,
          type: 'application/pdf',
          name: formData.documentation.name || 'documentation.pdf',
        });
      }

      await InstitutionAPI.registerInstitution(submitData);

      Alert.alert(
        'Éxito',
        'Registro de institución enviado. Será revisado por un administrador.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('Error registering institution:', error);
      Alert.alert('Error', 'No se pudo completar el registro');
    } finally {
      setSubmitting(false);
    }
  };

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
                Registro de Institución
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Completa la información de tu organización
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
                Esta información será validada por un administrador antes de
                aprobar tu cuenta.
              </Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Nombre de la Institución <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Universidad, Empresa, ONG, etc."
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              NIT <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="000000000-0"
              value={formData.nit}
              onChangeText={(text) => setFormData({ ...formData, nit: text })}
              keyboardType="numeric"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Dirección <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Dirección completa de la institución"
              value={formData.address}
              onChangeText={(text) =>
                setFormData({ ...formData, address: text })
              }
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Ciudad
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Text className="text-gray-800">{formData.city}</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Nombre del Representante
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              value={formData.representative_name}
              onChangeText={(text) =>
                setFormData({ ...formData, representative_name: text })
              }
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </Text>
            <View className="bg-gray-50 rounded-lg px-4 py-3">
              <Text className="text-gray-800">{formData.email}</Text>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Teléfono
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="+57 3001234567"
              value={formData.phone}
              onChangeText={(text) =>
                setFormData({ ...formData, phone: text })
              }
              keyboardType="phone-pad"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Documentación de Soporte (Opcional)
            </Text>
            <TouchableOpacity
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
              onPress={handlePickDocument}
            >
              {formData.documentation ? (
                <View className="items-center">
                  <Ionicons name="document-attach" size={48} color="#10B981" />
                  <Text className="text-green-600 font-semibold mt-2">
                    {formData.documentation.name}
                  </Text>
                  <TouchableOpacity
                    className="mt-3"
                    onPress={() =>
                      setFormData({ ...formData, documentation: null })
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
                    Cámara de comercio, RUT, etc.
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
