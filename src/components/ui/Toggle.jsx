import { useId } from "react";

const TONS = {
  floresta: "bg-floresta",
  musgo: "bg-musgo",
  lima: "bg-lima",
};

export default function Toggle({ rotulo, ativo, onAlternar, tom = "musgo" }) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="cursor-pointer text-[17px] font-medium leading-tight text-black">
        {rotulo}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ativo}
        onClick={() => onAlternar(!ativo)}
        className={`relative h-9 w-[65px] shrink-0 rounded-pilula transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta ${
          ativo ? (TONS[tom] ?? TONS.musgo) : "bg-apagado"
        }`}
      >
        <span
          className={`absolute top-1 size-7 rounded-full bg-white shadow transition-[left] ${
            ativo ? "left-[33px]" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}