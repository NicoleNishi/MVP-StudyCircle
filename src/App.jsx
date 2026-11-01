import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Perfil from "./pages/Perfil";
import Pessoas from "./pages/Pessoas";
import Mapa from "./pages/Mapa";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/pessoas" element={<Pessoas />} />
      <Route path="/mapa" element={<Mapa />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}