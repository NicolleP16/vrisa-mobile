import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { StatCard } from "../StatCard";
import { StationCard } from "../StationCard";

/**
 * Componente para la vista de Métricas en el Dashboard.
 * Muestra las métricas principales de calidad del aire y clima, así como la lista de estaciones.
 * @param {Object} props.aqiData - Datos del índice de calidad del aire (AQI).
 * @param {boolean} props.aqiLoading - Indicador de carga para los datos AQI.
 * @param {Object} props.latestMeasurements - Últimas mediciones de variables climáticas.
 * @param {Array} props.stations - Lista de estaciones para mostrar.
 * @param {Object} props.router - Objeto de enrutador para navegación.
 * @param {string} props.ICON_COLOR - Color de los íconos.
 * @param {string} props.COLOR_NORMAL - Color para estado normal.
 * @param {string} props.COLOR_ALERT - Color para estado de alerta.
 * @return {JSX.Element} Componente de vista de métricas.
 */
export default function MetricsView({aqiData, aqiLoading, latestMeasurements, stations, router, ICON_COLOR, COLOR_NORMAL, COLOR_ALERT}) {
  const getPollutantStatus = (key) => {
    if (aqiLoading && !aqiData) return {value: "...", color: "#e2e8f0", label: "Cargando..."};
    if (!aqiData || !aqiData.sub_indices) return {value: "--", color: "#e2e8f0", label: "Sin datos"};

    const value = aqiData.sub_indices?.[key];
    const valDisplay = value !== undefined ? Math.round(value) : "0";
    const isDominant = aqiData.dominant_pollutant === key;

    return {
      value: String(valDisplay),
      color: isDominant ? COLOR_ALERT : COLOR_NORMAL,
      label: isDominant ? "Dominante" : "Normal",
    };
  };

  const formatClimateValue = (key, unit, defaultText = "--") => {
    const item = latestMeasurements?.[key];
    if (item && item.value !== undefined) return `${Math.round(item.value)}${item.unit || unit}`;
    if (aqiLoading) return "...";
    return defaultText;
  };

  const metricsConfig = [
    {key: "PM2.5", label: "PM2.5", icon: <Ionicons name="cloud" size={20} color={ICON_COLOR} />},
    {key: "PM10", label: "PM10", icon: <MaterialCommunityIcons name="weather-fog" size={20} color={ICON_COLOR} />},
    {key: "CO", label: "CO", icon: <MaterialCommunityIcons name="factory" size={20} color={ICON_COLOR} />},
    {key: "NO2", label: "NO2", icon: <Ionicons name="flame" size={20} color={ICON_COLOR} />},
    {key: "SO2", label: "SO2", icon: <Ionicons name="flash" size={20} color={ICON_COLOR} />},
    {key: "O3", label: "OZONO", icon: <MaterialCommunityIcons name="weather-windy" size={20} color={ICON_COLOR} />},
  ];

  return (
    <View>
      <View className="px-4 mb-4">
        <StatCard
          label="ÍNDICE DE CALIDAD (AQI)"
          value={aqiData ? String(Math.round(aqiData.aqi)) : aqiLoading ? "..." : "--"}
          unit={aqiData?.category || "Sin datos"}
          icon={<Ionicons name="pulse" size={24} color={aqiData?.color || ICON_COLOR} />}
          colorHex={aqiData?.color || "#e2e8f0"}
          statusColor={aqiData?.color}
          borderType="full"
        />
      </View>

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

      <View className="px-4 mt-2">
        <Text className="text-lg font-bold text-gray-800 mb-3">Clima</Text>
        <View className="flex-row justify-between">
          <View style={{width: "48%"}}>
            <StatCard label="TEMPERATURA" value={formatClimateValue("TEMP", "°C")} unit="Ambiente" icon={<Ionicons name="thermometer" size={20} color={ICON_COLOR} />} />
          </View>
          <View style={{width: "48%"}}>
            <StatCard label="HUMEDAD" value={formatClimateValue("HUM", "%")} unit="Relativa" icon={<Ionicons name="water" size={20} color={ICON_COLOR} />} />
          </View>
        </View>
      </View>

      <View className="px-4 mt-6 pb-8">
        <Text className="text-lg font-bold text-gray-800 mb-3">Red de Monitoreo</Text>
        {stations && stations.length > 0 ? (
          stations.map((station, index) => <StationCard key={station.station_id || index} station={station} onPress={() => router.push(`/stations/${station.station_id}`)} />)
        ) : (
          <View className="bg-white rounded-lg p-6 items-center shadow-sm">
            <Ionicons name="construct-outline" size={40} color="#cbd5e1" />
            <Text className="text-gray-500 mt-2 text-center">No hay estaciones disponibles.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
