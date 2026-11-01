export const INICIO_GRADE = 8 * 60;
export const FIM_GRADE = 22 * 60;
export const ALTURA_HORA = 32;
export const PASSO = 30;

export const hhmm = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

export const curto = (m) =>
  `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;