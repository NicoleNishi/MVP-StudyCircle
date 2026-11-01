import { Link } from "react-router-dom";
import logo from "../../assets/logo-studycircle.png";

export default function Logo({ para, className = "" }) {
  const imagem = <img src={logo} alt="studycircle" width={199} height={45} className="h-8 w-auto sm:h-[45px]" />;

  if (!para) return <span className={`inline-flex ${className}`}>{imagem}</span>;

  return (
    <Link
      to={para}
      className={`inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-floresta ${className}`}
    >
      {imagem}
    </Link>
  );
}