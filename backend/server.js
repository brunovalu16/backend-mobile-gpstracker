import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import admin from "firebase-admin";
import authRoutes from "./routes/auth.js";
import gpsRoutes from "./routes/gps.js";

// 🔹 Inicialização do app e servidor
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// 🔹 Rotas
app.use("/gps", gpsRoutes);
app.use("/auth", authRoutes);

// 🔹 Usando variável de ambiente para as credenciais do Firebase
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error("❌ ERRO: Variável FIREBASE_SERVICE_ACCOUNT não encontrada!");
  process.exit(1);
}

// 🔹 Converte a string JSON da variável de ambiente para um objeto
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

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

// Rota no backend para o dashboard web acessar o histórico do usuário
app.get("/gps/history/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log(`🔍 Buscando histórico para o usuário: ${userId}`);

    // 🔹 Certifique-se de que estamos acessando exatamente o caminho correto no Firestore
    const historyRef = admin.firestore()
      .collection("locations")
      .doc(userId)
      .collection("history");

    const historySnapshot = await historyRef.orderBy("timestamp", "asc").get();

    console.log(`📡 Documentos encontrados: ${historySnapshot.size}`);

    if (historySnapshot.empty) {
      console.log("⚠️ Nenhum documento encontrado na subcoleção history.");
      return res.status(404).json({ message: "Nenhuma localização encontrada para este usuário." });
    }

    const history = historySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ Dados retornados:", history);
    res.json(history);
  } catch (error) {
    console.error("❌ Erro ao buscar histórico de localizações:", error);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
});

// 🔹 WebSocket
io.on("connection", (socket) => {
  console.log(`🟢 Novo cliente conectado! ID: ${socket.id}`);

  socket.on("update-location", async (data) => {
    console.log(`📡 Localização recebida do usuário ${data.userId}:`, data);

    if (!data.userId || !data.latitude || !data.longitude) {
      console.error("❌ Dados inválidos recebidos!", data);
      return;
    }

    try {
      const userRef = admin.firestore().collection("locations").doc(data.userId);

      // 🔹 Salvando a última localização diretamente no documento principal
      await userRef.set({
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 🔹 Agora adicionamos essa mesma localização ao histórico (subcoleção `history`)
      const historyRef = userRef.collection("history");

      await historyRef.add({
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Localização salva e adicionada ao histórico para usuário: ${data.userId}`);

      // Emitindo atualização para os outros clientes
      io.emit("location-update", data);
    } catch (error) {
      console.error("❌ Erro ao salvar no Firestore:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ID ${socket.id}`);
  });
});

server.listen(4000, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando na porta 4000!");
});
