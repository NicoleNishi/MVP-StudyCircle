import { useLocation, useNavigate } from "react-router-dom";
import iconeVoltar from "../../assets/icons/voltar.png";

export default function BotaoVoltar({ fallback = "/pessoas", className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  function voltar() {
    if (location.key === "default") navigate(fallback);
    else navigate(-1);
  }

  return (
    <button
      type="button"
      onClick={voltar}
      aria-label="Voltar"
      className={`grid size-12.5 shrink-0 place-items-center rounded-full bg-white shadow-sm transition hover:bg-chip focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta ${className}`}
    >
      <img src={iconeVoltar} alt="" className="size-8.5" />
    </button>
  );
}