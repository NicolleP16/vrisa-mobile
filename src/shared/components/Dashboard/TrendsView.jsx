import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { MeasurementAPI } from "../../api";
import { VARIABLE_COLORS } from "../../constants/colors";

/**
 * Componente para la vista de gráficas de tendencias de varibles contaminantes en el dashboard.
 * @param {Array} props.stations - Lista de estaciones disponibles para filtrar.
 * @returns {JSX.Element} Componente de vista de tendencias.
 */
export default function TrendsView({stations}) {
  const [selectedStation, setSelectedStation] = useState("");
  const [variable, setVariable] = useState("PM2.5");
  const [period, setPeriod] = useState(24);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const variablesList = ["PM2.5", "PM10", "CO", "NO2", "SO2", "O3", "TEMP", "HUM"];
  const periodsList = [
    {label: "24h", value: 24},
    {label: "7d", value: 168},
    {label: "30d", value: 720},
  ];

  const activeColor = VARIABLE_COLORS[variable] || VARIABLE_COLORS.DEFAULT;

  const formatLabel = (dateString) => {
    const date = new Date(dateString);
    if (period <= 24) return `${date.getHours()}:00`;
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const downsampleData = (rawData, targetPoints = 30) => {
    if (!rawData || rawData.length === 0) return null;
    if (rawData.length <= targetPoints) {
      return {
        labels: rawData.map((d) => formatLabel(d.measure_date)),
        data: rawData.map((d) => d.value),
      };
    }
    const blockSize = Math.floor(rawData.length / targetPoints);
    const averagedData = [];
    const labels = [];
    for (let i = 0; i < targetPoints; i++) {
      const start = i * blockSize;
      const end = start + blockSize;
      const chunk = rawData.slice(start, end);
      if (chunk.length === 0) continue;
      const sum = chunk.reduce((acc, curr) => acc + curr.value, 0);
      averagedData.push(sum / chunk.length);
      const midItem = chunk[Math.floor(chunk.length / 2)];
      labels.push(formatLabel(midItem.measure_date));
    }
    return {labels, data: averagedData};
  };

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - period * 60 * 60 * 1000);

        const filters = {
          variable_code: variable,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        };

        if (selectedStation) {
          filters.station_id = selectedStation;
        }

        const data = await MeasurementAPI.getHistoricalData(filters);
        const processed = downsampleData(data, 25);

        if (processed && processed.data.length > 0) {
          const step = Math.ceil(processed.labels.length / 5);
          const visibleLabels = processed.labels.map((label, index) => (index % step === 0 ? label : ""));

          setChartData({
            labels: visibleLabels,
            datasets: [{data: processed.data}],
            legend: [`Tendencia ${variable}`],
          });
        } else {
          setChartData(null);
        }
      } catch (error) {
        console.error("Error history:", error);
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [selectedStation, variable, period]);

  return (
    <View className="px-4 pb-10">
      {/* Filtro: Estación */}
      <View className="mb-4">
        <Text className="text-sm font-bold text-gray-700 mb-2">Estación</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <TouchableOpacity
            onPress={() => setSelectedStation("")}
            className={`px-4 py-2 rounded-full mr-2 border ${selectedStation === "" ? "bg-primario border-primario" : "bg-white border-gray-300"}`}
          >
            <Text className={`${selectedStation === "" ? "text-white" : "text-gray-600"}`}>Todas (Cali)</Text>
          </TouchableOpacity>
          {stations &&
            stations.map((st, index) => (
              <TouchableOpacity
                key={st.station_id || index}
                onPress={() => setSelectedStation(st.station_id)}
                className={`px-4 py-2 rounded-full mr-2 border ${selectedStation === st.station_id ? "bg-primario border-primario" : "bg-white border-gray-300"}`}
              >
                <Text className={`${selectedStation === st.station_id ? "text-white" : "text-gray-600"}`}>{st.station_name}</Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      {/* Filtro: Variable */}
      <View className="mb-4">
        <Text className="text-sm font-bold text-gray-700 mb-2">Variable</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {variablesList.map((v) => {
            const isActive = variable === v;
            const varColor = VARIABLE_COLORS[v] || VARIABLE_COLORS.DEFAULT;
            return (
              <TouchableOpacity
                key={v}
                onPress={() => setVariable(v)}
                style={{
                  backgroundColor: isActive ? varColor : "white",
                  borderColor: isActive ? varColor : "#d1d5db",
                  borderWidth: 1,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 9999,
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: isActive ? "white" : "#4b5563",
                    fontWeight: isActive ? "bold" : "normal",
                  }}
                >
                  {v}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Filtro: Periodo */}
      <View className="mb-6 flex-row bg-gray-200 p-1 rounded-lg">
        {periodsList.map((p) => (
          <TouchableOpacity key={p.value} onPress={() => setPeriod(p.value)} className={`flex-1 py-2 rounded-md ${period === p.value ? "bg-white shadow-sm" : ""}`}>
            <Text className={`text-center font-medium ${period === p.value ? "text-primario" : "text-gray-500"}`}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gráfica */}
      <View className="bg-white rounded-xl p-2 shadow-sm items-center overflow-hidden">
        {loading ? (
          <ActivityIndicator size="large" color={activeColor} className="py-10" />
        ) : chartData ? (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={250}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => activeColor,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: {borderRadius: 16},
              propsForDots: {r: "0", strokeWidth: "0"},
              propsForBackgroundLines: {
                stroke: "#E5E7EB",
                strokeDasharray: "",
                strokeWidth: 1,
              },
            }}
            bezier
            style={{marginVertical: 8, borderRadius: 16, paddingRight: 40}}
          />
        ) : (
          <View className="py-10 items-center">
            <MaterialCommunityIcons name="chart-line-variant" size={48} color="#cbd5e1" />
            <Text className="text-gray-400 mt-2">No hay datos para este periodo</Text>
          </View>
        )}
      </View>

      <View className="mt-4 bg-blue-50 p-3 rounded-lg flex-row items-center">
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text className="text-blue-700 text-xs ml-2 flex-1">La gráfica muestra el promedio de la concentración para facilitar la lectura en dispositivos móviles.</Text>
      </View>
    </View>
  );
}
