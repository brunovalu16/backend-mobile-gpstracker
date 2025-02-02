import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import dotenv from "dotenv"; // Importando dotenv
import fs from "fs";

dotenv.config(); // Carrega as variáveis de ambiente

// 🔹 Verifica se todas as variáveis de ambiente essenciais estão definidas
const requiredEnvVars = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID",
  "FIREBASE_MEASUREMENT_ID"
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`❌ ERRO: A variável de ambiente ${varName} não está definida!`);
    process.exit(1);
  }
});

// 🔹 Configuração do Firebase Client SDK (Frontend)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// 🔹 Inicializa Firebase Client SDK
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// 🔹 Inicializa Firebase Admin SDK (Backend)
const serviceAccountPath = "./serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ ERRO: Arquivo serviceAccountKey.json não encontrado!");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK inicializado com sucesso!");
}

// 🔹 Configuração do Firestore do Admin SDK
const adminDb = admin.firestore();

export { firebaseConfig, firebaseApp, db, admin, adminDb };
