import { useEffect, useId, useMemo, useRef, useState } from "react";
import { buscar } from "../utils/busca";

const Lupa = ({ tamanho = 14, className = "" }) => (
  <svg
    className={className}
    width={tamanho}
    height={tamanho}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export default function DisciplinaSelect({ value, onChange, erro }) {
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const [aviso, setAviso] = useState("");
  const inputRef = useRef(null);
  const listaId = useId();

  const opcoes = useMemo(() => buscar(texto, value), [texto, value]);

  useEffect(() => {
    if (ativo >= 0) document.getElementById(`${listaId}-${ativo}`)?.scrollIntoView({ block: "nearest" });
  }, [ativo, listaId]);

  function escolher(nome) {
    onChange([...value, nome]);
    setTexto("");
    setAberto(false);
    setAviso("");
  }

  function aoDigitar(e) {
    const v = e.target.value;
    setTexto(v);
    setAberto(true);
    setAviso("");
    setAtivo(v.trim() && buscar(v, value).length ? 0 : -1);
  }

  function aoTeclar(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!aberto) return setAberto(true);
      if (opcoes.length) setAtivo((ativo + (e.key === "ArrowDown" ? 1 : -1) + opcoes.length) % opcoes.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (aberto && ativo >= 0) escolher(opcoes[ativo].nome);
      else if (texto.trim()) setAviso("Escolha uma disciplina da lista de sugestões.");
    } else if (e.key === "Escape") {
      setAberto(false);
    } else if (e.key === "Backspace" && !texto && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  const mensagem = aviso || erro;

  return (
    <>
      <label className="mb-1.5 block text-xs font-semibold text-[#33453c]" htmlFor="disc-input">
        Disciplinas deste semestre <span className="font-bold text-[#d32f2f]" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <div
          className="flex flex-wrap items-center gap-1.5 rounded-md border border-[#cfd5d0] px-2.5 py-1.5 text-[#7b8b83] focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-floresta"
          onMouseDown={(e) => {
            if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          <Lupa tamanho={16} />
          {value.map((nome) => (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-[#d6ebdd] py-0.5 pl-2.5 pr-1 text-[11px] font-medium text-[#143527]"
              key={nome}
            >
              {nome}
              <button
                type="button"
                className="cursor-pointer border-0 bg-transparent px-1 text-sm leading-none text-inherit"
                aria-label={`Remover ${nome}`}
                onClick={() => onChange(value.filter((d) => d !== nome))}
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="disc-input"
            ref={inputRef}
            value={texto}
            placeholder="Busque e selecione na lista"
            className="min-w-[140px] flex-1 border-0 bg-transparent py-1 text-xs text-[#1d2b24] outline-none"
            autoComplete="off"
            role="combobox"
            aria-expanded={aberto}
            aria-controls={listaId}
            aria-autocomplete="list"
            aria-required="true"
            aria-activedescendant={aberto && ativo >= 0 ? `${listaId}-${ativo}` : undefined}
            onFocus={() => setAberto(true)}
            onClick={() => setAberto(true)}
            onChange={aoDigitar}
            onKeyDown={aoTeclar}
            onBlur={() => {
              setAberto(false);
              setTexto("");
            }}
          />
        </div>
        {aberto && (
          <ul
            className="absolute inset-x-0 top-[calc(100%+4px)] z-10 m-0 max-h-[264px] list-none overflow-auto rounded-[10px] border border-[#d9ddd8] bg-white p-1.5 shadow-[0_8px_24px_#0002]"
            id={listaId}
            role="listbox"
          >
            {opcoes.length === 0 && (
              <li className="cursor-default px-2.5 py-2 text-[13px] text-[#6c8478]">
                Nenhuma disciplina encontrada na lista.
              </li>
            )}
            {opcoes.map((o, i) => (
              <li
                key={o.nome}
                id={`${listaId}-${i}`}
                role="option"
                aria-selected={i === ativo}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] text-[#1d2b24] hover:bg-[#eaf4ee] ${
                  i === ativo ? "bg-[#eaf4ee]" : ""
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(o.nome);
                }}
              >
                <Lupa className="flex-none text-[#7b8b83]" />
                <span>
                  {o.trechos.map((t, k) => (t.negrito ? <b className="font-bold" key={k}>{t.texto}</b> : <span key={k}>{t.texto}</span>))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {mensagem && <p className="mt-1.5 text-xs text-[#b3361f]">{mensagem}</p>}
    </>
  );
}
