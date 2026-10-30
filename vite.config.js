import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { middlewarePerfis } from "./server/perfis.js";

// Habilita POST /api/perfis no servidor do Vite (npm run dev e npm run preview).
// Atenção: as funções abaixo NÃO podem devolver nada. Se devolverem uma função, o Vite a trata
// como "hook pós-middlewares" e a executa, o que causava o erro "reading 'url'".
function salvarPerfis() {
  const registrar = (server) => {
    server.middlewares.use("/api/perfis", middlewarePerfis(server.config.root));
  };
  return {
    name: "salvar-perfis",
    configureServer(server) {
      registrar(server);
    },
    configurePreviewServer(server) {
      registrar(server);
    },
  };
}

export default defineConfig({ plugins: [react(), salvarPerfis()] });
