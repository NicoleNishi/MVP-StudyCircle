/* Guarda no navegador quem é o aluno enquanto não há login. */
const CHAVE = "studycircle:aluno";

export function guardarAlunoAtual({ id, nome }) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify({ id, nome }));
  } catch {
    /* localStorage bloqueado */
  }
}

export function obterAlunoAtual() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE) ?? "null");
    return salvo?.id ? salvo : null;
  } catch {
    return null;
  }
}

export function esquecerAlunoAtual() {
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* localStorage bloqueado */
  }
}