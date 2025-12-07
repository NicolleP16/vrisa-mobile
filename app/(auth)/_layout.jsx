import { Stack } from 'expo-router';

/**
 * Layout de autenticación con navegación Stack.
 * Agrupa las pantallas de login y register.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}