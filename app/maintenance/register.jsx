import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../src/shared/context/AuthContext';
import { SensorAPI } from '../../src/shared/api';

/**
 * Página de Registro de Mantenimiento
 */
export default function RegisterMaintenancePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sensors, setSensors] = useState([]);
  const [formData, setFormData] = useState({
    sensor: '',
    log_date: '',
    description: '',
    certificate: null,
  });

  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    try {
      setLoading(true);
      const response = await SensorAPI.getSensors();
      setSensors(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error loading sensors:', error);
      Alert.alert('Error', 'No se pudieron cargar los sensores');
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

        // Verificar tamaño (10MB máximo)
        if (file.size > 10 * 1024 * 1024) {
          Alert.alert('Error', 'El archivo no debe superar los 10MB');
          return;
        }

        setFormData({ ...formData, certificate: file });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'No se pudo seleccionar el archivo');
    }
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.sensor) {
      Alert.alert('Error', 'Debes seleccionar un sensor');
      return;
    }
    if (!formData.log_date) {
      Alert.alert('Error', 'Debes ingresar la fecha del mantenimiento');
      return;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Debes ingresar una descripción del mantenimiento');
      return;
    }

    try {
      setSubmitting(true);

      // Crear FormData si hay certificado
      const submitData = new FormData();
      submitData.append('sensor', formData.sensor);
      submitData.append('log_date', new Date(formData.log_date).toISOString());
      submitData.append('description', formData.description);

      if (formData.certificate) {
        submitData.append('certificate', {
          uri: formData.certificate.uri,
          type: 'application/pdf',
          name: formData.certificate.name || 'certificate.pdf',
        });
      }

      await SensorAPI.createMaintenanceLog(submitData);

      Alert.alert(
        'Éxito',
        'Registro de mantenimiento creado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      Alert.alert('Error', 'No se pudo crear el registro de mantenimiento');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando sensores...</Text>
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
                Nuevo Mantenimiento
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Registra las actividades realizadas
              </Text>
            </View>
          </View>
        </View>

        {/* Formulario */}
        <View className="px-4 mt-6">
          {/* Selector de sensor */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Sensor <Text className="text-red-500">*</Text>
            </Text>
            <View className="bg-white rounded-lg border border-gray-300">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {sensors.map((sensor) => (
                  <TouchableOpacity
                    key={sensor.id}
                    className={`px-4 py-3 border-r border-gray-200 ${
                      formData.sensor === sensor.id ? 'bg-blue-50' : ''
                    }`}
                    onPress={() => setFormData({ ...formData, sensor: sensor.id })}
                  >
                    <Text
                      className={`font-medium ${
                        formData.sensor === sensor.id
                          ? 'text-primario'
                          : 'text-gray-700'
                      }`}
                    >
                      {sensor.model} - {sensor.serial_number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Fecha de mantenimiento */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Fecha y Hora del Mantenimiento <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="YYYY-MM-DD HH:MM"
              value={formData.log_date}
              onChangeText={(text) =>
                setFormData({ ...formData, log_date: text })
              }
            />
            <Text className="text-xs text-gray-500 mt-1">
              Formato: 2024-01-15 14:30
            </Text>
          </View>

          {/* Descripción */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Descripción de Actividades <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="bg-white border border-gray-300 rounded-lg px-4 py-3"
              placeholder="Calibración, limpieza, reemplazo de componentes, etc."
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Certificado de calibración */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Certificado de Calibración (Opcional)
            </Text>
            <TouchableOpacity
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 items-center"
              onPress={handlePickDocument}
            >
              {formData.certificate ? (
                <View className="items-center">
                  <Ionicons name="document-attach" size={48} color="#10B981" />
                  <Text className="text-green-600 font-semibold mt-2">
                    {formData.certificate.name}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {(formData.certificate.size / 1024).toFixed(2)} KB
                  </Text>
                  <TouchableOpacity
                    className="mt-3"
                    onPress={() => setFormData({ ...formData, certificate: null })}
                  >
                    <Text className="text-red-500 text-sm">Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons name="cloud-upload-outline" size={48} color="#9CA3AF" />
                  <Text className="text-gray-600 font-semibold mt-2">
                    Seleccionar archivo PDF
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Máximo 10MB
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Botones */}
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
                  Registrar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
