import { DISCIPLINAS } from "../data/disciplinas";

const limpar = (s) =>
  [...s].map((c) => c.normalize("NFD")[0]).join("").toLowerCase().replace(/[^a-z0-9]/g, " ");

const ROMANO = { i: "1", ii: "2", iii: "3", iv: "4", v: "5", vi: "6" };
const ARABICO = Object.fromEntries(Object.entries(ROMANO).map(([r, n]) => [n, r]));
const equivalente = (t) => ROMANO[t] || ARABICO[t]; // "ii" <-> "2"

const INDICE = DISCIPLINAS.map((nome) => {
  const lit = limpar(nome);
  return { nome, lit, num: lit.replace(/\b(vi|iv|iii|ii|v|i)\b/g, (m) => ROMANO[m]) };
});

const tokens = (q) => limpar(q).split(/\s+/).filter(Boolean);

function segmentos(d, toks) {
  const marcado = new Array(d.nome.length).fill(false);
  toks.forEach((t) =>
    [t, equivalente(t)].filter(Boolean).some((v) => {
      let i = (" " + d.lit).indexOf(" " + v);
      i = i >= 0 ? i : d.lit.indexOf(v);
      if (i < 0) return false;
      for (let k = i; k < i + v.length; k++) marcado[k] = true;
      return true;
    })
  );
  const trechos = [];
  [...d.nome].forEach((ch, k) => {
    const ultimo = trechos[trechos.length - 1];
    if (ultimo && ultimo.negrito === marcado[k]) ultimo.texto += ch;
    else trechos.push({ texto: ch, negrito: marcado[k] });
  });
  return trechos;
}

export function buscar(consulta, jaEscolhidas = []) {
  const toks = tokens(consulta);
  return INDICE.filter(
    (d) =>
      !jaEscolhidas.includes(d.nome) &&
      toks.every((t) => d.lit.includes(t) || d.num.includes(ROMANO[t] || t))
  )
    .map((d) => ({
      d,
      r: !toks.length || d.lit.startsWith(toks[0]) ? 0 : (" " + d.lit).includes(" " + toks[0]) ? 1 : 2,
    }))
    .sort((x, y) => x.r - y.r || x.d.nome.localeCompare(y.d.nome, "pt-BR", { numeric: true }))
    .map(({ d }) => ({ nome: d.nome, trechos: segmentos(d, toks) }));
}