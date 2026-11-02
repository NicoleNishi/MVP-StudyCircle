import { useId } from "react";

export default function CampoTexto({ rotulo, erro, id, className = "", ...props }) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idErro = `${idCampo}-erro`;

  return (
    <div className={`flex flex-col gap-0.75 ${className}`}>
      <label htmlFor={idCampo} className="text-xl font-medium leading-6 text-black">
        {rotulo}
      </label>
      <input
        id={idCampo}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? idErro : undefined}
        className={`h-8.75 w-full rounded-campo border-2 bg-white px-3 text-[15px] font-medium leading-4.5 text-black outline-none transition placeholder:text-apagado focus:border-floresta ${
          erro ? "border-erro" : "border-borda"
        }`}
        {...props}
      />
      {erro && (
        <p id={idErro} className="text-[13px] font-medium text-erro">
          {erro}
        </p>
      )}
    </div>
  );
}