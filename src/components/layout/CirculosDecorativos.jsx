const CIRCULO = "absolute rounded-full";

function GrupoSuperiorEsquerdo() {
  return (
    <div className="absolute -left-[73px] -top-[75px] h-[485px] w-[511px] origin-top-left scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-[161px] top-0 size-[350px] bg-menta`} />
      <span className={`${CIRCULO} left-[50px] top-[235px] size-[250px] bg-lima-suave/50`} />
      <span className={`${CIRCULO} left-0 top-[14px] size-[300px] bg-musgo/50`} />
    </div>
  );
}

function GrupoInferiorDireito() {
  return (
    <div className="absolute -bottom-[85px] -right-[92px] h-[547px] w-[450px] origin-bottom-right scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-[100px] top-0 size-[350px] bg-floresta/50`} />
      <span className={`${CIRCULO} left-0 top-[263px] size-[250px] bg-lima/50`} />
      <span className={`${CIRCULO} left-[125px] top-[247px] size-[300px] bg-white/70`} />
    </div>
  );
}

function GrupoPerfilEsquerdo() {
  return (
    <div className="absolute -bottom-[85px] -left-[57px] h-[511px] w-[485px] origin-bottom-left scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-0 top-0 size-[350px] bg-menta`} />
      <span className={`${CIRCULO} left-[14px] top-[211px] size-[300px] bg-musgo/50`} />
      <span className={`${CIRCULO} left-[235px] top-[211px] size-[250px] bg-lima-suave/50`} />
    </div>
  );
}

function GrupoPessoasEsquerdo() {
  return (
    <div className="absolute -left-[72px] top-[437px] h-[486px] w-[450px] origin-top-left scale-[0.55] md:scale-100">
      <span className={`${CIRCULO} left-0 top-0 size-[350px] bg-floresta/50`} />
      <span className={`${CIRCULO} left-[200px] top-[213px] size-[250px] bg-lima/50`} />
      <span className={`${CIRCULO} left-[25px] top-[186px] size-[300px] bg-white/70`} />
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