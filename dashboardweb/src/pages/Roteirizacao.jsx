import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Polyline, Marker } from "@react-google-maps/api";
import { db } from "../services/firebase"; 
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { GOOGLE_MAPS_API_KEY } from "../services/config"; 
import { Box } from "@mui/material";



const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: -15.7801, // Localização inicial (pode ser ajustada conforme sua necessidade)
  lng: -47.9292,
};

const Roteirizacao = () => {
  const [historicoRota, setHistoricoRota] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [selectedVendedor, setSelectedVendedor] = useState("");

  useEffect(() => {
    const unsubscribeVendedores = onSnapshot(
      collection(db, "vendedores"),
      (snapshot) => {
        setVendedores(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );

    return () => unsubscribeVendedores();
  }, []);

  useEffect(() => {
    if (!selectedVendedor) return;

    const q = query(
      collection(db, "vendedores", selectedVendedor, "historico"),
      orderBy("timestamp")
    );
    const unsubscribeHistorico = onSnapshot(q, (snapshot) => {
      setHistoricoRota(
        snapshot.docs.map((doc) => ({
          lat: doc.data().latitude,
          lng: doc.data().longitude,
        }))
      );
    });

    return () => unsubscribeHistorico();
  }, [selectedVendedor]);

  return (
    <>
      <Box sx={{ marginLeft: "30px", minWidth: "200%" }}>
        <h2>Roteirização de Vendedores</h2>

        {/* Dropdown para selecionar vendedor */}
        <select
          onChange={(e) => setSelectedVendedor(e.target.value)}
          value={selectedVendedor}
        >
          <option value="">Selecione um vendedor</option>
          {vendedores.map((vendedor) => (
            <option key={vendedor.id} value={vendedor.id}>
              {vendedor.id}
            </option>
          ))}
        </select>

        {/* Mapa do Google */}
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={center}
          >
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
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 1,
                  strokeWeight: 3,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </Box>
    </>
  );
};

export default Roteirizacao;
