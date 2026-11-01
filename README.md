# studycircle

Formulário em React (Vite) em que o aluno informa nome, disciplinas, disponibilidade semanal, foco dos encontros e preferência de integrantes. Ao clicar em **Salvar e encontrar matches**, o perfil é salvo em `perfis-de-estudos/<nome-do-aluno>.json`, pasta lida pelo algoritmo de matching.

## Como rodar

```bash
npm install
npm run dev      # servidor de desenvolvimento (http://localhost:5173)
npm run build    # gera a versão final na pasta dist
npm run preview  # testa a versão final localmente
```

> O salvamento na pasta funciona com `npm run dev` e `npm run preview`, porque quem grava o arquivo é o servidor do Vite (`server/perfis.js`). Em um site publicado será preciso um backend que receba `POST /api/perfis`.

## Perfis salvos

- Um arquivo por aluno, nomeado a partir do nome (`Maria da Silva` → `maria-da-silva.json`).
- Enviar o formulário de novo com o mesmo nome **atualiza** o arquivo daquela pessoa.
- A pasta está no `.gitignore` porque contém nomes de alunos. Remova a linha se quiser versionar os perfis.

## Rotas (react-router-dom)

| Rota | Página |
| --- | --- |
| `/` | Login |
| `/cadastro` | Cadastro |
| `/perfil` | Formulário de perfil de estudos |
| `/pessoas` | Matches (cards de afinidade + filtros) |
| `/mapa` | Locais de estudo (área reservada para o heatmap da EACH) |

## Estrutura

- `src/App.jsx`: mapa de rotas
- `src/index.css`: Tailwind CSS v4 + tokens do Figma no bloco `@theme` (cores, raios, fonte Inter)
- `src/pages/`: uma página por rota (`Perfil.jsx` contém o estado, a validação e o envio do formulário)
- `src/components/`: `MatchCard`, `Avatar`, componentes do formulário de perfil e as pastas `layout/`, `ui/`, `auth/`, `mapa/`
- `src/styles/perfil.css`: estilos internos do formulário de perfil, escopados em `.perfil-form`
- `src/services/auth.js`: ponto de integração com a autenticação (hoje simulado)
- `src/data/`: disciplinas, faculdades, matches e locais de estudo de exemplo
- `src/utils/`: busca de disciplinas, formato do JSON, envio ao servidor, validações
- `server/perfis.js`: grava os arquivos na pasta `perfis-de-estudos/`

## Publicar na Vercel

1. Quem é dono do repositório no GitHub entra em vercel.com com a conta do GitHub (plano Hobby, gratuito).
2. **Add New → Project**, escolhe o repositório e clica em **Deploy**. A Vercel detecta o Vite sozinha (build `npm run build`, pasta `dist`).
3. A cada `git push` na branch principal o site é atualizado.

O `vercel.json` faz todas as rotas (`/pessoas`, `/mapa`...) abrirem o `index.html`, para que recarregar a página não dê 404.

No site publicado não existe o servidor que grava em `perfis-de-estudos/`: ao clicar em **Salvar e encontrar matches**, o perfil é **baixado** como `<nome-do-aluno>.json`, no mesmo formato, para ser enviado à equipe e colocado na pasta manualmente.

## Formato do JSON

```json
{
  "versao": 1,
  "enviadoEm": "2026-10-30T21:41:06.972Z",
  "nome": "Maria da Silva",
  "disciplinas": ["Cálculo II"],
  "disponibilidade": [{ "dia": "ter", "inicio": "14:00", "fim": "16:00" }],
  "focos": ["resolver_lista"],
  "preferencias": { "definida": true, "grupo": "misto", "aceitaOutroSemestre": true },
  "id": "maria-da-silva"
}
```

- `dia`: `seg`, `ter`, `qua`, `qui`, `sex`, `sab`, `dom`
- `focos`: `ensinar`, `aprender_escutando`, `tirar_duvidas`, `resolver_lista`, `fazer_revisao`
- `grupo`: `misto`, `somente_homens`, `somente_mulheres` ou `qualquer` (quando o aluno não define preferência)
- `id`: acrescentado pelo servidor ao salvar; é o nome do arquivo sem `.json`