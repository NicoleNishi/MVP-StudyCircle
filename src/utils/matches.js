const CORES = ["floresta", "musgo", "lima", "lima-suave", "menta"];

const iconeDoGenero = (genero = "") => (String(genero).startsWith("mulher") ? "feminino" : "masculino");

export function prepararMatches(matches) {
  return matches.map((m, i) => ({
    ...m,
    materiasEmComum: m.materiasEmComum ?? [],
    horariosEmComum: m.horariosEmComum ?? [],
    genero: iconeDoGenero(m.genero),
    corAvatar: m.corAvatar ?? CORES[i % CORES.length],
  }));
}