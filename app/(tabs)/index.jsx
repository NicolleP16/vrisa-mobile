import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

/**
 * Página principal de la aplicación móvil.
 * - Si el usuario ya eligió un rol durante el registro, muestra solo ese rol para completar
 * - Si es ciudadano, muestra la vista de ciudadano
 * - Si tiene registro completo, muestra opciones generales
 */

const ORGANIZATION_ROLES = {
  INSTITUTION: 'institution',
  STATION_ADMIN: 'station_admin',
  RESEARCHER: 'researcher'
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configuración de roles con sus rutas y datos
  const roleConfig = {
    [ORGANIZATION_ROLES.INSTITUTION]: {
      title: "Representante de Institución",
      desc: "Registra tu organización y gestiona redes de monitoreo.",
      icon: "business",
      gradientColors: ["#3b82f6", "#2563eb"],
      route: '/register-institution'
    },
    [ORGANIZATION_ROLES.STATION_ADMIN]: {
      title: "Administrador de Estación",
      desc: "Conecta tus sensores y estaciones a una red existente.",
      icon: "radio",
      gradientColors: ["#a855f7", "#7e22ce"],
      route: '/register-station'
    },
    [ORGANIZATION_ROLES.RESEARCHER]: {
      title: "Investigador",
      desc: "Accede a datos históricos y análisis de calidad del aire.",
      icon: "analytics",
      gradientColors: ["#6366f1", "#4338ca"],
      route: '/register-researcher'
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser({
          first_name: "Usuario",
          email: "usuario@example.com"
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
      router.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Verificar el estado del usuario
  const requestedRole = user?.requested_role || user?.role;
  const isCitizen = user?.belongs_to_organization === false || requestedRole === 'citizen';
  const hasInstitutionAssigned = user?.institution_id || user?.institution;
  
  const hasCompletedRegistration = isCitizen || hasInstitutionAssigned || user?.registration_complete === true;
  const hasSpecificRole = requestedRole && requestedRole !== 'citizen' && roleConfig[requestedRole];
  
  // Determinar qué vista mostrar
  const shouldShowSingleRole = hasSpecificRole && !hasCompletedRegistration;
  const shouldShowAllRoleCards = 
    !isCitizen && 
    !hasCompletedRegistration && 
    !hasSpecificRole &&
    user?.belongs_to_organization === true;

  if (loading) {
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
            <Text className="text-slate-700 font-medium">Hola, {user?.first_name}</Text>
            <Pressable 
              onPress={handleLogout}
              className="border border-red-200 px-3 py-2 rounded-lg active:bg-red-50"
            >
              <Text className="text-red-500 text-sm font-medium">Salir</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Banner de completar registro */}
      {shouldShowSingleRole && (
        <View className="bg-orange-500 px-6 py-4">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl">⚠️</Text>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">
                Tu registro está incompleto
              </Text>
              <Text className="text-white text-sm mt-1 opacity-95">
                Completa tu registro como {roleConfig[requestedRole]?.title}
              </Text>
            </View>
            <Pressable 
              onPress={() => router.push(roleConfig[requestedRole]?.route)}
              className="bg-white px-5 py-2 rounded-lg active:bg-orange-50"
            >
              <Text className="text-orange-600 font-semibold">Completar</Text>
            </Pressable>
          </View>
        </View>
      )}

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Vista para usuario con rol específico pendiente */}
          {shouldShowSingleRole && (
            <View className="items-center">
              <View className="mb-8">
                <Text className="text-3xl font-bold text-slate-900 text-center">
                  ¡Bienvenido a VriSA, {user?.first_name}!
                </Text>
                <Text className="text-slate-600 text-center mt-3 text-base">
                  Completa tu registro como{" "}
                  <Text className="font-bold">{roleConfig[requestedRole].title}</Text>
                  {" "}para acceder a todas las funcionalidades.
                </Text>
              </View>

              <View className="w-full max-w-sm">
                <RoleCard 
                  title={roleConfig[requestedRole].title}
                  desc={roleConfig[requestedRole].desc}
                  icon={roleConfig[requestedRole].icon}
                  onPress={() => router.push(roleConfig[requestedRole].route)}
                  buttonText="Completar registro"
                  highlight={true}
                />
              </View>

              <View className="mt-12 bg-white px-6 py-4 rounded-full border border-slate-200">
                <Text className="text-slate-500 text-sm text-center">
                  Mientras tanto, explora las opciones del menú
                </Text>
              </View>
            </View>
          )}

          {/* Vista para selección de múltiples roles */}
          {shouldShowAllRoleCards && (
            <View>
              <View className="mb-8">
                <Text className="text-3xl font-bold text-slate-900 text-center">
                  ¡Bienvenido a VriSA, {user?.first_name}!
                </Text>
                <Text className="text-slate-600 text-center mt-3 text-base">
                  Selecciona el rol que deseas solicitar para completar tu registro.
                </Text>
              </View>

              <View className="gap-6">
                <RoleCard 
                  title="Representante de Institución"
                  desc="Registra tu organización y gestiona redes de monitoreo."
                  icon="business"
                  onPress={() => router.push('/register-institution')}
                />
                
                <RoleCard 
                  title="Administrador de Estación"
                  desc="Conecta tus sensores y estaciones a una red existente."
                  icon="radio"
                  onPress={() => router.push('/register-station')}
                />

                <RoleCard 
                  title="Investigador"
                  desc="Accede a datos históricos y análisis de calidad del aire."
                  icon="analytics"
                  onPress={() => router.push('/register-researcher')}
                />
              </View>

              <View className="mt-12 bg-white px-6 py-4 rounded-full border border-slate-200">
                <Text className="text-slate-500 text-sm text-center">
                  ¿No deseas registrar un rol? Explora las opciones del menú
                </Text>
              </View>
            </View>
          )}

          {/* Vista para ciudadanos y usuarios con registro completo */}
          {!shouldShowSingleRole && !shouldShowAllRoleCards && (
            <View>
              <View className="mb-8">
                <Text className="text-3xl font-bold text-slate-900 text-center">
                  ¡Bienvenido a VriSA, {user?.first_name}!
                </Text>
                <Text className="text-slate-600 text-center mt-3 text-base">
                  {isCitizen 
                    ? "Como ciudadano, puedes consultar la calidad del aire y acceder a reportes públicos."
                    : "Tu registro está completo. Explora las opciones disponibles."
                  }
                </Text>
              </View>

              <View className="gap-6">
                <FeatureCard
                  icon="grid"
                  title="Dashboard"
                  description="Visualiza el estado de la calidad del aire en tiempo real."
                  onPress={() => router.push('/dashboard')}
                />

                <FeatureCard
                  icon="document-text"
                  title="Reportes"
                  description="Consulta informes históricos y estadísticas ambientales."
                  onPress={() => router.push('/reports')}
                />

                <FeatureCard
                  icon="location"
                  title="Estaciones"
                  description="Explora las estaciones de monitoreo disponibles."
                  onPress={() => router.push('/stations')}
                />
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
      {/* Header con ícono */}
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