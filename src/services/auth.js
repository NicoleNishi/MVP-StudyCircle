/* Ponto único de integração com a autenticação. Aguardando o Backend */

const LATENCIA_SIMULADA = 400;
const aguardar = () => new Promise((resolve) => setTimeout(resolve, LATENCIA_SIMULADA));

export const PROVEDORES = [
  { id: "google", nome: "Google" },
  { id: "apple", nome: "Apple" },
  { id: "linkedin", nome: "LinkedIn" },
];

export async function entrar({ email, senha, lembrar }) {
  await aguardar();
  return { email, lembrar, senhaInformada: Boolean(senha) };
}

export async function entrarComProvedor(provedor) {
  await aguardar();
  return { provedor };
}

export async function cadastrar({ nome, email, senha, faculdade }) {
  await aguardar();
  return { nome, email, faculdade, senhaInformada: Boolean(senha) };
}

export async function sair() {
  await aguardar();
}
