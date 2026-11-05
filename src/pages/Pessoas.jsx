import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ConviteModal from "../components/ConviteModal";
import MatchCard from "../components/MatchCard";
import CirculosDecorativos from "../components/layout/CirculosDecorativos";
import Logo from "../components/layout/Logo";
import Toast from "../components/ui/Toast";
import iconeSino from "../assets/icons/sino.png";
import { buscarMatches } from "../services/api";
import { prepararMatches } from "../utils/matches";
import { obterAlunoAtual } from "../utils/sessao";

const CAIXA_MENSAGEM = "rounded-tag bg-white p-8 text-center text-lg font-medium text-apagado";

export default function Pessoas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [aviso, setAviso] = useState(location.state?.aviso ?? "");
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [convidando, setConvidando] = useState(null);
  const [aluno] = useState(obterAlunoAtual);
  const [carga, setCarga] = useState({ estado: aluno ? "carregando" : "sem-perfil", matches: [], erro: "" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!aluno) return;
    let ativo = true;
    setCarga((c) => ({ ...c, estado: "carregando", erro: "" }));
    buscarMatches(aluno.id)
      .then((lista) => ativo && setCarga({ estado: "pronto", matches: prepararMatches(lista), erro: "" }))
      .catch((erro) => {
        if (!ativo) return;
        if (erro.naoEncontrado) setCarga({ estado: "sem-perfil", matches: [], erro: "" });
        else setCarga({ estado: "erro", matches: [], erro: erro.message });
      });
    return () => {
      ativo = false;
    };
  }, [aluno, tentativa]);

  useEffect(() => {
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const fecharAviso = useCallback(() => setAviso(""), []);
  const matches = carga.matches;

  return (
    <div className="relative isolate min-h-screen">
      <CirculosDecorativos variante="pessoas" />

      <header className="mx-auto flex w-full max-w-360 flex-wrap items-center justify-between gap-x-3 gap-y-4 px-4 pt-6 sm:gap-x-5 sm:px-8 lg:px-11.75 lg:pt-10">
        <Logo para="/pessoas" className="order-1" />

        <nav aria-label="Ações da conta" className="order-3 flex w-full gap-2 sm:order-2 sm:ml-auto sm:w-auto sm:gap-5">
          <Link
            to="/mapa"
            className="flex h-11.25 flex-1 items-center justify-center whitespace-nowrap rounded-pilula border-2 border-floresta px-3 text-sm font-semibold text-floresta transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta sm:flex-none sm:px-6 sm:text-lg"
          >
            Locais de estudo
          </Link>
          <Link
            to="/perfil"
            className="flex h-11.25 flex-1 items-center justify-center whitespace-nowrap rounded-pilula border border-black bg-floresta px-3 text-sm font-semibold text-white transition hover:bg-musgo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta sm:w-50 sm:flex-none sm:px-6 sm:text-xl"
          >
            Editar Perfil
          </Link>
        </nav>

        <div className="relative order-2 sm:order-3">
          <button
            type="button"
            aria-label="Notificações"
            aria-expanded={notificacoesAbertas}
            aria-controls="painel-notificacoes"
            onClick={() => setNotificacoesAbertas((v) => !v)}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-lima transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta sm:size-12.5"
          >
            <img src={iconeSino} alt="" className="size-7.5 sm:size-8.5" />
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
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-360 gap-8 px-4 pb-12 pt-8 sm:px-8 lg:px-11.75 lg:pt-10">
        <main aria-label="Pessoas compatíveis" aria-busy={carga.estado === "carregando"}>
          {carga.estado === "carregando" && <p className={CAIXA_MENSAGEM}>Procurando pessoas compatíveis...</p>}

          {carga.estado === "sem-perfil" && (
            <div className={CAIXA_MENSAGEM}>
              <p>Preencha seu perfil de estudos para encontrarmos pessoas compatíveis.</p>
              <Link
                to="/perfil"
                className="mt-5 inline-flex h-11 items-center rounded-pilula bg-floresta px-6 text-base font-semibold text-white transition hover:bg-musgo"
              >
                Preencher perfil
              </Link>
            </div>
          )}

          {carga.estado === "erro" && (
            <div role="alert" className={CAIXA_MENSAGEM}>
              <p>{carga.erro || "Não foi possível carregar os matches."}</p>
              <button
                type="button"
                onClick={() => setTentativa((t) => t + 1)}
                className="mt-5 inline-flex h-11 items-center rounded-pilula bg-floresta px-6 text-base font-semibold text-white transition hover:bg-musgo"
              >
                Tentar de novo
              </button>
            </div>
          )}

          {carga.estado === "pronto" &&
            (matches.length ? (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {matches.map(({ id, ...match }) => (
                  <MatchCard key={id} {...match} onConvidar={() => setConvidando(match)} />
                ))}
              </div>
            ) : (
              <p className={CAIXA_MENSAGEM}>
                Ainda não encontramos ninguém com disciplinas e horários em comum. Volte depois que mais colegas
                preencherem o perfil.
              </p>
            ))}
        </main>
      </div>

      {convidando && (
        <ConviteModal
          destinatario={convidando}
          onFechar={() => setConvidando(null)}
          onEnviar={() => {
            // MVP: o convite ainda não é gravado; falta uma rota em api/ que salve no Mongo.
            setConvidando(null);
            setAviso("Convite enviado com sucesso");
          }}
        />
      )}

      <Toast mensagem={aviso} onFechar={fecharAviso} />
    </div>
  );
}