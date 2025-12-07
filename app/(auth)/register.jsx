import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/shared/context/AuthContext';
import { formatApiErrors } from '../../src/shared/utils';

/**
 * Pantalla de registro de nuevos usuarios.
 * Recolecta datos básicos y crea una cuenta en el sistema.
 * Al registrarse exitosamente, redirige automáticamente a la app principal.
 */
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    confirmPassword: "",
    userType: "",
  });
  const [loading, setLoading] = useState(false);

  /**
   * Actualiza un campo específico del formulario
   */
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Maneja el proceso de registro.
   * Valida datos, llama a la API y maneja errores.
   */
  const handleRegister = async () => {
    // Validaciones básicas
    if (!formData.username || !formData.email || !formData.password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await signUp(userData);
      
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta ha sido creada correctamente',
        [{ text: 'OK' }]
      );
    } catch (error) {
      const errors = formatApiErrors(error, 'Error al registrar usuario');
      Alert.alert('Error', errors.join('\n'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primario mb-2">Crear cuenta</Text>
            <Text className="text-sm text-gray-600">Completa tus datos para registrarte</Text>
          </View>

          {/* Formulario */}
          <View className="space-y-4">
            {/* Nombre de usuario */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Nombre
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Ingresa tu nombre de usuario"
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                autoComplete="name"
                editable={!loading}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Contraseña */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Establezca una contraseña"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                autoComplete="password-new"
                editable={!loading}
              />
            </View>

            {/* Confirmar contraseña */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="Confirme su contraseña"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
                autoComplete="password-new"
                editable={!loading}
              />
            </View>

            {/* Botón de Registro */}
            <TouchableOpacity
              className={`rounded-lg py-4 mt-6 ${loading ? 'bg-gray-400' : 'bg-primario'}`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Registrarse
                </Text>
              )}
            </TouchableOpacity>

            {/* Link a Login */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text className="text-primario font-semibold">Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}