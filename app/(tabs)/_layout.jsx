import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { USER_ROLES } from "../../src/shared/constants/roles";
import { useAuth } from "../../src/shared/context/AuthContext";

export default function TabsLayout() {
  const {user, loading} = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#394BBD" />
      </View>
    );
  }

  // Lógica de roles
  const role = user?.primary_role;
  const isSuperAdmin = role === USER_ROLES.SUPER_ADMIN;
  const isInstitutionHead = role === USER_ROLES.INSTITUTION_HEAD;
  const isStationAdmin = role === USER_ROLES.STATION_ADMIN;
  // Usuarios públicos (Ciudadano o Investigador)
  const isPublicUser = role === USER_ROLES.CITIZEN || role === USER_ROLES.RESEARCHER;
  // Grupos de acceso
  const isManager = isSuperAdmin || isInstitutionHead;

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {backgroundColor: "#394BBD"},
        headerTintColor: "#fff",
        headerTitleStyle: {fontWeight: "bold"},
        tabBarActiveTintColor: "#394BBD",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarLabel: "Inicio",
          tabBarIcon: ({color, size}) => <Ionicons name="home" size={size} color={color} />,
        }}
      />

      {/* Dashboard de métricas */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({color, size}) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />

      {/* Panel de administración de institución */}
      <Tabs.Screen
        name="institution-admin-panel"
        options={{
          title: "Administración",
          tabBarLabel: "Admin",
          href: isInstitutionHead ? undefined : null,
          tabBarIcon: ({color, size}) => <Ionicons name="business" size={size} color={color} />,
        }}
      />

      {/* Gestión de estaciones para Managers (SuperAdmin y Head) */}
      <Tabs.Screen
        name="list-stations"
        options={{
          title: "Gestión Estaciones",
          tabBarLabel: "Estaciones",
          href: isManager ? undefined : null,
          tabBarIcon: ({color, size}) => <Ionicons name="list" size={size} color={color} />,
        }}
      />

      {/* Estado de la estación - Solo para station_admin */}
      <Tabs.Screen
        name="station-status"
        options={{
          title: "Mi Estación",
          tabBarLabel: "Mi Estación",
          href: isStationAdmin ? undefined : null,
          tabBarIcon: ({color, size}) => <Ionicons name="construct" size={size} color={color} />,
        }}
      />

      {/* Rutas públicas */}
      <Tabs.Screen
        name="public-network"
        options={{
          title: "Red Pública",
          tabBarLabel: "Red",
          href: isPublicUser ? undefined : null,
          tabBarIcon: ({color, size}) => <Ionicons name="map" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Reportes",
          tabBarLabel: "Reportes",
          tabBarIcon: ({color, size}) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarLabel: "Perfil",
          tabBarIcon: ({color, size}) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
