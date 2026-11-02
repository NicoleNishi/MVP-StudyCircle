import { useState } from "react";
import BotaoVoltar from "../components/layout/BotaoVoltar";
import Logo from "../components/layout/Logo";

// Heatmap de qualidade de conexão (QoS) publicado no Streamlit Community Cloud.
const HEATMAP_URL = "https://studycircle-qos-eachusp.streamlit.app/";
const HEATMAP_EMBED_URL = `${HEATMAP_URL}?embed=true`;

export default function Mapa() {
  const [carregado, setCarregado] = useState(false);

  return (
    <div className="flex min-h-screen flex-col gap-5 bg-creme px-4 pb-6 pt-6 sm:px-7">
      <header className="flex flex-wrap items-center gap-4">
        <BotaoVoltar fallback="/pessoas" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-medium leading-tight text-black sm:text-[28px]">Locais de estudo</h1>
          <p className="text-[15px] font-medium text-apagado">Qualidade da conexão na EACH (Wi-Fi e dados móveis)</p>
        </div>
        <Logo para="/pessoas" className="hidden sm:inline-flex" />
      </header>

      <main className="relative flex flex-1 flex-col overflow-hidden rounded-cartao bg-white shadow-[0_1px_3px_#0000001a]">
        {!carregado && (
          <p className="absolute inset-0 grid place-items-center px-6 text-center text-[15px] font-medium text-musgo">
            Carregando o mapa... Se o app estiver em repouso, clique no botão para acordá-lo.
          </p>
        )}
        <iframe
          src={HEATMAP_EMBED_URL}
          title="Heatmap de qualidade da conexão na EACH"
          onLoad={() => setCarregado(true)}
          allow="fullscreen"
          className="relative min-h-150 w-full flex-1 border-0"
        />
      </main>

      <p className="text-center text-sm font-medium text-apagado">
        O mapa não apareceu?{" "}
        <a
          href={HEATMAP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-floresta underline-offset-2 hover:underline"
        >
          Abrir o heatmap em uma nova aba
        </a>
      </p>
    </div>
  );
}