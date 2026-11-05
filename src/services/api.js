// Com `npm run dev` as rotas /api não existem e o Vite devolve HTML.
const SEM_SERVIDOR = "O servidor não respondeu. Para testar no computador, rode `vercel dev` em vez de `npm run dev`.";

async function lerJson(resposta) {
  const tipo = resposta.headers.get("content-type") ?? "";
  if (!tipo.includes("application/json")) throw new Error(SEM_SERVIDOR);
  return resposta.json();
}

export async function salvarPerfil(perfil) {
  const resposta = await fetch("/api/salvar-aluno", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(perfil),
  });
  const corpo = await lerJson(resposta);
  if (!resposta.ok || !corpo.success) throw new Error(corpo.error || "Erro ao salvar no banco de dados.");
  return corpo.id;
}

export async function buscarMatches(alunoId) {
  const resposta = await fetch(`/api/matches?id=${encodeURIComponent(alunoId)}`);
  const corpo = await lerJson(resposta);
  if (resposta.status === 404) {
    const erro = new Error(corpo.erro);
    erro.naoEncontrado = true;
    throw erro;
  }
  if (!resposta.ok) throw new Error(corpo.erro || "Não foi possível carregar os matches.");
  return corpo.matches ?? [];
}