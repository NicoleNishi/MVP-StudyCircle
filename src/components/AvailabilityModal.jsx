import { useEffect, useRef, useState } from "react";
import { DIAS } from "../constants";
import { FIM_GRADE, INICIO_GRADE, PASSO, hhmm } from "../utils/time";
import OptionButtons from "./OptionButtons";

const OPCOES_HORA = [];
for (let m = INICIO_GRADE; m <= FIM_GRADE; m += PASSO) OPCOES_HORA.push(m);

const ordem = (id) => DIAS.findIndex((d) => d.id === id);

/** Modal para registrar dia(s) da semana + horário. Só altera a grade ao confirmar. */
export default function AvailabilityModal({ slots, onConfirmar, onCancelar }) {
  const ref = useRef(null);
  const [rascunho, setRascunho] = useState(() => slots.map((s) => ({ ...s })));
  const [dias, setDias] = useState([]);
  const [ini, setIni] = useState(14 * 60);
  const [fim, setFim] = useState(16 * 60);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  function adicionar() {
    if (!dias.length) return setErro("Selecione pelo menos um dia da semana.");
    if (fim <= ini) return setErro("O horário final deve ser depois do inicial.");
    const conflito = dias.find((d) => rascunho.some((s) => s.dia === d && ini < s.fim && fim > s.ini));
    if (conflito) {
      const nome = DIAS.find((d) => d.id === conflito).nome;
      return setErro(`Já existe um horário em ${nome} que cruza com esse período.`);
    }
    setRascunho([...rascunho, ...dias.map((dia) => ({ dia, ini, fim }))]);
    setDias([]); // limpa a seleção de dias depois de adicionar
    setErro("");
  }

  const ordenado = [...rascunho].sort((a, b) => ordem(a.dia) - ordem(b.dia) || a.ini - b.ini);

  return (
    <dialog
      ref={ref}
      aria-labelledby="m-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
      onClick={(e) => e.target === e.currentTarget && onCancelar()}
    >
      <h2 id="m-title">Editar disponibilidade</h2>

      <span className="lbl sm">Dias da semana</span>
      <OptionButtons
        className="opts days"
        rotulo="Dias da semana"
        opcoes={DIAS.map((d) => ({ id: d.id, label: d.curto }))}
        selecionado={(id) => dias.includes(id)}
        onAlternar={(id) => setDias((x) => (x.includes(id) ? x.filter((d) => d !== id) : [...x, id]))}
      />

      <div className="times">
        <label>
          Início
          <select value={ini} onChange={(e) => setIni(+e.target.value)}>
            {OPCOES_HORA.slice(0, -1).map((m) => <option key={m} value={m}>{hhmm(m)}</option>)}
          </select>
        </label>
        <label>
          Fim
          <select value={fim} onChange={(e) => setFim(+e.target.value)}>
            {OPCOES_HORA.slice(1).map((m) => <option key={m} value={m}>{hhmm(m)}</option>)}
          </select>
        </label>
        <button type="button" className="btn primary small" onClick={adicionar}>Adicionar</button>
      </div>

      {erro && <p className="err">{erro}</p>}

      <ul className="slot-list">
        {ordenado.length === 0 && <li className="empty">Nenhum horário adicionado.</li>}
        {ordenado.map((s) => (
          <li key={`${s.dia}-${s.ini}`}>
            <span>{DIAS.find((d) => d.id === s.dia).nome}, {hhmm(s.ini)}–{hhmm(s.fim)}</span>
            <button type="button" onClick={() => setRascunho(rascunho.filter((x) => x !== s))}>Remover</button>
          </li>
        ))}
      </ul>

      <div className="actions">
        <button type="button" className="btn ghost" onClick={onCancelar}>Cancelar</button>
        <button type="button" className="btn primary" onClick={() => onConfirmar(rascunho)}>Confirmar</button>
      </div>
    </dialog>
  );
}
