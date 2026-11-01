const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SENHA_MINIMA = 8;

export const emailValido = (email) => EMAIL.test(email.trim());

export function validarLogin({ email, senha }) {
  const erros = {};
  if (!email.trim()) erros.email = "Informe seu e-mail.";
  else if (!emailValido(email)) erros.email = "Digite um e-mail válido.";
  if (!senha) erros.senha = "Informe sua senha.";
  return erros;
}

export function validarCadastro({ nome, email, senha, faculdade }) {
  const erros = {};
  if (nome.trim().length < 2) erros.nome = "Informe seu nome.";
  if (!email.trim()) erros.email = "Informe seu e-mail.";
  else if (!emailValido(email)) erros.email = "Digite um e-mail válido.";
  if (senha.length < SENHA_MINIMA) erros.senha = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (!faculdade.trim()) erros.faculdade = "Informe sua faculdade.";
  return erros;
}