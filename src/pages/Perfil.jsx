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
import "../styles/perfil.css";

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

          <div className="perfil-form">
            <form onSubmit={enviar} noValidate>
              <section>
                <label className="lbl" htmlFor="nome">
                  Seu nome{" "}
                  <span className="req" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="nome"
                  className="text"
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
                {erros.nome && <p className="err">{erros.nome}</p>}
              </section>

              <section>
                <DisciplinaSelect
                  value={disciplinas}
                  erro={erros.disciplinas}
                  onChange={(v) => {
                    setDisciplinas(v);
                    limpaErro("disciplinas");
                  }}
                />
              </section>

              <section>
                <div className="row">
                  <span className="lbl">
                    Sua disponibilidade semanal{" "}
                    <span className="req" aria-hidden="true">
                      *
                    </span>
                  </span>
                  <button type="button" className="link" onClick={() => setModalAberto(true)}>
                    Editar horários
                  </button>
                </div>
                <AvailabilityGrid slots={slots} onAbrir={() => setModalAberto(true)} />
                {erros.slots && <p className="err">{erros.slots}</p>}
              </section>

              <section>
                <span className="lbl">
                  Foco dos encontros{" "}
                  <span className="req" aria-hidden="true">
                    *
                  </span>
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
                {erros.focos && <p className="err">{erros.focos}</p>}
              </section>

              <section>
                <label className="switch">
                  <input type="checkbox" checked={usarPref} onChange={(e) => setUsarPref(e.target.checked)} />
                  <span>Preferência de integrantes</span>
                </label>
                {usarPref && (
                  <div>
                    <span className="lbl sm">Composição do grupo</span>
                    <OptionButtons
                      rotulo="Composição do grupo"
                      opcoes={GRUPOS}
                      selecionado={(id) => grupo === id}
                      onAlternar={setGrupo}
                    />
                    <span className="lbl sm">Semestre dos integrantes</span>
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

              <button type="submit" className="btn primary">
                Salvar e encontrar matches
              </button>
              <button type="button" className="btn lime" onClick={logout}>
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