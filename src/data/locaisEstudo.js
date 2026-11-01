// Locais de estudo da EACH exibidos nas sugestões. Verificar se utilizaremos isso, pela complexidade.

export const FILTROS_LOCAIS = [
  { id: "wifiExcelente", label: "Wi-Fi Excelente", teste: (l) => l.wifi.qualidade === "excelente" },
  { id: "baixoRuido", label: "Baixo Ruído", teste: (l) => l.ruido.db <= 40 },
  { id: "salasLivres", label: "Salas Livres", teste: (l) => l.salaLivre === true },
];

export const LOCAIS_ESTUDO = [
  {
    id: "biblioteca-central",
    nome: "Biblioteca Central",
    ruido: { db: 30, rotulo: "Silencioso" },
    wifi: { qualidade: "excelente", detalhe: "Excelente (45 Mbps)" },
    qualidade: 1,
    coordenadas: null,
  },
  {
    id: "salinha-pet",
    nome: "Salinha do PET",
    ruido: { db: 65, rotulo: "Moderado" },
    wifi: { qualidade: "instavel", detalhe: "Instável / Sombra de Cobertura" },
    qualidade: 0.4,
    coordenadas: null,
  },
  {
    id: "sala-de-aula-titanic",
    nome: "Sala de Aula Titanic",
    ruido: { db: 30, rotulo: "Silencioso" },
    wifi: { qualidade: "excelente", detalhe: "Excelente (50 Mbps)" },
    qualidade: 1,
    coordenadas: null,
  },
  {
    id: "salinha-sintese",
    nome: "Salinha da Síntese",
    ruido: { db: 65, rotulo: "Moderado" },
    wifi: { qualidade: "instavel", detalhe: "Instável / Sombra de Cobertura" },
    qualidade: 0.4,
    coordenadas: null,
  },
];