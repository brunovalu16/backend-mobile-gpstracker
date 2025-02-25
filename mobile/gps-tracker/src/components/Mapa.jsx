import React, { useEffect, useState } from "react";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import { View, ActivityIndicator, StyleSheet } from "react-native";

const Mapa = ({ userId }) => {
  const [history, setHistory] = useState([]);
  const [region, setRegion] = useState({
    latitude: -16.7821,
    longitude: -49.2399,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      console.error("Erro: userId não definido!");
      return;
    }

    const fetchHistory = async () => {
      try {
        console.log(`🔄 Buscando histórico para userId: ${userId}`);
        const response = await axios.get(`http://192.168.102.162:4000/gps/history/${userId}`);
        
        console.log("📡 Dados recebidos:", response.data);

        if (response.data.length > 0) {
          const locations = response.data.map((item) => ({
            latitude: item.latitude,
            longitude: item.longitude,
          }));

          setHistory(locations);

          // Atualiza o centro do mapa para a última localização recebida
          setRegion({
            latitude: locations[locations.length - 1].latitude,
            longitude: locations[locations.length - 1].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } catch (error) {
        console.error("❌ Erro ao buscar histórico de localização:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <MapView style={styles.map} region={region} showsUserLocation={true}>
      {history.map((point, index) => (
        <Marker key={index} coordinate={point} />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 500,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
});

export default Mapa;
