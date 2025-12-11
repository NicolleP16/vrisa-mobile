import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/shared/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

/**
 * Layout principal con navegación por tabs (pestañas inferiores).
 */
export default function TabsLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#394BBD" />
      </View>
    );
  }

  // Determinar si el usuario es representante de institución
  const isInstitutionWorker = user?.primary_role === 'institution_worker' ||
                              user?.primary_role === 'institution';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#394BBD',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#394BBD',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      {/* Dashboard de Institución - solo para representantes */}
      {isInstitutionWorker && (
        <Tabs.Screen
          name="institution-dashboard"
          options={{
            title: 'Panel Institución',
            tabBarLabel: 'Panel',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="business" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* Dashboard general*/}
      {!isInstitutionWorker && (
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* Mis Estaciones - solo para representantes de institución */}
      {isInstitutionWorker && (
        <Tabs.Screen
          name="institution-stations"
          options={{
            title: 'Mis Estaciones',
            tabBarLabel: 'Estaciones',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio" size={size} color={color} />
            ),
          }}
        />
      )}

      {/* Estaciones */}
      {!isInstitutionWorker && (
        <Tabs.Screen
          name="stations"
          options={{
            title: 'Estaciones',
            tabBarLabel: 'Estaciones',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarLabel: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}