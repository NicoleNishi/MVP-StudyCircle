import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import CampoTexto from "../components/ui/CampoTexto";
import { cadastrar } from "../services/auth";
import { validarCadastro } from "../utils/validacao";
import { FACULDADES } from "../data/faculdades";

export default function Cadastro() {
  const navigate = useNavigate();
  const [dados, setDados] = useState({ nome: "", email: "", senha: "", faculdade: "" });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState("");

  const atualizar = (campo) => (e) => {
    setDados((d) => ({ ...d, [campo]: e.target.value }));
    setErros((x) => ({ ...x, [campo]: undefined }));
  };

  async function enviar(e) {
    e.preventDefault();
    const novos = validarCadastro(dados);
    setErros(novos);
    setFalha("");
    if (Object.keys(novos).length) return;

    setEnviando(true);
    try {
      await cadastrar({
        nome: dados.nome.trim().replace(/\s+/g, " "),
        email: dados.email.trim(),
        senha: dados.senha,
        faculdade: dados.faculdade.trim(),
      });
      navigate("/perfil");
    } catch {
      setFalha("Não foi possível concluir o cadastro. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout titulo="Cadastro">
      <form onSubmit={enviar} noValidate className="flex flex-col">
        <div className="flex flex-col gap-5">
          <CampoTexto
            rotulo="Nome"
            name="nome"
            autoComplete="name"
            maxLength={80}
            placeholder="Digite seu nome"
            value={dados.nome}
            erro={erros.nome}
            onChange={atualizar("nome")}
          />
          <CampoTexto
            rotulo="E-mail"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Digite seu e-mail"
            value={dados.email}
            erro={erros.email}
            onChange={atualizar("email")}
          />
          <CampoTexto
            rotulo="Senha"
            type="password"
            name="senha"
            autoComplete="new-password"
            placeholder="Digite sua senha"
            value={dados.senha}
            erro={erros.senha}
            onChange={atualizar("senha")}
          />
          <CampoTexto
            rotulo="Faculdade"
            name="faculdade"
            list="lista-faculdades"
            autoComplete="off"
            placeholder="Busque sua faculdade"
            value={dados.faculdade}
            erro={erros.faculdade}
            onChange={atualizar("faculdade")}
          />
          <datalist id="lista-faculdades">
            {FACULDADES.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </div>

        {falha && (
          <p role="alert" className="mt-6 text-center text-sm font-medium text-erro">
            {falha}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-10 h-[49px] w-full rounded-pilula bg-floresta text-xl font-bold leading-6 text-white transition hover:bg-musgo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-floresta disabled:cursor-wait disabled:opacity-70"
        >
          {enviando ? "Cadastrando..." : "Cadastrar"}
        </button>

        <p className="mt-4 text-center text-[15px] font-medium leading-[18px] text-black">
          Já tem uma conta?{" "}
          <Link to="/" className="text-floresta underline-offset-2 hover:underline">
            Entre
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}