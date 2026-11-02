// Colunas de cada tipo de grupo de botões.
const LAYOUTS = {
  auto: "grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2",
  dois: "grid grid-cols-2 gap-2",
  dias: "grid grid-cols-7 gap-1.5",
};

const BOTAO_BASE =
  "relative cursor-pointer rounded-md border-[1.5px] text-center text-xs text-[#143527] " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta";

/**
 * Grupo de botões de opção (seleção única ou múltipla, quem decide é o pai).
 * layout: "auto" (padrão), "dois" (duas colunas) ou "dias" (sete colunas compactas).
 */
export default function OptionButtons({ opcoes, selecionado, onAlternar, layout = "auto", rotulo }) {
  const compacto = layout === "dias";
  return (
    <div className={LAYOUTS[layout]} role="group" aria-label={rotulo}>
      {opcoes.map((o) => {
        const ativo = selecionado(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={ativo}
            onClick={() => onAlternar(o.id)}
            className={[
              BOTAO_BASE,
              compacto ? "px-0 py-2 max-[520px]:text-[11px]" : "px-2 py-2.5",
              ativo ? "border-floresta bg-[#eaf4ee] font-semibold" : "border-transparent bg-[#d6ebdd] font-medium",
            ].join(" ")}
          >
            {o.label}
            {ativo && (
              <span
                aria-hidden="true"
                className="absolute -right-1.5 -top-2 grid h-4 w-4 place-items-center rounded-full bg-floresta text-[10px] text-white"
              >
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
