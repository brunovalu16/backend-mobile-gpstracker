import express from "express";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { admin, adminDb } from "../firebaseConfig.js"; // 🔹 Importando Firestore do Admin SDK

const router = express.Router();
const auth = getAuth();

router.post("/register", async (req, res) => {
  console.log("Recebendo dados no backend:", req.body);

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios: name, email, password" });
    }

    // 🔹 Verifica se o e-mail já está cadastrado
    try {
      const existingUser = await admin.auth().getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "O e-mail já está cadastrado." });
      }
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        return res.status(400).json({ error: error.message });
      }
    }

    // 🔹 Criando o usuário no Firebase Authentication via Admin SDK
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    console.log("Usuário criado com sucesso:", userRecord.uid);

    // 🔹 Testando se o Firestore está acessível antes de salvar os dados
    try {
      await adminDb.collection("vendedores").doc(userRecord.uid).set({
        name: name || "Nome não informado",
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("Usuário salvo no Firestore!");
    } catch (error) {
      console.error("❌ Erro ao salvar no Firestore:", error);
      return res.status(500).json({ error: "Erro ao salvar no Firestore: " + error.message });
    }

    res.status(201).json({ uid: userRecord.uid, email, name });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    res.status(200).json({ uid: user.uid, email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
