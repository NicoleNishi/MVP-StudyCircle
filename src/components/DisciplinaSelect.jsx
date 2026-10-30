import { useEffect, useId, useMemo, useRef, useState } from "react";
import { buscar } from "../utils/busca";

const Lupa = ({ tamanho = 14 }) => (
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/** Campo de disciplinas: só aceita nomes da lista oficial, escolhidos nas sugestões. */
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
      <label className="lbl" htmlFor="disc-input">
        Disciplinas deste semestre <span className="req" aria-hidden="true">*</span>
      </label>
      <div className="combo">
        <div
          className="chips-box"
          onMouseDown={(e) => {
            if (e.target.tagName !== "INPUT" && e.target.tagName !== "BUTTON") {
              e.preventDefault();
              inputRef.current?.focus();
            }
          }}
        >
          <Lupa tamanho={16} />
          {value.map((nome) => (
            <span className="chip" key={nome}>
              {nome}
              <button type="button" aria-label={`Remover ${nome}`} onClick={() => onChange(value.filter((d) => d !== nome))}>
                ×
              </button>
            </span>
          ))}
          <input
            id="disc-input"
            ref={inputRef}
            value={texto}
            placeholder="Busque e selecione na lista"
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
          <ul className="sug" id={listaId} role="listbox">
            {opcoes.length === 0 && <li className="none">Nenhuma disciplina encontrada na lista.</li>}
            {opcoes.map((o, i) => (
              <li
                key={o.nome}
                id={`${listaId}-${i}`}
                role="option"
                aria-selected={i === ativo}
                onMouseDown={(e) => {
                  e.preventDefault(); // não tira o foco do campo
                  escolher(o.nome);
                }}
              >
                <Lupa />
                <span>
                  {o.trechos.map((t, k) => (t.negrito ? <b key={k}>{t.texto}</b> : <span key={k}>{t.texto}</span>))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {mensagem && <p className="err">{mensagem}</p>}
    </>
  );
}
