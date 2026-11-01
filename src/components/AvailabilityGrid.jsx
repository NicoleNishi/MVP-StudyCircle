import { DIAS } from "../constants";
import { ALTURA_HORA, INICIO_GRADE, curto } from "../utils/time";

const HORAS = Array.from({ length: 14 }, (_, i) => 8 + i);

export default function AvailabilityGrid({ slots, onAbrir }) {
  return (
    <div
      className="week"
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
      <div className="hd" />
      {DIAS.map((d) => (
        <div className="hd" key={d.id}>{d.curto}</div>
      ))}

      <div className="hrs">
        {HORAS.map((h) => (
          <span key={h}>{String(h).padStart(2, "0")}h</span>
        ))}
      </div>

      {DIAS.map((d) => {
        const doDia = slots.filter((s) => s.dia === d.id);
        return (
          <div className={"col" + (doDia.length ? " on" : "")} key={d.id}>
            {doDia.map((s) => (
              <div
                className="blk"
                key={`${s.ini}-${s.fim}`}
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