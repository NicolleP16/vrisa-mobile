import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/shared/context/AuthContext";

/**
 * Pantalla principal de la aplicación móvil.
 */

const ORGANIZATION_ROLES = {
  INSTITUTION: 'institution',
  STATION_ADMIN: 'station_admin',
  RESEARCHER: 'researcher'
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);

  // Configuración de roles con sus rutas y datos
  const roleConfig = {
    [ORGANIZATION_ROLES.INSTITUTION]: {
      title: "Representante de Institución",
      desc: "Registra tu organización y gestiona redes de monitoreo.",
      icon: "business",
      gradientColors: ["#3b82f6", "#2563eb"],
      route: '/complete-registration/institution'
    },
    [ORGANIZATION_ROLES.STATION_ADMIN]: {
      title: "Administrador de Estación",
      desc: "Conecta tus sensores y estaciones a una red existente.",
      icon: "radio",
      gradientColors: ["#a855f7", "#7e22ce"],
      route: '/complete-registration/station'
    },
    [ORGANIZATION_ROLES.RESEARCHER]: {
      title: "Investigador",
      desc: "Accede a datos históricos y análisis de calidad del aire.",
      icon: "analytics",
      gradientColors: ["#6366f1", "#4338ca"],
      route: '/complete-registration/researcher'
    }
  };

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
            }
          }
        }
      ]
    );
  };

  // Obtener el rol y estado del usuario
  const currentRole = user?.primary_role || 'citizen';
  const roleStatus = user?.role_status || 'APPROVED';
  const isCitizen = currentRole === 'citizen';

  // Determinar si tiene una solicitud pendiente
  const isPending = roleStatus === 'PENDING' && !isCitizen;
  const pendingRoleData = roleConfig[currentRole];

  if (loading || authLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4339F2" />
        <Text className="mt-4 text-slate-600">Cargando opciones...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white border-b border-slate-200 pt-12 pb-4 px-6">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-2">
            <Text className="text-2xl font-bold text-blue-600">VriSA</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Text className="text-slate-700 font-medium">Hola, {user?.first_name || 'Usuario'}</Text>
            <Pressable 
              onPress={handleLogout}
              className="border border-red-200 px-3 py-2 rounded-lg active:bg-red-50"
            >
              <Text className="text-red-500 text-sm font-medium">Salir</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Banner de solicitud pendiente */}
      {isPending && pendingRoleData && (
        <View className="bg-orange-500 px-6 py-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name="alert-circle" size={24} color="white" />
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Tu solicitud está en proceso.
              </Text>
              <Text className="text-white text-sm mt-1 opacity-95">
                Tienes un rol de {pendingRoleData.title} pendiente. Completa tu perfil para agilizar la aprobación.
              </Text>
            </View>
            <Pressable 
              onPress={() => router.push(pendingRoleData.route)}
              className="bg-white px-5 py-2 rounded-lg active:bg-orange-50"
            >
              <Text className="text-orange-600 font-semibold">Completar ahora</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* CASO 1: Usuario con Rol Pendiente */}
          {isPending && pendingRoleData ? (
            <View className="items-center">
              <View className="mb-8">
                <Text className="text-3xl font-bold text-slate-900 text-center">
                  ¡Bienvenido a VriSA, {user?.first_name}!
                </Text>
                <Text className="text-slate-600 text-center mt-3 text-base">
                  Has solicitado el rol de <Text className="font-bold">{pendingRoleData.title}</Text>.{"\n"}
                  Necesitamos información adicional para validar tu cuenta.
                </Text>
              </View>

              <View className="w-full max-w-sm">
                <RoleCard 
                  title={pendingRoleData.title}
                  desc={pendingRoleData.desc}
                  icon={pendingRoleData.icon}
                  onPress={() => router.push(pendingRoleData.route)}
                  buttonText="Continuar Registro"
                  highlight={true}
                />
              </View>
            </View>
          ) : (
            /* CASO 2: Usuario Aprobado o Ciudadano */
            <View>
              <View className="mb-8">
                <Text className="text-3xl font-bold text-slate-900 text-center">
                  ¡Bienvenido a VriSA, {user?.first_name}!
                </Text>
                <Text className="text-slate-600 text-center mt-3 text-base">
                  {isCitizen 
                    ? "Como ciudadano, puedes consultar la calidad del aire y acceder a reportes públicos."
                    : `Tu perfil de ${currentRole} está activo. Explora las opciones disponibles.`
                  }
                </Text>
              </View>

              <View className="gap-6">
                <FeatureCard
                  icon="grid"
                  title="Dashboard"
                  description="Visualiza el estado de la calidad del aire en tiempo real."
                  onPress={() => router.push('/(tabs)/dashboard')}
                />

                <FeatureCard
                  icon="document-text"
                  title="Reportes"
                  description="Consulta informes históricos y estadísticas ambientales."
                  onPress={() => router.push('/(tabs)/reports')}
                />

                <FeatureCard
                  icon="location"
                  title="Estaciones"
                  description="Explora las estaciones de monitoreo disponibles."
                  onPress={() => router.push('/(tabs)/stations')}
                />

                {/* Solo para administradores de estación */}
                {currentRole === 'station_admin' && roleStatus === 'APPROVED' && (
                  <FeatureCard
                    icon="construct"
                    title="Mantenimiento"
                    description="Gestiona los registros de mantenimiento de sensores."
                    onPress={() => router.push('/maintenance/logs')}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/* Componentes auxiliares */
function RoleCard({ title, desc, icon, onPress, buttonText = "Seleccionar", highlight = false }) {
  return (
    <Pressable 
      onPress={onPress}
      className={`bg-white rounded-2xl overflow-hidden ${
        highlight 
          ? 'border-2 border-indigo-200 shadow-lg' 
          : 'border border-slate-200 shadow-sm active:shadow-md'
      }`}
    >
      {/* Header */}
      <View className="h-32 bg-gradient-to-br from-blue-500 to-blue-600 items-center justify-center">
        <Ionicons name={icon} size={56} color="white" />
      </View>

      {/* Body */}
      <View className="p-6">
        <Text className="text-xl font-bold text-slate-900 text-center mb-3">
          {title}
        </Text>
        <Text className="text-slate-600 text-center mb-6 leading-6">
          {desc}
        </Text>
        
        <Pressable 
          onPress={onPress}
          className={`py-3 rounded-lg active:opacity-80 ${
            highlight 
              ? 'bg-indigo-600' 
              : 'border border-slate-300 bg-white'
          }`}
        >
          <Text className={`text-center font-semibold ${
            highlight ? 'text-white' : 'text-slate-700'
          }`}>
            {buttonText}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function FeatureCard({ icon, title, description, onPress }) {
  return (
    <Pressable 
      onPress={onPress}
      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm active:shadow-md active:border-indigo-300"
    >
      <View className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl items-center justify-center mb-4">
        <Ionicons name={icon} size={32} color="white" />
      </View>
      
      <Text className="text-xl font-bold text-slate-900 mb-2">
        {title}
      </Text>
      
      <Text className="text-slate-600 leading-6">
        {description}
      </Text>
    </Pressable>
  );
}