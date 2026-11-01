import { useEffect } from "react";
import iconeCheck from "../../assets/icons/check.png";

export default function Toast({ mensagem, onFechar, duracao = 2500 }) {
  useEffect(() => {
    if (!mensagem) return;
    const timer = setTimeout(onFechar, duracao);
    return () => clearTimeout(timer);
  }, [mensagem, onFechar, duracao]);

  if (!mensagem) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-creme/40 p-4 backdrop-blur-sm" onClick={onFechar}>
      <div
        role="status"
        aria-live="polite"
        className="flex items-center gap-3 rounded-tag bg-lima px-4 py-4 text-xl font-semibold text-floresta shadow-lg"
      >
        <img src={iconeCheck} alt="" className="size-9" />
        <span className="pr-2">{mensagem}</span>
      </div>
    </div>
  );
}