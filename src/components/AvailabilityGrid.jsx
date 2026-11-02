import { DIAS } from "../constants";
import { ALTURA_HORA, INICIO_GRADE, curto } from "../utils/time";

const HORAS = Array.from({ length: 14 }, (_, i) => 8 + i); // 08h … 21h

const COR_LINHA = "#d9ddd8";
const FOCO = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta";

// Valores que dependem das constantes da grade ficam em estilo inline para nunca saírem de sincronia.
const alturaGrade = HORAS.length * ALTURA_HORA;
const linhasHorizontais = `repeating-linear-gradient(to bottom, transparent 0 ${ALTURA_HORA - 1}px, ${COR_LINHA} ${ALTURA_HORA - 1}px ${ALTURA_HORA}px)`;

export default function AvailabilityGrid({ slots, onAbrir }) {
  return (
    <div
      className={`grid cursor-pointer grid-cols-[34px_repeat(7,1fr)] overflow-hidden rounded border border-[#d9ddd8] text-[11px] ${FOCO}`}
      role="button"
      tabIndex={0}
      aria-label="Editar disponibilidade semanal"
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAbrir();
        }
      }}
    >
      <div className="border-b border-[#d9ddd8] py-1.5" />
      {DIAS.map((d) => (
        <div className="border-b border-[#d9ddd8] py-1.5 text-center text-[#555]" key={d.id}>
          {d.curto}
        </div>
      ))}

      <div className="grid" style={{ gridTemplateRows: `repeat(${HORAS.length}, ${ALTURA_HORA}px)` }}>
        {HORAS.map((h) => (
          <span key={h} className="-translate-y-[7px] pr-1 text-right text-[#555]">
            {String(h).padStart(2, "0")}h
          </span>
        ))}
      </div>

      {DIAS.map((d) => {
        const doDia = slots.filter((s) => s.dia === d.id);
        return (
          <div
            key={d.id}
            className={`relative border-l border-[#d9ddd8] ${doDia.length ? "bg-[#eaf4ee]" : ""}`}
            style={{ height: alturaGrade, backgroundImage: linhasHorizontais }}
          >
            {doDia.map((s) => (
              <div
                key={`${s.ini}-${s.fim}`}
                className="absolute inset-x-[3px] flex flex-col justify-center overflow-hidden rounded bg-floresta px-1 py-[3px] text-center text-[10px] leading-tight text-white"
                style={{
                  top: ((s.ini - INICIO_GRADE) / 60) * ALTURA_HORA,
                  height: ((s.fim - s.ini) / 60) * ALTURA_HORA - 2,
                }}
              >
                {s.fim - s.ini >= 60 && <b>{d.nome}</b>}
                <span>{curto(s.ini)}–{curto(s.fim)}</span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
