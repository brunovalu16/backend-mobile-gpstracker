import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import admin from "firebase-admin";
import authRoutes from "./routes/auth.js";
import gpsRoutes from "./routes/gps.js";
import fs from "fs";

// 🔹 Inicialização do app e servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// 🔹 Rotas
app.use("/gps", gpsRoutes);
app.use("/auth", authRoutes);

// 🔹 Lendo credenciais do Firebase
const serviceAccountPath = "./serviceAccountKey.json";
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ ERRO: Arquivo serviceAccountKey.json não encontrado!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
console.log("✅ Arquivo serviceAccountKey.json lido com sucesso!");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK inicializado com sucesso!");
} else {
  console.log("Firebase Admin SDK já está inicializado.");
}

const adminDb = admin.firestore();
adminDb
  .collection("test")
  .add({ message: "Firestore está funcionando!" })
  .then(() => console.log("✅ Conexão com Firestore funcionando!"))
  .catch((error) => console.error("❌ ERRO ao conectar ao Firestore:", error));

// 🔹 Testar rota
app.get("/", (req, res) => {
  res.send("🚀 Backend GPS-Tracker rodando!");
});

// 🔹 WebSocket
io.on("connection", (socket) => {
  console.log("🟢 Novo cliente conectado!");

  socket.on("update-location", async (data) => {
    console.log(`📍 Localização recebida:`, data);
  
    if (!data.userId || !data.latitude || !data.longitude) {
      console.error("❌ Dados inválidos recebidos!", data);
      return;
    }
  
    try {
      const userRef = admin.firestore().collection("locations").doc(data.userId);
  
      await userRef.set(
        {
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: admin.firestore.FieldValue.serverTimestamp(), // Atualiza o timestamp
        },
        { merge: true } // 🔹 Mantém o documento e apenas atualiza os campos
      );
  
      console.log(`✅ Localização atualizada no Firestore para usuário: ${data.userId}`);
  
      // Emitindo para os outros clientes
      io.emit("location-update", data);
    } catch (error) {
      console.error("❌ Erro ao atualizar localização no Firestore:", error);
    }
  });
  
  

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});


server.listen(4000, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando na porta 4000!");
});
