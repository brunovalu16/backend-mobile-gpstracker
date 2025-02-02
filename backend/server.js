import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import admin from "firebase-admin"; // Importando Firebase Admin diretamente

// 📌 🔹 Importando as rotas de autenticação e GPS
import authRoutes from "./routes/auth.js"; // Importando as rotas corretamente
import gpsRoutes from "./routes/gps.js"; // Corrigindo a importação da rota GPS
import fs from "fs";

// 🔹 Definição do app e servidor antes de usar `app.use()`
const app = express();

app.use(express.json()); //✅ Garante que req.body seja processado corretamente

// 🔹 Adicionando rotas depois da inicialização do `app`
app.use("/gps", gpsRoutes);
app.use("/auth", authRoutes);


const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

// 🔹 Lendo o arquivo de credenciais do Firebase Admin SDK
const serviceAccountPath = "./serviceAccountKey.json";
if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ ERRO: Arquivo serviceAccountKey.json não encontrado!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
console.log("✅ Arquivo serviceAccountKey.json lido com sucesso!");

// 🔹 Inicializando Firebase Admin SDK com as credenciais de serviço
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK inicializado!");
} else {
  console.log("Firebase Admin SDK já está inicializado.");
}


// 🔹 Testando conexão com Firestore
const adminDb = admin.firestore();
adminDb
  .collection("test")
  .add({ message: "Firestore está funcionando!" })
  .then(() => console.log("✅ Conexão com Firestore funcionando!"))
  .catch((error) => console.error("❌ ERRO ao conectar ao Firestore:", error));


app.get("/", (req, res) => {
  res.send("🚀 Backend GPS-Tracker rodando!");
});

// 🔹 Implementação do WebSocket para atualização em tempo real
io.on("connection", (socket) => {
  console.log("🟢 Novo cliente conectado!");

  socket.on("update-location", (data) => {
    console.log(`📍 Localização recebida:`, data);
    
    // 🔹 Envia os dados para todos os clientes conectados
    io.emit("location-update", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

server.listen(4000, () => {
  console.log("🚀 Servidor rodando na porta 4000!");
});
