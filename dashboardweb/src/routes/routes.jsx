import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Roteirizacao from "../pages/Roteirizacao";
import Alertas from "../pages/Alertas";
import Relatorios from "../pages/Relatorios";
import VendedorDetalhes from "../pages/VendedorDetalhes";
import Paradas from "../pages/Paradas";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roteirizacao" element={<Roteirizacao />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/vendedor/:id" element={<VendedorDetalhes />} />
        <Route path="/paradas" element={<Paradas />} />
        <Route path="/roteirizacao" element={<Roteirizacao  />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
