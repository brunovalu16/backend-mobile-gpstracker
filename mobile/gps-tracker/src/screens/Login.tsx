import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

// 🔹 Defina o tipo das telas disponíveis na navegação
type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

// 🔹 Tipo da navegação (corrigindo o erro do TypeScript)
type NavigationProps = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<NavigationProps>(); // 🔹 CORREÇÃO: Define o tipo correto

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login realizado com sucesso!");
      navigation.navigate("Home"); // 🔹 Agora o TypeScript reconhece "Home"
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro ao logar", error.message);
      } else {
        Alert.alert("Erro ao logar", "Ocorreu um erro desconhecido.");
      }
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Usuário cadastrado com sucesso!");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro ao cadastrar", error.message);
      } else {
        Alert.alert("Erro ao cadastrar", "Ocorreu um erro desconhecido.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />

      <TouchableOpacity onPress={handleLogin} style={[styles.button, { backgroundColor: "#007bff" }]}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRegister} style={[styles.button, { backgroundColor: "#28a745" }]}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
