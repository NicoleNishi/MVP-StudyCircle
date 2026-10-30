/** Envia o perfil ao servidor, que grava o arquivo na pasta perfis-de-estudos/. */
export async function salvarPerfil(perfil) {
  const resposta = await fetch("/api/perfis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(perfil),
  });
  if (!resposta.ok) throw new Error("Falha ao salvar o perfil.");
  return resposta.json(); // { arquivo: "perfis-de-estudos/maria-da-silva.json" }
}
