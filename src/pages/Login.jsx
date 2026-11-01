import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import CampoTexto from "../components/ui/CampoTexto";
import iconeGoogle from "../assets/icons/google.png";
import iconeApple from "../assets/icons/apple.png";
import iconeLinkedin from "../assets/icons/linkedin.png";
import { PROVEDORES, entrar, entrarComProvedor } from "../services/auth";
import { validarLogin } from "../utils/validacao";

const ICONES = {
  google: iconeGoogle,
  apple: iconeApple,
  linkedin: iconeLinkedin,
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState("");

  const limpaErro = (campo) => setErros((e) => ({ ...e, [campo]: undefined }));

  async function enviar(e) {
    e.preventDefault();
    const novos = validarLogin({ email, senha });
    setErros(novos);
    setFalha("");
    if (Object.keys(novos).length) return;

    setEnviando(true);
    try {
      await entrar({ email: email.trim(), senha, lembrar });
      navigate("/pessoas");
    } catch {
      setFalha("Não foi possível entrar. Confira seus dados e tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  async function entrarCom(provedor) {
    setFalha("");
    setEnviando(true);
    try {
      await entrarComProvedor(provedor);
      navigate("/pessoas");
    } catch {
      setFalha("Não foi possível entrar com essa conta agora.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Login">
      <form onSubmit={enviar} noValidate className="flex flex-col">
        <div className="flex flex-col gap-5">
          <CampoTexto
            rotulo="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
            value={email}
            erro={erros.email}
            onChange={(e) => {
              setEmail(e.target.value);
              limpaErro("email");
            }}
          />
          <CampoTexto
            rotulo="Senha"
            type="password"
            name="senha"
            autoComplete="current-password"
            placeholder="Digite sua senha"
            value={senha}
            erro={erros.senha}
            onChange={(e) => {
              setSenha(e.target.value);
              limpaErro("senha");
            }}
          />
        </div>

        <label className="mt-2.5 flex w-fit cursor-pointer items-center gap-1.5 text-[15px] font-medium leading-[18px] text-black">
          <input
            type="checkbox"
            checked={lembrar}
            onChange={(e) => setLembrar(e.target.checked)}
            className="size-3.5 cursor-pointer rounded-[5px] border-2 border-borda accent-floresta"
          />
          Lembre-me
        </label>

        <fieldset className="mt-8 flex flex-col items-center">
          <legend className="mb-2 w-full text-center text-xl font-medium leading-6 text-black">Ou entre com:</legend>
          <div className="flex justify-center gap-3">
            {PROVEDORES.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={enviando}
                onClick={() => entrarCom(p.id)}
                className="group flex w-[62px] flex-col items-center gap-3 rounded-tag focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-floresta disabled:opacity-60"
              >
                <span className="grid size-[45px] place-items-center rounded-pilula bg-floresta transition group-hover:bg-musgo">
                  <img src={ICONES[p.id]} alt="" className="size-[25px]" />
                </span>
                <span className="text-[15px] font-medium leading-[18px] text-black">{p.nome}</span>
              </button>
            ))}
          </div>
        </fieldset>

        {falha && (
          <p role="alert" className="mt-6 text-center text-sm font-medium text-erro">
            {falha}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-8 h-[49px] w-full rounded-pilula bg-floresta text-xl font-bold leading-6 text-white transition hover:bg-musgo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta disabled:cursor-wait disabled:opacity-70"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-4 text-center text-[15px] font-medium leading-[18px] text-black">
          Não tem conta ainda?{" "}
          <Link to="/cadastro" className="text-floresta underline-offset-2 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}