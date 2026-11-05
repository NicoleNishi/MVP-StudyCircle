import { useId } from "react";
import Avatar from "./Avatar";

function Tags({ rotulo, itens, tamanhoTexto = "text-[15px]" }) {
  return (
    <>
      <dt className="text-[15px] font-medium leading-4.5 text-black">{rotulo}</dt>
      <dd>
        {itens.length ? (
          <ul className="flex flex-wrap gap-2">
            {itens.map((item) => (
              <li
                key={item}
                className={`rounded-tag bg-chip/80 px-1.75 py-1 font-medium leading-4.5 text-black ${tamanhoTexto}`}
              >
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <span className="text-[15px] font-medium text-apagado">Nenhum</span>
        )}
      </dd>
    </>
  );
}

export default function MatchCard({
  nome,
  semestre,
  curso,
  materiasEmComum = [],
  horariosEmComum = [],
  afinidade = 0,
  genero,
  corAvatar,
  foto,
  onConvidar,
}) {
  const idTitulo = useId();
  const porcentagem = Math.round(Math.min(100, Math.max(0, Number(afinidade) || 0)));

  return (
    <article
      aria-labelledby={idTitulo}
      className="flex flex-col rounded-tag bg-white px-4 pb-5 pt-4 shadow-[0_1px_3px_#0000000d] sm:px-5.5"
    >
      <header className="flex items-center gap-4 sm:gap-5">
        <Avatar nome={nome} foto={foto} genero={genero} cor={corAvatar} className="size-16 sm:size-21.5" />

        <div className="min-w-0 flex-1">
          <h2 id={idTitulo} className="text-lg font-medium leading-6 text-black sm:text-xl">
            {nome}, <span className="whitespace-nowrap">{semestre}º Semestre</span>
          </h2>
          {curso && <p className="mt-1 text-[15px] font-medium leading-4.5 text-apagado">{curso}</p>}
        </div>

        <div
          className="grid size-15 shrink-0 place-items-center rounded-full bg-lima text-center sm:size-17.5"
          aria-label={`${porcentagem}% de afinidade`}
        >
          <p aria-hidden="true" className="leading-none text-black">
            <span className="block text-[15px] font-bold">{porcentagem}%</span>
            <span className="block text-[10px] font-bold">Afinidade</span>
          </p>
        </div>
      </header>

      <hr className="my-4 border-t-2 border-borda" />

      <dl className="grid grid-cols-1 items-center gap-x-3 gap-y-2 sm:grid-cols-[8.5rem_1fr] sm:gap-y-3">
        <Tags rotulo="Em comum:" itens={materiasEmComum} />
        <Tags rotulo="Horários batem:" itens={horariosEmComum} tamanhoTexto="text-sm" />
      </dl>

      <button
        type="button"
        onClick={onConvidar}
        className="mt-5 h-10.75 w-full rounded-pilula bg-floresta text-[15px] font-bold leading-4.5 text-white transition hover:bg-musgo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta"
      >
        Enviar Convite
      </button>
    </article>
  );
}