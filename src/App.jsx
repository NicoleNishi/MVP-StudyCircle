import { useEffect, useState } from "react";
import { FOCOS, GRUPOS, SEMESTRES } from "./constants";
import AvailabilityGrid from "./components/AvailabilityGrid";
import AvailabilityModal from "./components/AvailabilityModal";
import DisciplinaSelect from "./components/DisciplinaSelect";
import OptionButtons from "./components/OptionButtons";
import { montarPerfil } from "./utils/exportar";
import { salvarPerfil } from "./utils/salvar";

const CIRCULOS = [
  { s: 300, x: "-4%", y: "22%", c: "#cfeedd" },
  { s: 240, x: "-2%", y: "62%", c: "#6fa88f" },
  { s: 230, x: "8%", y: "55%", c: "#dfe6a8aa" },
  { s: 330, x: "88%", y: "14%", c: "#7e9f92" },
  { s: 240, x: "80%", y: "70%", c: "#d6df8faa" },
];

export default function App() {
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
      await salvarPerfil(montarPerfil({ nome, disciplinas, slots, focos, usarPref, grupo, semestre }));
      setAviso("Perfil salvo!");
    } catch (err) {
      if (err?.code !== "declined") setAviso("Não foi possível salvar o perfil.");
    }
  }

  return (
    <>
      <div className="bg" aria-hidden="true">
        {CIRCULOS.map((c, i) => (
          <i key={i} style={{ "--s": `${c.s}px`, "--x": c.x, "--y": c.y, "--c": c.c }} />
        ))}
      </div>

      <header className="top">
        <a className="back" href="#voltar" onClick={(e) => { e.preventDefault(); history.back(); }} aria-label="Voltar">‹</a>
        <span className="brand">studycircle</span>
      </header>

      <main className="card">
        <h1>Seu Perfil de Estudos</h1>
        <p className="sub">Conte-nos o que e quando você precisa estudar para encontrarmos sua dupla ideal.</p>

        <form onSubmit={enviar} noValidate>
          <section>
            <label className="lbl" htmlFor="nome">
              Seu nome <span className="req" aria-hidden="true">*</span>
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
              onChange={(e) => { setNome(e.target.value); limpaErro("nome"); }}
            />
            {erros.nome && <p className="err">{erros.nome}</p>}
          </section>

          <section>
            <DisciplinaSelect
              value={disciplinas}
              erro={erros.disciplinas}
              onChange={(v) => { setDisciplinas(v); limpaErro("disciplinas"); }}
            />
          </section>

          <section>
            <div className="row">
              <span className="lbl">Sua disponibilidade semanal <span className="req" aria-hidden="true">*</span></span>
              <button type="button" className="link" onClick={() => setModalAberto(true)}>Editar horários</button>
            </div>
            <AvailabilityGrid slots={slots} onAbrir={() => setModalAberto(true)} />
            {erros.slots && <p className="err">{erros.slots}</p>}
          </section>

          <section>
            <span className="lbl">Foco dos encontros <span className="req" aria-hidden="true">*</span></span>
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
                <OptionButtons rotulo="Composição do grupo" opcoes={GRUPOS} selecionado={(id) => grupo === id} onAlternar={setGrupo} />
                <span className="lbl sm">Semestre dos integrantes</span>
                <OptionButtons className="opts two" rotulo="Semestre dos integrantes" opcoes={SEMESTRES} selecionado={(id) => semestre === id} onAlternar={setSemestre} />
              </div>
            )}
          </section>

          <button type="submit" className="btn primary">Salvar e encontrar matches</button>
          <button type="button" className="btn lime" onClick={() => { /* TODO: integrar com a autenticação do site */ }}>
            Logout
          </button>
        </form>
      </main>

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

      {aviso && <div className="toast" role="status">{aviso}</div>}
    </>
  );
}
