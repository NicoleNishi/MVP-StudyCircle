/* Não está sendo usado. Verificar possível limpeza. */
export default function CartaoLocal({ local }) {
  const wifiRuim = local.wifi.qualidade !== "excelente";

  return (
    <article className="w-fit max-w-full rounded-md bg-white px-2.5 pb-2.5 pt-2 shadow-[0_2px_10px_#00000026]">
      <h3 className="mb-1.5 text-[15px] font-semibold text-black">{local.nome}</h3>
      <ul className="flex flex-col items-start gap-1 text-[11px] text-black">
        <li className="rounded bg-borda/80 px-1.5 py-0.5">
          <b className="font-semibold">Ruído:</b> {local.ruido.db}dB ({local.ruido.rotulo})
        </li>
        <li className={`rounded px-1.5 py-0.5 ${wifiRuim ? "bg-borda" : "bg-chip"}`}>
          {wifiRuim && <span aria-hidden="true">⚠ </span>}
          <b className="font-semibold">Wi-Fi eduroam:</b> {local.wifi.detalhe}
        </li>
      </ul>
    </article>
  );
}