import express from "express";
import admin from "firebase-admin";

const router = express.Router();

router.post("/update-location", async (req, res) => {
    const { uid, latitude, longitude } = req.body;
  
    try {
      await admin.firestore().collection("locations").doc(uid).set({
        latitude,
        longitude,
        timestamp: new Date()
      }, { merge: true });
  
      io.emit("location-update", { uid, latitude, longitude });
  
      res.status(200).json({ message: "Localização atualizada!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

export default router;
