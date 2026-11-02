import avatarFeminino from "../assets/avatars/avatar-feminino.png";
import avatarMasculino from "../assets/avatars/avatar-masculino.png";

const IMAGENS = {
  feminino: avatarFeminino,
  masculino: avatarMasculino,
};

export const CORES_AVATAR = {
  floresta: "bg-floresta",
  musgo: "bg-musgo",
  lima: "bg-lima",
  "lima-suave": "bg-lima-suave",
  menta: "bg-menta",
};

export default function Avatar({ nome, foto, genero = "masculino", cor = "floresta", className = "size-21.5" }) {
  if (foto) {
    return <img src={foto} alt={`Foto de ${nome}`} className={`shrink-0 rounded-full object-cover ${className}`} />;
  }

  return (
    <div
      className={`grid shrink-0 place-items-center rounded-full ${CORES_AVATAR[cor] ?? CORES_AVATAR.floresta} ${className}`}
    >
      <img src={IMAGENS[genero] ?? IMAGENS.masculino} alt="" className="size-[58%]" />
    </div>
  );
}