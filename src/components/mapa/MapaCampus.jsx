/* Não está sendo usado. Verificar possível limpeza. */

import CartaoLocal from "./CartaoLocal";


export default function MapaCampus({ locais }) {
  return (
    <section
      aria-label="Mapa de locais de estudo da EACH"
      className="flex min-h-[420px] w-full flex-1 flex-col items-center justify-center gap-8 rounded-cartao border-2 border-dashed border-musgo/30 bg-menta/30 px-4 py-10"
    >
      <div className="max-w-md text-center">
        <p className="text-xl font-semibold text-floresta">O mapa da EACH vai aparecer aqui</p>
        <p className="mt-2 text-[15px] font-medium text-musgo/80">
          Enquanto isso, confira os locais de estudo cadastrados.
        </p>
      </div>

      {locais.length ? (
        <ul className="flex flex-wrap justify-center gap-4">
          {locais.map((local) => (
            <li key={local.id}>
              <CartaoLocal local={local} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[15px] font-medium text-apagado">Nenhum local encontrado com esses filtros.</p>
      )}
    </section>
  );
}