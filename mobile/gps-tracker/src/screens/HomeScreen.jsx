import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebaseConfig";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Location from "expo-location";
import { io } from "socket.io-client";
import Mapa from "../components/Mapa";

// 🔹 Configurar WebSocket corretamente
const SERVER_URL = "wss://websocket-server-6kox.onrender.com"; // 🔥 Use wss:// para WebSocket seguro

let socket = null;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationSubscription, setLocationSubscription] = useState(null);

  const userId = "1hKqpGXGwagvhLHz2fEdwR9GziQ2"; // ID do usuário

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    }

    // 🔹 Conectar ao WebSocket ao entrar na tela
    socket = io(SERVER_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("🟢 Conectado ao WebSocket");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Desconectado do WebSocket");
    });

    socket.on("location-update", (data) => {
      console.log("📡 Localização recebida do servidor:", data);
    });

    return () => {
      socket?.disconnect();
    };
  }, []);

  const handleStartTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão de Localização", "Você precisa conceder permissão para rastrear a localização.");
      return;
    }

    setTracking(true);

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        setLocation({ latitude, longitude });

        console.log("📍 Localização enviada para WebSocket:", {
          userId: user?.uid,
          latitude,
          longitude,
        });

        if (socket) {
          socket.emit("update-location", {
            userId: user?.uid,
            latitude,
            longitude,
          });
        }
      }
    );

    setLocationSubscription(subscription);
  };

  const handleStopTracking = () => {
    setTracking(false);
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    console.log("🚫 Rastreamento parado.");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <Icon name="user-circle" size={60} color="#007bff" />
        )}
        <Text style={styles.name}>{user?.displayName || "Usuário"}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Text style={styles.info}>
        Localização Atual: {location ? `${location.latitude}, ${location.longitude}` : "Aguardando..."}
      </Text>

      {/* 🔹 Adicionando o Mapa Aqui */}
      <View style={styles.mapContainer}>
        <Text style={styles.title}>📍 Mapa de Localização</Text>
        <Mapa userId={userId} />
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: tracking ? "#dc3545" : "#28a745" }]}
        onPress={tracking ? handleStopTracking : handleStartTracking}
      >
        <Icon name={tracking ? "stop" : "play"} size={20} color="#fff" />
        <Text style={styles.buttonText}>{tracking ? "Parar Rota" : "Iniciar Rota"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Icon name="sign-out" size={20} color="#fff" />
        <Text style={styles.buttonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    color: "#007bff",
    marginBottom: 20,
  },
  mapContainer: {
    width: "100%",
    height: 400,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 5,
    width: "80%",
    marginVertical: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
  },
});
