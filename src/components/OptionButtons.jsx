/** Grupo de botões de opção. `selecionado(id)` diz se está marcado; `onAlternar(id)` trata o clique. */
export default function OptionButtons({ opcoes, selecionado, onAlternar, className = "opts", rotulo }) {
  return (
    <div className={className} role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button
          key={o.id}
          type="button"
          className="opt"
          aria-pressed={selecionado(o.id)}
          onClick={() => onAlternar(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
