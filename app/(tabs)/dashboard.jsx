import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { MeasurementAPI, StationAPI } from "../../src/shared/api";
import { MetricsView, TrendsView } from "../../src/shared/components";

export default function DashboardPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState("metrics");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [aqiData, setAqiData] = useState(null);
  const [stations, setStations] = useState([]);
  const [latestMeasurements, setLatestMeasurements] = useState(null);
  const [aqiLoading, setAqiLoading] = useState(true);

  // Colores globales para la vista de Métricas
  const ICON_COLOR = "#64748b";
  const COLOR_NORMAL = "#22C55E";
  const COLOR_ALERT = "#EF4444";

  useEffect(() => {
    initDashboard();
  }, []);

  useEffect(() => {
    let intervalId;
    if (!loading && activeView === "metrics") {
      intervalId = setInterval(() => loadDashboardData(true), 5000);
    }
    return () => clearInterval(intervalId);
  }, [loading, activeView]);

  const initDashboard = async () => {
    try {
      setLoading(true);
      const storedData = await AsyncStorage.getItem("userData");
      const token = await AsyncStorage.getItem("token");

      if (!token || !storedData) {
        router.replace("/");
        return;
      }

      setUser(JSON.parse(storedData));
      await loadDashboardData(false);
    } catch (err) {
      console.error(err);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async (silent = false) => {
    try {
      if (!silent) setAqiLoading(true);

      const stationsResponse = await StationAPI.getStations().catch(() => []);

      // Manejo de la respuesta de estaciones
      let stationsArray = [];
      if (Array.isArray(stationsResponse)) {
        stationsArray = stationsResponse;
      } else if (stationsResponse && Array.isArray(stationsResponse.results)) {
        stationsArray = stationsResponse.results;
      }
      setStations(stationsArray);

      const stationId = stationsArray.length > 0 ? stationsArray[0].station_id : null;

      const [aqiResponse, measurementsResponse] = await Promise.all([MeasurementAPI.getCurrentAQI(stationId), MeasurementAPI.getLatestMeasurements(stationId)]);

      setAqiData(aqiResponse);
      setLatestMeasurements(measurementsResponse);
    } catch (error) {
      if (!silent) console.log("Error dashboard data:", error);
    } finally {
      if (!silent) setAqiLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData(false);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#394BBD" />
      </View>
    );
  }

  const isCitizen = !user?.belongs_to_organization || user?.requested_role === "citizen";
  const hasInstitutionAssigned = user?.institution_id || user?.institution;
  const needsRegistrationCompletion = !isCitizen && !user?.registration_complete && !hasInstitutionAssigned;

  return (
    <ScrollView className="flex-1 bg-gray-50" refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {needsRegistrationCompletion && (
        <View className="bg-orange-50 border-l-4 border-orange-400 p-4 mx-4 mt-4 rounded-lg flex-row items-center">
          <Ionicons name="alert-circle" size={24} color="#F97316" />
          <View className="flex-1 ml-3">
            <Text className="font-bold text-orange-800">Registro incompleto</Text>
            <TouchableOpacity onPress={() => router.push("/complete-registration")}>
              <Text className="text-orange-600 font-bold mt-1">Completar ahora →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Header */}
      <View className="bg-primario px-4 pt-6 pb-14 mb-[-25px]">
        <Text className="text-white text-lg">Hola, {user?.first_name || "Usuario"}</Text>
        <Text className="text-white text-2xl font-bold mt-1">Calidad del Aire</Text>
        {user?.institution_name && <Text className="text-white/80 text-sm mt-1">{user.institution_name}</Text>}
      </View>

      {/* Control de Tabs */}
      <View className="px-4 mb-6">
        <View className="bg-white rounded-xl p-1 shadow-md flex-row">
          <TouchableOpacity className={`flex-1 py-3 rounded-lg ${activeView === "metrics" ? "bg-primario" : "bg-transparent"}`} onPress={() => setActiveView("metrics")}>
            <Text className={`text-center font-bold ${activeView === "metrics" ? "text-white" : "text-gray-500"}`}>Métricas</Text>
          </TouchableOpacity>
          <TouchableOpacity className={`flex-1 py-3 rounded-lg ${activeView === "trends" ? "bg-primario" : "bg-transparent"}`} onPress={() => setActiveView("trends")}>
            <Text className={`text-center font-bold ${activeView === "trends" ? "text-white" : "text-gray-500"}`}>Tendencias</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Renderizado Condicional */}
      {activeView === "metrics" ? (
        <MetricsView
          aqiData={aqiData}
          aqiLoading={aqiLoading}
          latestMeasurements={latestMeasurements}
          stations={stations}
          router={router}
          ICON_COLOR={ICON_COLOR}
          COLOR_NORMAL={COLOR_NORMAL}
          COLOR_ALERT={COLOR_ALERT}
        />
      ) : (
        <TrendsView stations={stations} />
      )}
    </ScrollView>
  );
}
