# studycircle · Formulário de Perfil de Estudos

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

## Estrutura

- `src/App.jsx`: estado do formulário, validação e envio
- `src/components/`: campo de disciplinas, grade semanal, modal de horários, botões de opção
- `src/data/disciplinas.js`: lista oficial de disciplinas (editar aqui para incluir ou renomear)
- `src/utils/exportar.js`: formato do JSON; `src/utils/salvar.js`: envio ao servidor
- `src/utils/busca.js`: busca que trata variações como "cálculo 2" = "Cálculo II"
- `server/perfis.js`: grava os arquivos na pasta `perfis-de-estudos/`

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
