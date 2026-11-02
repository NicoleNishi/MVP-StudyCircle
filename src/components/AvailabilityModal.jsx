import { useEffect, useRef, useState } from "react";
import { DIAS } from "../constants";
import { FIM_GRADE, INICIO_GRADE, PASSO, hhmm } from "../utils/time";
import OptionButtons from "./OptionButtons";

const OPCOES_HORA = [];
for (let m = INICIO_GRADE; m <= FIM_GRADE; m += PASSO) OPCOES_HORA.push(m);

const ordem = (id) => DIAS.findIndex((d) => d.id === id);

const FOCO = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta";
const BOTAO = `cursor-pointer rounded-full border-0 text-[13px] font-bold ${FOCO}`;
const SELECT = `rounded-md border border-[#cfd5d0] bg-white p-2 text-[13px] font-normal text-[#1d2b24] ${FOCO}`;

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
    setDias([]);
    setErro("");
  }

  const ordenado = [...rascunho].sort((a, b) => ordem(a.dia) - ordem(b.dia) || a.ini - b.ini);

  return (
    <dialog
      ref={ref}
      aria-labelledby="m-title"
      className="m-auto w-[min(440px,92vw)] rounded-[14px] border-0 bg-white p-6 text-[#1d2b24] shadow-[0_10px_40px_#0004] backdrop:bg-[#0007]"
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
      onClick={(e) => e.target === e.currentTarget && onCancelar()}
    >
      <h2 id="m-title" className="mb-3 text-lg font-bold">
        Editar disponibilidade
      </h2>

      <span className="mb-1.5 mt-3 block text-xs font-medium text-[#33453c]">Dias da semana</span>
      <OptionButtons
        layout="dias"
        rotulo="Dias da semana"
        opcoes={DIAS.map((d) => ({ id: d.id, label: d.curto }))}
        selecionado={(id) => dias.includes(id)}
        onAlternar={(id) => setDias((x) => (x.includes(id) ? x.filter((d) => d !== id) : [...x, id]))}
      />

      <div className="mt-3.5 flex flex-wrap items-end gap-2.5">
        <label className="grid gap-1 text-xs font-semibold">
          Início
          <select className={SELECT} value={ini} onChange={(e) => setIni(+e.target.value)}>
            {OPCOES_HORA.slice(0, -1).map((m) => <option key={m} value={m}>{hhmm(m)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Fim
          <select className={SELECT} value={fim} onChange={(e) => setFim(+e.target.value)}>
            {OPCOES_HORA.slice(1).map((m) => <option key={m} value={m}>{hhmm(m)}</option>)}
          </select>
        </label>
        <button type="button" className={`${BOTAO} bg-floresta px-[18px] py-[9px] text-white hover:bg-[#143527]`} onClick={adicionar}>
          Adicionar
        </button>
      </div>

      {erro && <p className="mt-1.5 text-xs text-[#b3361f]">{erro}</p>}

      <ul className="my-3.5 grid max-h-[180px] list-none gap-1.5 overflow-auto p-0">
        {ordenado.length === 0 && <li className="px-2.5 py-1.5 text-xs text-[#6c8478]">Nenhum horário adicionado.</li>}
        {ordenado.map((s) => (
          <li key={`${s.dia}-${s.ini}`} className="flex items-center justify-between rounded-md bg-[#eaf4ee] px-2.5 py-1.5 text-xs">
            <span>{DIAS.find((d) => d.id === s.dia).nome}, {hhmm(s.ini)}–{hhmm(s.fim)}</span>
            <button
              type="button"
              className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-[#b3361f]"
              onClick={() => setRascunho(rascunho.filter((x) => x !== s))}
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <div className="flex justify-end gap-2">
        <button type="button" className={`${BOTAO} bg-transparent px-[22px] py-2.5 text-floresta`} onClick={onCancelar}>
          Cancelar
        </button>
        <button type="button" className={`${BOTAO} bg-floresta px-[22px] py-2.5 text-white hover:bg-[#143527]`} onClick={() => onConfirmar(rascunho)}>
          Confirmar
        </button>
      </div>
    </dialog>
  );
}
