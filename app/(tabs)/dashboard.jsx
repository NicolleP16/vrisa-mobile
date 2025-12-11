import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MeasurementAPI, StationAPI, UserAPI } from "../../src/shared/api";
import { StatCard, StationCard } from "../../src/shared/components";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [aqiData, setAqiData] = useState(null);
  const [stations, setStations] = useState([]);
  const [aqiLoading, setAqiLoading] = useState(true);

  const ICON_COLOR = "#64748b";
  const COLOR_NORMAL = "#22C55E";
  const COLOR_ALERT = "#EF4444";

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    try {
      setLoading(true);
      const storedData = await AsyncStorage.getItem("userData");
      const token = await AsyncStorage.getItem("token");

      if (!token || !storedData) {
        router.replace("/");
        return;
      }

      const parsedUser = JSON.parse(storedData);
      setUser(parsedUser);

      if (parsedUser.user_id) {
        try {
          const freshUserData = await UserAPI.getUserById(parsedUser.user_id);
          const mergedUser = {
            ...parsedUser,
            ...freshUserData,
            institution_name: freshUserData.institution?.institute_name,
          };
          setUser(mergedUser);
          await AsyncStorage.setItem("userData", JSON.stringify(mergedUser));
        } catch (apiError) {
          console.error("Error actualizando usuario:", apiError);
        }
      }

      await loadDashboardData();
    } catch (err) {
      console.error("Error inicialización:", err);
      Alert.alert("Error", "Sesión expirada o inválida");
      await AsyncStorage.multiRemove(["token", "refreshToken", "userData"]);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setAqiLoading(true);
      // 1. Cargar estaciones primero
      const stationsResponse = await StationAPI.getStations().catch((err) => {
        console.log("Error Stations:", err);
        return [];
      });

      const loadedStations = Array.isArray(stationsResponse) ? stationsResponse : [];
      setStations(loadedStations);

      // 2. Determinar ID de estación (Usar la primera disponible o null)
      const stationId = loadedStations.length > 0 ? loadedStations[0].id : null;

      // 3. Cargar AQI solo si hay estación
      try {
        const aqiResponse = await MeasurementAPI.getCurrentAQI(stationId);
        setAqiData(aqiResponse);
      } catch (error) {
        console.log("Error AQI:", error);
        setAqiData(null);
      }
    } catch (error) {
      console.error("Error cargando dashboard:", error);
      setAqiData(null);
    } finally {
      setAqiLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const metricsConfig = [
    {key: "PM2.5", label: "PM2.5", icon: <Ionicons name="cloud" size={20} color={ICON_COLOR} />},
    {key: "PM10", label: "PM10", icon: <MaterialCommunityIcons name="weather-fog" size={20} color={ICON_COLOR} />},
    {key: "CO", label: "CO", icon: <MaterialCommunityIcons name="factory" size={20} color={ICON_COLOR} />},
    {key: "NO2", label: "NO2", icon: <Ionicons name="flame" size={20} color={ICON_COLOR} />},
    {key: "SO2", label: "SO2", icon: <Ionicons name="flash" size={20} color={ICON_COLOR} />},
    {key: "O3", label: "OZONO", icon: <MaterialCommunityIcons name="weather-windy" size={20} color={ICON_COLOR} />},
  ];

  const getPollutantStatus = (key) => {
    if (aqiLoading) {
      return {value: "...", color: "#e2e8f0", label: "Cargando..."};
    }

    // Terminó de cargar pero no hay datos (API devolvió null o error)
    if (!aqiData || !aqiData.sub_indices) {
      return {value: "--", color: "#e2e8f0", label: "Sin datos"};
    }

    const value = aqiData.sub_indices?.[key];
    const valDisplay = value !== undefined ? Math.round(value) : "0";
    const isDominant = aqiData.dominant_pollutant === key;

    return {
      value: String(valDisplay),
      color: isDominant ? COLOR_ALERT : COLOR_NORMAL,
      label: isDominant ? "Dominante" : "Normal",
    };
  };

  // Verificación de registro
  const isCitizen = !user?.belongs_to_organization || user?.requested_role === "citizen";
  const hasInstitutionAssigned = user?.institution_id || user?.institution;
  const needsRegistrationCompletion = !isCitizen && !user?.registration_complete && !hasInstitutionAssigned;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
        <Text className="mt-4 text-gray-600">Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Banner: Registro Incompleto */}
      {needsRegistrationCompletion && (
        <View className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-4 mt-4 rounded-lg flex-row items-center">
          <Ionicons name="alert-circle" size={24} color="#F97316" />
          <View className="flex-1 ml-3">
            <Text className="font-bold text-orange-800">Registro incompleto</Text>
            <Text className="text-orange-700 text-xs mt-1">Completa tu registro para acceder a todas las funcionalidades.</Text>
            <TouchableOpacity className="bg-orange-400 rounded-lg py-2 px-3 mt-2 self-start" onPress={() => router.push("/complete-registration")}>
              <Text className="text-white font-semibold text-xs">Completar ahora</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-12 mb-[-30px]">
        <Text className="text-white text-lg">Hola, {user?.first_name || "Usuario"}</Text>
        <Text className="text-white text-2xl font-bold mt-1">Calidad del Aire</Text>
        {user?.institution_name && <Text className="text-white/80 text-sm mt-1">{user.institution_name}</Text>}
      </View>

      {/* Tarjeta Principal AQI */}
      <View className="px-4 mb-4">
        <StatCard
          label="ÍNDICE DE CALIDAD (AQI)"
          value={aqiLoading ? "..." : aqiData ? String(Math.round(aqiData.aqi)) : "--"}
          unit={aqiData?.category || "Sin datos"}
          icon={<Ionicons name="pulse" size={24} color={aqiData?.color || ICON_COLOR} />}
          colorHex={aqiData?.color || "#e2e8f0"}
          statusColor={aqiData?.color}
          borderType="full"
        />
      </View>

      {/* Grid de Contaminantes */}
      <View className="px-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Métricas Principales</Text>
        <View className="flex-row flex-wrap justify-between">
          {metricsConfig.map((metric) => {
            const status = getPollutantStatus(metric.key);
            return (
              <View key={metric.key} style={{width: "48%"}}>
                <StatCard label={metric.label} value={status.value} unit={status.label} icon={metric.icon} colorHex={status.color} statusColor={status.color} borderType="left" />
              </View>
            );
          })}
        </View>
      </View>

      {/* Variables Climáticas */}
      <View className="px-4 mt-2">
        <Text className="text-lg font-bold text-gray-800 mb-3">Clima</Text>
        <View className="flex-row justify-between">
          <View style={{width: "48%"}}>
            <StatCard
              label="TEMPERATURA"
              value={aqiData?.temperature ? `${Math.round(aqiData.temperature)}°C` : "24°C"}
              unit="Ambiente"
              icon={<Ionicons name="thermometer" size={20} color={ICON_COLOR} />}
            />
          </View>
          <View style={{width: "48%"}}>
            <StatCard
              label="HUMEDAD"
              value={aqiData?.humidity ? `${Math.round(aqiData.humidity)}%` : "68%"}
              unit="Relativa"
              icon={<Ionicons name="water" size={20} color={ICON_COLOR} />}
            />
          </View>
        </View>
      </View>

      {/* Listado de Estaciones */}
      <View className="px-4 mt-6 pb-8">
        <Text className="text-lg font-bold text-gray-800 mb-3">Red de Monitoreo</Text>
        {stations.length > 0 ? (
          stations.map((station, index) => <StationCard key={station.id || index} station={station} onPress={() => router.push(`/stations/${station.id}`)} />)
        ) : (
          <View className="bg-white rounded-lg p-6 items-center shadow-sm">
            <Ionicons name="construct-outline" size={40} color="#cbd5e1" />
            <Text className="text-gray-500 mt-2 text-center">No hay estaciones disponibles en este momento.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
