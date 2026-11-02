import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FOCOS, GRUPOS, SEMESTRES } from "../constants";
import AvailabilityGrid from "../components/AvailabilityGrid";
import AvailabilityModal from "../components/AvailabilityModal";
import DisciplinaSelect from "../components/DisciplinaSelect";
import OptionButtons from "../components/OptionButtons";
import BotaoVoltar from "../components/layout/BotaoVoltar";
import CirculosDecorativos from "../components/layout/CirculosDecorativos";
import Logo from "../components/layout/Logo";
import { sair } from "../services/auth";
import { montarPerfil } from "../utils/exportar";
import { salvarPerfil } from "../utils/salvar";

// Classes reutilizadas pelos campos deste formulário (equivalentes ao antigo perfil.css).
const estilo = {
  secao: "mb-[18px]",
  rotulo: "mb-1.5 block text-xs font-semibold text-[#33453c]",
  subrotulo: "mb-1.5 mt-3 block text-xs font-medium text-[#33453c]",
  erro: "mt-1.5 text-xs text-[#b3361f]",
  campo:
    "w-full rounded-md border border-[#cfd5d0] bg-white px-3 py-2.5 text-[13px] text-[#1d2b24] " +
    "focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-floresta",
  botao:
    "block w-full cursor-pointer rounded-pilula border-0 p-3 text-[13px] font-bold " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta",
};

// Asterisco vermelho dos campos obrigatórios.
const Obrigatorio = () => (
  <span className="font-bold text-[#d32f2f]" aria-hidden="true">
    *
  </span>
);

export default function Perfil() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [disciplinas, setDisciplinas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [focos, setFocos] = useState([]);
  const [usarPref, setUsarPref] = useState(false);
  const [grupo, setGrupo] = useState("misto");
  const [semestre, setSemestre] = useState("outros");
  const [erros, setErros] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 3500);
    return () => clearTimeout(t);
  }, [aviso]);

  const limpaErro = (campo) => setErros((e) => ({ ...e, [campo]: undefined }));

  async function enviar(e) {
    e.preventDefault();
    const novos = {};
    if (nome.trim().length < 2) novos.nome = "Informe seu nome.";
    if (!disciplinas.length) novos.disciplinas = "Adicione pelo menos uma disciplina.";
    if (!slots.length) novos.slots = "Adicione pelo menos um horário disponível.";
    if (!focos.length) novos.focos = "Escolha pelo menos um foco para os encontros.";
    setErros(novos);
    if (Object.keys(novos).length) return;

    try {
      const resultado = await salvarPerfil(
        montarPerfil({ nome, disciplinas, slots, focos, usarPref, grupo, semestre }),
      );
      navigate("/pessoas", {
        state: { aviso: resultado?.baixado ? "Perfil baixado! Envie o arquivo para a equipe." : "Perfil salvo!" },
      });
    } catch (err) {
      if (err?.code !== "declined") setAviso("Não foi possível salvar o perfil.");
    }
  }

  async function logout() {
    await sair();
    navigate("/", { replace: true });
  }

  return (
    <div className="relative isolate min-h-screen">
      <CirculosDecorativos variante="perfil" />

      <header className="flex items-center justify-between px-4 pt-6 sm:px-7 sm:pt-6 lg:px-[50px]">
        <BotaoVoltar fallback="/pessoas" />
        <Logo para="/pessoas" />
      </header>

      <main className="flex justify-center px-4 pb-10 pt-6 sm:pb-12 lg:-mt-6 lg:pt-0">
        <div className="w-full max-w-[580px] rounded-campo bg-white px-4 py-7 shadow-[0_1px_3px_#0000001a] sm:px-8">
          <h1 className="text-center text-[28px] font-medium leading-tight text-[#1b2b24] sm:text-[30px]">
            Seu Perfil de Estudos
          </h1>
          <p className="mx-auto mb-6 mt-2 max-w-[340px] text-center text-sm text-[#6c8478]">
            Conte-nos o que e quando você precisa estudar para encontrarmos sua dupla ideal.
          </p>

          {/* "perfil-form" ainda é necessário enquanto AvailabilityGrid, AvailabilityModal,
              DisciplinaSelect e OptionButtons usarem as classes do perfil.css. */}
          <div className="perfil-form">
            <form onSubmit={enviar} noValidate>
              <section className={estilo.secao}>
                <label className={estilo.rotulo} htmlFor="nome">
                  Seu nome <Obrigatorio />
                </label>
                <input
                  id="nome"
                  className={estilo.campo}
                  type="text"
                  value={nome}
                  maxLength={80}
                  placeholder="Nome e sobrenome"
                  autoComplete="name"
                  aria-required="true"
                  onChange={(e) => {
                    setNome(e.target.value);
                    limpaErro("nome");
                  }}
                />
                {erros.nome && <p className={estilo.erro}>{erros.nome}</p>}
              </section>

              <section className={estilo.secao}>
                <DisciplinaSelect
                  value={disciplinas}
                  erro={erros.disciplinas}
                  onChange={(v) => {
                    setDisciplinas(v);
                    limpaErro("disciplinas");
                  }}
                />
              </section>

              <section className={estilo.secao}>
                <div className="flex items-baseline justify-between">
                  <span className={estilo.rotulo}>
                    Sua disponibilidade semanal <Obrigatorio />
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-floresta underline"
                    onClick={() => setModalAberto(true)}
                  >
                    Editar horários
                  </button>
                </div>
                <AvailabilityGrid slots={slots} onAbrir={() => setModalAberto(true)} />
                {erros.slots && <p className={estilo.erro}>{erros.slots}</p>}
              </section>

              <section className={estilo.secao}>
                <span className={estilo.rotulo}>
                  Foco dos encontros <Obrigatorio />
                </span>
                <OptionButtons
                  rotulo="Foco dos encontros"
                  opcoes={FOCOS}
                  selecionado={(id) => focos.includes(id)}
                  onAlternar={(id) => {
                    setFocos((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
                    limpaErro("focos");
                  }}
                />
                {erros.focos && <p className={estilo.erro}>{erros.focos}</p>}
              </section>

              <section className={estilo.secao}>
                <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-semibold">
                  <input
                    type="checkbox"
                    className="h-[18px] w-[18px] accent-floresta"
                    checked={usarPref}
                    onChange={(e) => setUsarPref(e.target.checked)}
                  />
                  <span>Preferência de integrantes</span>
                </label>
                {usarPref && (
                  <div>
                    <span className={estilo.subrotulo}>Composição do grupo</span>
                    <OptionButtons
                      rotulo="Composição do grupo"
                      opcoes={GRUPOS}
                      selecionado={(id) => grupo === id}
                      onAlternar={setGrupo}
                    />
                    <span className={estilo.subrotulo}>Semestre dos integrantes</span>
                    <OptionButtons
                      className="opts two"
                      rotulo="Semestre dos integrantes"
                      opcoes={SEMESTRES}
                      selecionado={(id) => semestre === id}
                      onAlternar={setSemestre}
                    />
                  </div>
                )}
              </section>

              <button type="submit" className={`${estilo.botao} bg-floresta text-white hover:bg-[#143527]`}>
                Salvar e encontrar matches
              </button>
              <button type="button" className={`${estilo.botao} mt-2.5 bg-[#c8db55] text-[#143527]`} onClick={logout}>
                Logout
              </button>
            </form>

            {modalAberto && (
              <AvailabilityModal
                slots={slots}
                onCancelar={() => setModalAberto(false)}
                onConfirmar={(novos) => {
                  setSlots(novos);
                  limpaErro("slots");
                  setModalAberto(false);
                }}
              />
            )}
          </div>
        </div>
      </main>

      {aviso && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-pilula bg-floresta px-5 py-3 font-semibold text-white shadow-lg"
        >
          {aviso}
        </div>
      )}
    </div>
  );
}
