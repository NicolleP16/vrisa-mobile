import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/shared/context/AuthContext';
import { formatApiErrors } from '../../src/shared/utils';

/**
 * Pantalla de inicio de sesión.
 * Permite a los usuarios autenticarse con email y contraseña.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  /**
   * Maneja el proceso de inicio de sesión.
   * Valida campos, llama a la API y maneja errores.
   */
  const handleLogin = async () => {
    // Validación básica de campos
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(formData.email, formData.password);
    } catch (error) {
      const errors = formatApiErrors(error, 'Error al iniciar sesión. Verifica tus credenciales.');
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
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-12">
            <Text className="text-4xl font-bold text-primario mb-2">VRISA</Text>
            <Text className="text-base text-gray-600">¡Bienvenido!</Text>
            <Text className="text-sm text-gray-500 mt-1">
              Ingresa tu correo y contraseña para iniciar sesión
            </Text>
          </View>

          {/* Formulario */}
          <View className="space-y-4">
            {/* Campo de email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                <Text className="text-red-500">* </Text>Correo electrónico
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Campo de contraseña */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                <Text className="text-red-500">* </Text>Contraseña
              </Text>
              <View className="relative">
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base pr-12"
                  placeholder="Ingresa tu contraseña"
                  value={formData.password}
                  onChangeText={(value) => handleChange('password', value)}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  editable={!loading}
                />
                <TouchableOpacity
                  className="absolute right-3 top-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text className="text-gray-500 text-lg">
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Olvidaste contraseña */}
            <TouchableOpacity>
              <Text className="text-primario text-sm text-right">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Botón de Login */}
            <TouchableOpacity
              className={`rounded-lg py-4 mt-6 ${loading ? 'bg-gray-400' : 'bg-primario'}`}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center text-base font-semibold">
                  Iniciar sesión
                </Text>
              )}
            </TouchableOpacity>

            {/* Link a Registro */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text className="text-primario font-semibold">Regístrate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}