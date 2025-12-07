import { Stack } from 'expo-router';
import { AuthProvider } from '../src/shared/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

/**
 * Layout raíz de la aplicación.
 * Define la navegación principal tipo Stack.
 */
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}