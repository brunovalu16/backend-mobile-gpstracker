import { useEffect, useState, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import { db } from "../services/firebase"; 
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { Box, Typography, Select, MenuItem, FormControlLabel, Checkbox } from "@mui/material";
import { GOOGLE_MAPS_API_KEY } from "../services/config"; 
//Função para Buscar o Histórico de Rota
import { query, orderBy } from "firebase/firestore";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const center = { lat: -15.7801, lng: -47.9292 }; // Brasília como localização inicial

const Roteirizacao = () => {
  const [vendedores, setVendedores] = useState([]);
  const [selectedVendedor, setSelectedVendedor] = useState("");
   const [trajetoPlanejado, setTrajetoPlanejado] = useState(true);
  const [trajetoExecutado, setTrajetoExecutado] = useState(true);
  const [historicoRota, setHistoricoRota] = useState([]);



  // 🔽 Função para buscar vendedores e suas localizações
  const fetchVendedoresComLocalizacao = useCallback(async () => {
    try {
      const vendedoresSnapshot = await getDocs(collection(db, "vendedores"));
      const vendedoresArray = [];

      for (const docSnap of vendedoresSnapshot.docs) {
        const vendedor = { id: docSnap.id, ...docSnap.data() };

        // 🔹 Busca a localização na coleção "locations"
        const locationRef = doc(db, "locations", vendedor.id);
        const locationSnapshot = await getDoc(locationRef);

        if (locationSnapshot.exists()) {
          const locationData = locationSnapshot.data();
          vendedor.latitude = locationData.latitude ? Number(locationData.latitude) : null;
          vendedor.longitude = locationData.longitude ? Number(locationData.longitude) : null;

          if (isNaN(vendedor.latitude) || isNaN(vendedor.longitude)) {
            console.warn(`⚠️ Coordenadas inválidas para o vendedor ${vendedor.id}:`, locationData);
          }
        } else {
          console.warn(`⚠️ Vendedor ${vendedor.id} não tem localização.`);
          vendedor.latitude = null;
          vendedor.longitude = null;
        }

        vendedoresArray.push(vendedor);
      }

      console.log("📌 Vendedores com localização:", vendedoresArray);
      setVendedores(vendedoresArray.filter(v => v.latitude !== null && v.longitude !== null)); // Filtra vendedores sem localização
    } catch (error) {
      console.error("❌ Erro ao buscar vendedores:", error);
    }
  }, []);

  useEffect(() => {
    fetchVendedoresComLocalizacao();
  }, [fetchVendedoresComLocalizacao]);




// Função para Buscar o Histórico de Rota (com ordenação por timestamp)
const fetchHistoricoRota = useCallback(async () => {
  if (!selectedVendedor) return;

  try {
    const q = query(
      collection(db, "locations", selectedVendedor, "history"),
      orderBy("timestamp", "asc") // 🔹 Ordena os pontos do trajeto do mais antigo para o mais recente
    );

    const historicoSnapshot = await getDocs(q);

    const rota = historicoSnapshot.docs.map(doc => ({
      lat: doc.data().latitude,
      lng: doc.data().longitude,
    }));

    console.log("📌 Histórico de Rota (Ordenado):", rota);
    setHistoricoRota(rota);
  } catch (error) {
    console.error("❌ Erro ao buscar histórico de rota:", error);
  }
}, [selectedVendedor]);


  useEffect(() => {
    fetchHistoricoRota();
  }, [fetchHistoricoRota]);
  
  

  return (
    <Box sx={{ marginLeft: "30px", minWidth: "200%" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
        Roteirização de Vendedores
      </Typography>

      {/* Dropdown para selecionar vendedor */}
      <Select
        value={selectedVendedor}
        onChange={(e) => setSelectedVendedor(e.target.value)}
        displayEmpty
        fullWidth
        sx={{ width: "300px", marginBottom: "15px" }}
      >
        <MenuItem value="">Selecione um vendedor</MenuItem>
        {vendedores.map((vendedor) => (
          <MenuItem key={vendedor.id} value={vendedor.id}>
            {vendedor.id}
          </MenuItem>
        ))}
      </Select>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: "15px" }}>
      <FormControlLabel
        control={<Checkbox checked={trajetoPlanejado} onChange={(e) => setTrajetoPlanejado(e.target.checked)} />}
        label="Trajeto Planejado"
      />
      <FormControlLabel
        control={<Checkbox checked={trajetoExecutado} onChange={(e) => setTrajetoExecutado(e.target.checked)} />}
        label="Trajeto Executado"
      />
    </Box>


      {/* Mapa do Google */}
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={center}>
  {/* Exibir apenas o vendedor selecionado ou todos se nenhum for escolhido */}
  {selectedVendedor
    ? vendedores
        .filter((vendedor) => vendedor.id === selectedVendedor)
        .map((vendedor) => (
          <Marker
            key={vendedor.id}
            position={{ lat: vendedor.latitude, lng: vendedor.longitude }}
            title={`Vendedor: ${vendedor.id}`}
            icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          />
        ))
    : vendedores.map((vendedor) => (
        <Marker
          key={vendedor.id}
          position={{ lat: vendedor.latitude, lng: vendedor.longitude }}
          title={`Vendedor: ${vendedor.id}`}
          icon="https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        />
      ))}

  {/* Exibir trajeto planejado e executado */}
  {trajetoPlanejado && historicoRota.length > 0 && (
    <Polyline
      path={historicoRota}
      options={{ strokeColor: "#0000FF", strokeOpacity: 1, strokeWeight: 3 }}
    />
  )}

  {trajetoExecutado && historicoRota.length > 0 && (
    <Polyline
      path={historicoRota}
      options={{ strokeColor: "#FF0000", strokeOpacity: 1, strokeWeight: 3 }}
    />
  )}
</GoogleMap>

      </LoadScript>
    </Box>
  );
};

export default Roteirizacao;
