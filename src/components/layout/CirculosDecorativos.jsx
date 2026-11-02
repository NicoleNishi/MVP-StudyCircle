const CIRCULO = "absolute rounded-full";

function GrupoSuperiorEsquerdo() {
  return (
    <div className="absolute -left-18.25 -top-18.75 h-121.25 w-127.75 origin-top-left scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-40.25 top-0 size-87.5 bg-menta`} />
      <span className={`${CIRCULO} left-12.5 top-58.75 size-52.5 bg-lima-suave/50`} />
      <span className={`${CIRCULO} left-0 top-3.5 size-75 bg-musgo/50`} />
    </div>
  );
}

function GrupoInferiorDireito() {
  return (
    <div className="absolute -bottom-21.25 -right-23 h-136.75 w-112.5 origin-bottom-right scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-25 top-0 size-87.5 bg-floresta/50`} />
      <span className={`${CIRCULO} left-0 top-65.75 size-62.5 bg-lima/50`} />
      <span className={`${CIRCULO} left-31.25 top-61.75 size-75 bg-white/70`} />
    </div>
  );
}

function GrupoPerfilEsquerdo() {
  return (
    <div className="absolute -bottom-21.25 -left-14.25 h-127.75 121.25 origin-bottom-left scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-0 top-0 size-87.5 bg-menta`} />
      <span className={`${CIRCULO} left-3.5 top-52.75 size-75 bg-musgo/50`} />
      <span className={`${CIRCULO} left-58.75 top-52.75 size-62.5 bg-lima-suave/50`} />
    </div>
  );
}

function GrupoPessoasEsquerdo() {
  return (
    <div className="absolute -left-18 top-109.25 h-121.5 w-112.5 origin-top-left scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-0 top-0 size-87.5 bg-floresta/50`} />
      <span className={`${CIRCULO} left-50 top-53.25 size-62.5 bg-lima/50`} />
      <span className={`${CIRCULO} left-6.25 top-46.5 size-75 bg-white/70`} />
    </div>
  );
}

const ROLAM_COM_A_PAGINA = ["pessoas"];

const VARIANTES = {
  entrada: [GrupoSuperiorEsquerdo, GrupoInferiorDireito],
  perfil: [GrupoPerfilEsquerdo, GrupoInferiorDireito],
  pessoas: [GrupoPessoasEsquerdo],
};

export default function CirculosDecorativos({ variante = "entrada" }) {
  const grupos = VARIANTES[variante] ?? VARIANTES.entrada;
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none inset-0 -z-10 overflow-hidden ${
        ROLAM_COM_A_PAGINA.includes(variante) ? "absolute" : "fixed"
      }`}
    >
      {grupos.map((Grupo, i) => (
        <Grupo key={i} />
      ))}
    </div>
  );
}