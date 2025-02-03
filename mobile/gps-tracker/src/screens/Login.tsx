import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login realizado com sucesso!");
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
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>Login</Text>
      
      <TextInput
        placeholder="E-mail"
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 20 }}
      />

      <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: "#007bff", padding: 15, borderRadius: 5, marginBottom: 10 }}>
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleRegister} style={{ backgroundColor: "#28a745", padding: 15, borderRadius: 5 }}>
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}
