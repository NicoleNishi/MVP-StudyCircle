const SEM_SERVIDOR = [404, 405, 501];

const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

function baixarPerfil(perfil) {
  const id = slug(perfil.nome) || "perfil";
  const arquivo = new Blob([JSON.stringify({ ...perfil, id }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${id}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return { baixado: true, arquivo: `${id}.json` };
}

/* Envia o perfil ao servidor, que grava o arquivo na pasta perfis-de-estudos/.
 * No site publicado não há servidor: o perfil é baixado no navegador.
 * Retorna { arquivo } quando gravou no servidor ou { baixado: true, arquivo } quando baixou.*/
export async function salvarPerfil(perfil) {
  let resposta;
  try {
    resposta = await fetch("/api/perfis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(perfil),
    });
  } catch {
    return baixarPerfil(perfil);
  }
  if (SEM_SERVIDOR.includes(resposta.status)) return baixarPerfil(perfil);
  if (!resposta.ok) throw new Error("Falha ao salvar o perfil.");
  return resposta.json(); // { arquivo: "perfis-de-estudos/maria-da-silva.json" }
}