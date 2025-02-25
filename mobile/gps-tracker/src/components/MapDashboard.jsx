import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Polyline, Marker } from "@react-google-maps/api";
import { db } from "../firebase-config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { GOOGLE_MAPS_API_KEY } from "../config"; // 🔹 Agora estamos importando a API Key!

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: -15.7801, // Localização inicial (ajuste conforme necessário)
  lng: -47.9292,
};

const MapDashboard = () => {
  const [historicoRota, setHistoricoRota] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [selectedVendedor, setSelectedVendedor] = useState("");

  // Buscar todos os vendedores
  useEffect(() => {
    const unsubscribeVendedores = onSnapshot(collection(db, "vendedores"), (snapshot) => {
      setVendedores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribeVendedores();
  }, []);

  // Buscar histórico de rotas do vendedor selecionado
  useEffect(() => {
    if (!selectedVendedor) return;

    const q = query(collection(db, "vendedores", selectedVendedor, "historico"), orderBy("timestamp"));
    const unsubscribeHistorico = onSnapshot(q, (snapshot) => {
      setHistoricoRota(snapshot.docs.map(doc => ({
        lat: doc.data().latitude,
        lng: doc.data().longitude,
      })));
    });

    return () => unsubscribeHistorico();
  }, [selectedVendedor]);

  return (
    <div>
      {/* Dropdown para selecionar vendedor */}
      <select onChange={(e) => setSelectedVendedor(e.target.value)} value={selectedVendedor}>
        <option value="">Selecione um vendedor</option>
        {vendedores.map((vendedor) => (
          <option key={vendedor.id} value={vendedor.id}>{vendedor.id}</option>
        ))}
      </select>

      {/* Mapa do Google */}
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={center}>
          {/* Exibir os vendedores como marcadores */}
          {vendedores.map((vendedor) => (
            <Marker 
              key={vendedor.id} 
              position={{ lat: vendedor.latitude, lng: vendedor.longitude }} 
              title={vendedor.id} 
            />
          ))}

          {/* Exibir rota percorrida */}
          {historicoRota.length > 0 && (
            <Polyline 
              path={historicoRota} 
              options={{ strokeColor: "#FF0000", strokeOpacity: 1, strokeWeight: 3 }} 
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapDashboard;
