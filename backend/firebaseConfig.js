import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

const firebaseConfig = {
  apiKey: "AIzaSyAJMzjpaceImv6Iu63oSKPa4ddlNu-DWAo",
  authDomain: "gps-tracker-9f672.firebaseapp.com",
  projectId: "gps-tracker-9f672",
  storageBucket: "gps-tracker-9f672.firebasestorage.app",
  messagingSenderId: "1040387708454",
  appId: "1:1040387708454:web:9024b595db6e036c1df8e7",
  measurementId: "G-R3RTX6DYC2"
};

// 🔹 Inicializa Firebase Client SDK (Frontend)
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// 🔹 Inicializa Firebase Admin SDK (Backend)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 🔹 Corrigindo: Exportando Firestore do Admin SDK
const adminDb = admin.firestore();

export { firebaseConfig, firebaseApp, db, admin, adminDb };
