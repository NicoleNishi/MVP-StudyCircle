import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConviteModal from "../components/ConviteModal";
import MatchCard from "../components/MatchCard";
import CirculosDecorativos from "../components/layout/CirculosDecorativos";
import Logo from "../components/layout/Logo";
import Toast from "../components/ui/Toast";
import Toggle from "../components/ui/Toggle";
import iconeSino from "../assets/icons/sino.png";
import { MATCHES, PERFIL_ATUAL } from "../data/matchesMock";

function filtrarMatches(matches, filtros, perfil) {
  let lista = [...matches];
  if (filtros.mesmoCampus) lista = lista.filter((m) => m.campus === perfil.campus);
  if (filtros.porHorario) lista = lista.filter((m) => m.horariosEmComum.length > 0);
  lista.sort((a, b) => {
    if (filtros.mesmoCurso) {
      const diferenca = Number(b.curso === perfil.curso) - Number(a.curso === perfil.curso);
      if (diferenca) return diferenca;
    }
    return b.afinidade - a.afinidade;
  });
  return lista;
}

export default function Pessoas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState(location.state?.aviso ?? "");
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [convidando, setConvidando] = useState(null);
  const [filtros, setFiltros] = useState({ mesmoCampus: true, mesmoCurso: false, porHorario: true });

  useEffect(() => {
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const fecharAviso = useCallback(() => setAviso(""), []);
  const alterarFiltro = (chave) => (valor) => setFiltros((f) => ({ ...f, [chave]: valor }));

  const matches = useMemo(() => filtrarMatches(MATCHES, filtros, PERFIL_ATUAL), [filtros]);

  return (
    <div className="relative isolate min-h-screen">
      <CirculosDecorativos variante="pessoas" />

      <header className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 pt-6 sm:px-8 lg:px-[47px] lg:pt-10">
        <Logo para="/pessoas" />

        <nav aria-label="Ações da conta" className="relative flex items-center gap-2 sm:gap-5">
          <Link
            to="/mapa"
            className="hidden h-[45px] items-center rounded-pilula border-2 border-floresta px-6 text-lg font-semibold text-floresta transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta sm:flex"
          >
            Locais de estudo
          </Link>
          <Link
            to="/perfil"
            className="flex h-[45px] items-center rounded-pilula border border-black bg-floresta px-4 text-base font-semibold text-white sm:px-6 transition hover:bg-musgo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta sm:w-[200px] sm:justify-center sm:text-xl"
          >
            Editar Perfil
          </Link>
          <button
            type="button"
            aria-label="Notificações"
            aria-expanded={notificacoesAbertas}
            aria-controls="painel-notificacoes"
            onClick={() => setNotificacoesAbertas((v) => !v)}
            className="grid size-[50px] shrink-0 place-items-center rounded-full bg-lima transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta"
          >
            <img src={iconeSino} alt="" className="size-[34px]" />
          </button>
          {notificacoesAbertas && (
            <div
              id="painel-notificacoes"
              role="region"
              aria-label="Notificações"
              className="absolute right-0 top-[calc(100%+10px)] z-20 w-64 rounded-tag bg-white p-4 text-[15px] font-medium text-apagado shadow-lg"
            >
              Nenhuma notificação nova.
            </div>
          )}
        </nav>
      </header>

      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 pb-12 pt-8 sm:px-8 lg:grid-cols-[325px_1fr] lg:items-start lg:px-[47px] lg:pt-10">
        <aside
          aria-labelledby="titulo-filtros"
          className="rounded-tag bg-white px-6 pb-7 pt-7 shadow-[0_1px_3px_#0000000d]"
        >
          <h2 id="titulo-filtros" className="mb-6 text-[28px] font-medium leading-tight text-black">
            Filtros
          </h2>
          <div className="flex flex-col gap-6">
            <Toggle
              rotulo="Apenas mesmo campus"
              ativo={filtros.mesmoCampus}
              onAlternar={alterarFiltro("mesmoCampus")}
              tom="musgo"
            />
            <Toggle
              rotulo="Priorizar mesmo curso"
              ativo={filtros.mesmoCurso}
              onAlternar={alterarFiltro("mesmoCurso")}
              tom="musgo"
            />
            <Toggle
              rotulo="Filtrar por horário"
              ativo={filtros.porHorario}
              onAlternar={alterarFiltro("porHorario")}
              tom="lima"
            />
          </div>
          <Link
            to="/mapa"
            className="mt-7 block text-center text-[15px] font-semibold text-floresta underline-offset-2 hover:underline sm:hidden"
          >
            Ver locais de estudo
          </Link>
        </aside>

        <main aria-label="Pessoas compatíveis">
          {matches.length ? (
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
              {matches.map(({ id, ...match }) => (
                <MatchCard key={id} {...match} onConvidar={() => setConvidando(match)} />
              ))}
            </div>
          ) : (
            <p className="rounded-tag bg-white p-8 text-center text-lg font-medium text-apagado">
              Nenhuma pessoa encontrada com esses filtros.
            </p>
          )}
        </main>
      </div>

      {convidando && (
        <ConviteModal
          destinatario={convidando}
          onFechar={() => setConvidando(null)}
          onEnviar={() => {
            // MVP: Aguardando Backend; aqui entraria a chamada da API.
            setConvidando(null);
            setAviso("Convite enviado com sucesso");
          }}
        />
      )}

      <Toast mensagem={aviso} onFechar={fecharAviso} />
    </div>
  );
}