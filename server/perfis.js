import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/* Pasta (na raiz do projeto) onde cada perfil enviado é salvo como um arquivo .json */
export const PASTA_PERFIS = "perfis-de-estudos";

// "Maria da Silva" -> "maria-da-silva"
export const slug = (s) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

/* Recebe o perfil. Reenviar o formulário com o mesmo nome atualiza o arquivo daquela pessoa. */
export function middlewarePerfis(raiz) {
  const pasta = path.join(raiz, PASTA_PERFIS);
  return (req, res, next) => {
    if (req.method !== "POST") return next();
    let corpo = "";
    req.on("data", (parte) => {
      corpo += parte;
      if (corpo.length > 200_000) req.destroy();
    });
    req.on("end", async () => {
      const responder = (status, obj) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(obj));
      };
      try {
        const perfil = JSON.parse(corpo);
        const id = slug(String(perfil.nome ?? ""));
        if (!id) return responder(400, { erro: "Nome inválido." });
        await mkdir(pasta, { recursive: true });
        await writeFile(path.join(pasta, `${id}.json`), JSON.stringify({ ...perfil, id }, null, 2), "utf8");
        responder(200, { arquivo: `${PASTA_PERFIS}/${id}.json` });
      } catch {
        responder(400, { erro: "Dados inválidos." });
      }
    });
  };
}