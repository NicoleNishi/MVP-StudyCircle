export const DIAS = [
  { id: "seg", nome: "Segunda", curto: "Seg" },
  { id: "ter", nome: "Terça", curto: "Ter" },
  { id: "qua", nome: "Quarta", curto: "Qua" },
  { id: "qui", nome: "Quinta", curto: "Qui" },
  { id: "sex", nome: "Sexta", curto: "Sex" },
  { id: "sab", nome: "Sábado", curto: "Sáb" },
  { id: "dom", nome: "Domingo", curto: "Dom" },
];

export const FOCOS = [
  { id: "ensinar", label: "Ensinar" },
  { id: "aprender_escutando", label: "Aprender escutando" },
  { id: "tirar_duvidas", label: "Tirar dúvidas" },
  { id: "resolver_lista", label: "Resolver lista" },
  { id: "fazer_revisao", label: "Fazer revisão" },
];

export const GENEROS = [
  { id: "mulher_cis", label: "Mulher cisgênero" },
  { id: "homem_cis", label: "Homem cisgênero" },
  { id: "mulher_trans", label: "Mulher trans" },
  { id: "homem_trans", label: "Homem trans" },
];

export const GRUPOS = [
  { id: "misto", label: "Misto" },
  { id: "somente_mulheres_cis", label: "Só mulheres cisgênero" },
  { id: "somente_homens_cis", label: "Só homens cisgênero" },
  { id: "somente_mulheres_trans", label: "Só mulheres trans" },
  { id: "somente_homens_trans", label: "Só homens trans" },
];

export const SEMESTRES = [
  { id: "outros", label: "Aceito outros semestres" },
  { id: "mesmo", label: "Só do meu semestre" },
];

export const SEMESTRES_ALUNO = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, label: `${i + 1}º` }));