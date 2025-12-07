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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Maneja el proceso de inicio de sesión.
   * Valida campos, llama a la API y maneja errores.
   */
  const handleLogin = async () => {
    // Validación básica de campos
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password); // guarda el token y actualiza el contexto
    } catch (error) {
      const errors = formatApiErrors(error, 'Error al iniciar sesión');
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
            <Text className="text-base text-gray-600">Sistema de Monitoreo Ambiental</Text>
          </View>

          {/* Formulario */}
          <View className="space-y-4">
            {/* Campo de email */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Campo de contraseña */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                editable={!loading}
              />
            </View>

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