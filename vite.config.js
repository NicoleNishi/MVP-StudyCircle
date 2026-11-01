import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { middlewarePerfis } from "./server/perfis.js";

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

export default defineConfig({ plugins: [react(), tailwindcss(), salvarPerfis()] });