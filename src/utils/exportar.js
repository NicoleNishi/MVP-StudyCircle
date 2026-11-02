import { DIAS } from "../constants";
import { hhmm } from "./time";

/**
 * Monta o objeto que será salvo em JSON e lido pelo algoritmo de matching.
 *
 * {
 *   versao: 2,
 *   enviadoEm: "2026-10-30T20:18:41.000Z",
 *   nome: "Maria da Silva",                           // identifica o aluno
 *   id: "maria-da-silva",                             // adicionado pelo servidor ao salvar (nome do arquivo)
 *   genero: "mulher_cis" | "homem_cis" | "mulher_trans" | "homem_trans",
 *   cursos: ["..."],                                  // cursos escolhidos na lista
 *   semestre: 5,                                      // semestre do aluno, de 1 a 10
 *   disciplinas: ["Cálculo II", ...],                 // nomes oficiais da lista
 *   disponibilidade: [{ dia: "ter", inicio: "14:00", fim: "16:00" }, ...],
 *   focos: ["resolver_lista", ...],
 *   preferencias: {
 *     grupo: "misto" | "somente_mulheres_cis" | "somente_homens_cis" | "somente_mulheres_trans" | "somente_homens_trans",
 *     aceitaOutroSemestre: true | false,
 *     aceitaOutroCurso: true | false                  // false = só quem compartilha pelo menos um curso
 *   }
 * }
 */
export function montarPerfil({ nome, genero, cursos, semestre, disciplinas, slots, focos, grupo, preferenciaSemestre, preferenciaCurso }) {
  const ordem = (id) => DIAS.findIndex((d) => d.id === id);
  return {
    versao: 2,
    enviadoEm: new Date().toISOString(),
    nome: nome.trim().replace(/\s+/g, " "),
    genero,
    cursos: [...cursos],
    semestre,
    disciplinas: [...disciplinas],
    disponibilidade: [...slots]
      .sort((a, b) => ordem(a.dia) - ordem(b.dia) || a.ini - b.ini)
      .map((s) => ({ dia: s.dia, inicio: hhmm(s.ini), fim: hhmm(s.fim) })),
    focos: [...focos],
    preferencias: {
      grupo,
      aceitaOutroSemestre: preferenciaSemestre === "outros",
      aceitaOutroCurso: preferenciaCurso === "outros",
    },
  };
}