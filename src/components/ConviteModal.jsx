import { useEffect, useId, useRef, useState } from "react";
import Avatar from "./Avatar";
import { LOCAIS_ESTUDO } from "../data/locaisEstudo";

export const OBJETIVOS_CONVITE = [
  { id: "fazer_lista", label: "Fazer Lista" },
  { id: "revisao_geral", label: "Revisão Geral" },
  { id: "estudar_teoria", label: "Estudar Teoria" },
];

const hojeISO = () => {
  const agora = new Date();
  agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
  return agora.toISOString().slice(0, 10);
};

const CAMPO =
  "w-full rounded-campo border-2 border-borda bg-white px-3 text-[15px] text-black outline-none transition placeholder:text-apagado focus:border-floresta";


export default function ConviteModal({ destinatario, onEnviar, onFechar }) {
  const ref = useRef(null);
  const idTitulo = useId();
  const idData = useId();
  const idMensagem = useId();
  const idLocal = useId();
  const [data, setData] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [objetivos, setObjetivos] = useState([]);
  const [local, setLocal] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!ref.current.open) ref.current.showModal();
  }, []);

  const alternarObjetivo = (id) =>
    setObjetivos((atuais) => (atuais.includes(id) ? atuais.filter((o) => o !== id) : [...atuais, id]));

  function enviar(e) {
    e.preventDefault();
    if (!data) return setErro("Escolha uma data para o encontro.");
    if (data < hojeISO()) return setErro("A data precisa ser hoje ou depois.");
    onEnviar({
      para: destinatario.nome,
      data,
      mensagem: mensagem.trim(),
      objetivos,
      local: LOCAIS_ESTUDO.find((l) => l.id === local)?.nome ?? null,
    });
  }

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault();
        onFechar();
      }}
      onClick={(e) => e.target === e.currentTarget && onFechar()}
      className="m-auto w-[min(467px,calc(100vw-2rem))] rounded-tag bg-white p-0 text-black shadow-xl backdrop:bg-creme/40 backdrop:backdrop-blur-sm"
    >
      <form onSubmit={enviar} noValidate className="flex flex-col px-5 pb-4 pt-5 sm:px-6">
        <p className="text-lg font-medium leading-tight">Solicitação</p>

        <div className="mt-3 flex items-center gap-5">
          <Avatar
            nome={destinatario.nome}
            foto={destinatario.foto}
            genero={destinatario.genero}
            cor={destinatario.corAvatar}
            className="size-17.5 sm:size-21.5"
          />
          <h2 id={idTitulo} className="text-[28px] font-medium leading-[1.2] sm:text-[34px]">
            Enviar Convite para {destinatario.nome}
          </h2>
        </div>

        <label htmlFor={idData} className="mt-5 text-xl font-medium">
          Data
        </label>
        <input
          id={idData}
          type="date"
          min={hojeISO()}
          value={data}
          aria-invalid={erro ? true : undefined}
          onChange={(e) => {
            setData(e.target.value);
            setErro("");
          }}
          className={`${CAMPO} mt-1.5 h-12.25`}
        />
        {erro && (
          <p role="alert" className="mt-1.5 text-[13px] font-medium text-erro">
            {erro}
          </p>
        )}

        <label htmlFor={idMensagem} className="mt-4 text-xl font-medium">
          Mensagem rápida
        </label>
        <textarea
          id={idMensagem}
          rows={3}
          maxLength={280}
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Digite uma mensagem"
          className={`${CAMPO} mt-1.5 h-24.75 resize-none py-2.5`}
        />

        <div role="group" aria-label="Objetivo do encontro" className="mt-4 flex flex-wrap gap-2">
          {OBJETIVOS_CONVITE.map((o) => {
            const ativo = objetivos.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={ativo}
                onClick={() => alternarObjetivo(o.id)}
                className={`h-8.75 rounded-tag px-4 text-[15px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta ${
                  ativo ? "bg-floresta text-white" : "bg-chip text-black hover:brightness-95"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        <button
          type="submit"
          className="mt-7 h-13.75 w-full rounded-pilula bg-floresta text-[15px] font-bold text-white transition hover:bg-musgo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta"
        >
          Enviar Convite
        </button>

        <label htmlFor={idLocal} className="sr-only">
          Ponto de estudo
        </label>
        <select
          id={idLocal}
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className="mt-2.5 h-13.75 w-full cursor-pointer appearance-none rounded-pilula bg-lima px-6 text-center text-[15px] font-bold text-floresta transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta"
        >
          <option value="">Escolha o ponto de estudo</option>
          {LOCAIS_ESTUDO.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </select>
      </form>
    </dialog>
  );
}