# studycircle

Site em React (Vite + Tailwind) que conecta estudantes da EACH USP em grupos de estudo. O aluno preenche o perfil (curso, semestre, disciplinas, horários, foco e preferências), o perfil é salvo no MongoDB Atlas e o algoritmo de combinação (`matching.py`) calcula as pessoas compatíveis, exibidas na tela de Pessoas.

## Como funciona

```
Formulário (/perfil)
  └─ POST /api/salvar-aluno  (api/salvar-aluno.js)  → grava/atualiza o aluno na collection `alunos`
Tela de Pessoas (/pessoas)
  └─ GET /api/matches?id=…   (api/matches.py)       → roda o matching.py, grava em `matches` e devolve a lista
```

- O `id` do aluno é o nome em formato slug (`Maria da Silva` → `maria-da-silva`). Enviar o formulário de novo com o mesmo nome **atualiza** o perfil.
- Enquanto não há login de verdade, o site guarda no navegador o `id` de quem salvou o perfil (`src/utils/sessao.js`) para saber de quem mostrar os matches. O Logout apaga essa informação.
- O algoritmo roda de novo toda vez que a tela de Pessoas abre, então novos perfis aparecem sem nenhum passo manual. Ele também pode ser rodado pelo terminal (veja abaixo).

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `MONGODB_URI` | sim | String de conexão do MongoDB Atlas. |
| `MONGODB_DB` | não | Nome do banco. Padrão: `estudos_db`. A API e o `matching.py` usam o mesmo valor. |

- **Na Vercel:** Settings → Environment Variables (marcar Production e Preview) e fazer **Redeploy**.
- **No computador:** num arquivo `.env.local` (para o `vercel dev`) e/ou `.env` (para rodar o `matching.py` pelo terminal). Os dois estão no `.gitignore`: nunca suba a senha do banco para o GitHub.
- **No MongoDB Atlas:** em Network Access, libere `0.0.0.0/0`. As funções da Vercel não têm IP fixo.

## Como rodar

```bash
npm install
npm i -g vercel        # uma vez só
vercel dev             # site + funções da pasta api/ (http://localhost:3000)
```

> `npm run dev` roda **só o site**: as rotas `/api/*` não existem nele, então salvar o perfil e ver os matches não funcionam. Para testar o fluxo completo no computador, use `vercel dev`.

```bash
npm run build    # gera a versão final na pasta dist
```

## Publicar na Vercel

A Vercel publica sozinha a cada `git push` na branch principal. O `vercel.json` faz todas as rotas do site (`/pessoas`, `/mapa`...) abrirem o `index.html`, exceto `/api/*`. As dependências do Node vêm do `package.json` (`mongodb`) e as do Python do `requirements.txt` (`pymongo`).

## Rotas do site (react-router-dom)

| Rota | Página |
| --- | --- |
| `/` | Login (ainda simulado) |
| `/cadastro` | Cadastro (ainda simulado) |
| `/perfil` | Formulário de perfil de estudos |
| `/pessoas` | Matches calculados pelo algoritmo + filtros + convite |
| `/mapa` | Heatmap de conexão da EACH (app do Streamlit embutido) |

## Estrutura

- `api/salvar-aluno.js`: grava ou atualiza o perfil no MongoDB
- `api/matches.py`: roda o `matching.py` para um aluno e devolve os matches
- `matching.py`: algoritmo de combinação (também roda pelo terminal)
- `src/App.jsx`: mapa de rotas
- `src/index.css`: Tailwind CSS v4 + tokens do Figma no bloco `@theme` (cores, raios, fonte Inter)
- `src/pages/`: uma página por rota
- `src/components/`: `MatchCard`, `ConviteModal`, `Avatar`, componentes do formulário e as pastas `layout/`, `ui/`, `auth/`
- `src/services/api.js`: chamadas às rotas `/api/*`; `src/services/auth.js`: login simulado
- `src/data/`: listas de cursos, disciplinas, faculdades e locais de estudo
- `src/utils/`: busca de cursos e disciplinas, formato do JSON (`exportar.js`), sessão do aluno, preparo dos matches para a tela, validações

## Formato do perfil (collection `alunos`)

```json
{
  "versao": 2,
  "enviadoEm": "2026-11-04T11:41:21.140Z",
  "nome": "Laura Gimenez",
  "genero": "mulher_cis",
  "cursos": ["Educação Física e Saúde"],
  "semestre": 2,
  "disciplinas": ["Análise, Projeto e Interface Humano-Computador"],
  "disponibilidade": [
    { "dia": "ter", "inicio": "14:00", "fim": "16:00" },
    { "dia": "qua", "inicio": "14:00", "fim": "16:00" }
  ],
  "focos": ["aprender_escutando", "tirar_duvidas"],
  "preferencias": {
    "grupo": "misto",
    "aceitaOutroSemestre": true,
    "aceitaOutroCurso": true
  },
  "id": "laura-gimenez",
  "createdAt": "2026-11-04T11:41:23.519Z",
  "updatedAt": "2026-11-04T11:41:23.519Z"
}
```

- `genero`: `mulher_cis`, `homem_cis`, `mulher_trans`, `homem_trans`
- `dia`: `seg`, `ter`, `qua`, `qui`, `sex`, `sab`, `dom`
- `focos`: `ensinar`, `aprender_escutando`, `tirar_duvidas`, `resolver_lista`, `fazer_revisao`
- `grupo`: `misto`, `somente_mulheres_cis`, `somente_homens_cis`, `somente_mulheres_trans`, `somente_homens_trans`
- `id`, `createdAt` e `updatedAt` são acrescentados pela API ao salvar (no banco as datas ficam como `Date`).

# Algoritmo de combinação (matching)

O `matching.py` recebe um aluno "alvo", lê os perfis dos demais estudantes na collection `alunos`, aplica os filtros de compatibilidade, calcula a afinidade de cada combinação e grava o resultado na collection `matches` (um documento por aluno, com `_id` = id do aluno). No site, quem chama o algoritmo é a função `api/matches.py`; pelo terminal ele roda do mesmo jeito.

## Requisitos

- Python 3.8 ou superior (`python --version`; no Windows, `py --version`).
- Dependências do `requirements.txt` (`pymongo` e `python-dotenv`): `pip install -r requirements.txt`.
- A variável `MONGODB_URI` (e, se usar outro banco, `MONGODB_DB`) num arquivo `.env` na raiz do projeto.

## Como rodar

Na raiz do projeto (`MVP-StudyCircle`):

```bash
python matching.py <id-do-aluno-alvo>
```

Exemplo:

```bash
python matching.py denilson-santos-de-jesus
```

Para comparar o perfil salvo mais recentemente com os demais:

```bash
python matching.py --ultimo
```

Saída esperada no terminal:

```
1 combinação(ões) collection 'matches'
```

### Argumentos de linha de comando

| Argumento | Obrigatório | Descrição |
|---|---|---|
| `aluno_id` | sim, se não usar `--ultimo` | `id` do aluno alvo. |
| `--ultimo` | não | Usa como alvo o perfil salvo mais recentemente. |
| `--min-minutos N` | não | Disponibilidade mínima em comum, em minutos. Sobrescreve o valor padrão. |
| `--nao-gravar` | não | Só calcula e mostra o total, sem gravar em `matches`. |

Exemplos:

```bash
# Exigir pelo menos 90 minutos em comum
python matching.py denilson-santos-de-jesus --min-minutos 90
```

Para rodar via `npm`, adicione em `scripts` no `package.json`:

```json
"matching": "python matching.py"
```

E use `npm run matching -- denilson-santos-de-jesus`. Se o comando `python` não existir no seu terminal, troque por `py` ou `python3`.

## Formato do resultado

O documento gravado em `matches` (e a resposta de `GET /api/matches?id=…`) traz a lista `matches`, ordenada da maior para a menor afinidade (empates em ordem alfabética):

```json
[
  {
    "id": "joaozinho-123",
    "nome": "Joãozinho",
    "semestre": 4,
    "curso": "Sistemas de Informação",
    "materiasEmComum": ["Algoritmos e Estruturas de Dados I", "Cálculo I"],
    "horariosEmComum": ["Segunda 14h-16h"],
    "afinidade": 58,
    "genero": "homem_cis"
  }
]
```

- `nome` contém apenas o primeiro nome.
- `horariosEmComum` lista só os intervalos contínuos que atingem o mínimo configurado.
- Se não houver nenhuma combinação, a lista vem vazia (`[]`).

## Regras de combinação

Um candidato só aparece na saída se passar por **todos** os filtros abaixo.

**Filtros duros**

1. Ter ao menos uma disciplina em comum com o alvo.
2. Ter ao menos um intervalo contínuo de disponibilidade em comum com duração igual ou maior que `MIN_MINUTOS_EM_COMUM` (padrão: 60 minutos). Dois blocos de 30 minutos não somam 60.

**Filtros de preferência** (só aplicados quando definidos)

| Preferência | Efeito |
|---|---|
| `grupo` = `misto` | Não filtra. |
| `grupo` = `somente_<grupo>` | Só combina com candidatos do gênero correspondente. |
| `aceitaOutroSemestre` = `false` | Só combina com candidatos do mesmo semestre. |
| `aceitaOutroCurso` = `false` | Só combina com candidatos do mesmo curso. |

Com `APLICAR_PREFERENCIAS_DO_CANDIDATO = True`, as preferências do candidato também são checadas em relação ao alvo (combinação mútua). Com `False`, só valem as preferências do alvo.

## Cálculo da afinidade

Cada componente vale de 0 a 1, é multiplicado pelo seu peso, e o total é normalizado para uma porcentagem de 0 a 100:

| Componente | Cálculo | Peso (constante) |
|---|---|---|
| Disciplinas | matérias em comum ÷ matérias do alvo | `PESO_DISCIPLINAS` (35) |
| Minutos em comum | total de minutos em comum ÷ `MINUTOS_PARA_PONTUACAO_MAXIMA` (máx. 1) | `PESO_MINUTOS` (25) |
| Focos | fração dos focos do alvo com algum foco compatível no candidato | `PESO_FOCOS` (20) |
| Curso | 1 se compartilham curso, senão 0 | `PESO_CURSO` (10) |
| Semestre | 1 se for o mesmo semestre, senão 0 | `PESO_SEMESTRE` (10) |

Fórmula: `afinidade = round(100 × Σ(peso × componente) ÷ Σ(pesos))`. Como o resultado é normalizado, só a **proporção** entre os pesos importa: eles não precisam somar 100.

## Parâmetros configuráveis

Todos ficam na seção `CONFIGURAÇÃO` no topo do `matching.py`. Nada fora dela precisa ser alterado.

### Banco de dados

| Constante | Padrão | Descrição |
|---|---|---|
| `NOME_BANCO_PADRAO` | `MONGODB_DB` ou `estudos_db` | Banco onde estão as collections. |
| `COLECAO_PERFIS` | `alunos` | Perfis salvos pelo site. |
| `COLECAO_MATCHES` | `matches` | Resultados do algoritmo. |

Se o mesmo aluno aparecer mais de uma vez em `alunos` (envios antigos repetidos), o algoritmo usa o perfil mais recente.

### Filtros

| Constante | Padrão | Descrição |
|---|---|---|
| `MIN_MINUTOS_EM_COMUM` | `60` | Duração mínima (em minutos) de um intervalo em comum. |
| `APLICAR_PREFERENCIAS_DO_CANDIDATO` | `True` | Liga ou desliga a combinação mútua de preferências. |

O valor de `MIN_MINUTOS_EM_COMUM` pode ser alterado sem editar o código. A ordem de prioridade é:

1. argumento `--min-minutos`;
2. variável de ambiente `STUDYCIRCLE_MIN_MINUTOS`;
3. constante `MIN_MINUTOS_EM_COMUM`.

```bash
# Linux / macOS
STUDYCIRCLE_MIN_MINUTOS=90 python matching.py denilson-santos-de-jesus

# Windows (PowerShell)
$env:STUDYCIRCLE_MIN_MINUTOS = 90
python matching.py denilson-santos-de-jesus
```

### Pesos da afinidade

| Constante | Padrão |
|---|---|
| `PESO_DISCIPLINAS` | `35` |
| `PESO_MINUTOS` | `25` |
| `PESO_FOCOS` | `20` |
| `PESO_CURSO` | `10` |
| `PESO_SEMESTRE` | `10` |
| `MINUTOS_PARA_PONTUACAO_MAXIMA` | `240` |

`MINUTOS_PARA_PONTUACAO_MAXIMA` define a partir de quantos minutos em comum o componente de disponibilidade atinge a nota máxima.

### Composição de grupo

| Constante | Descrição |
|---|---|
| `GRUPO_PARA_GENERO` | Associa o grupo (`mulheres_cis`, `homens_cis`, `mulheres_trans`, `homens_trans`) ao gênero exigido (`mulher_cis`, `homem_cis`, etc.). |
| `GRUPOS_MISTOS` | Valores de `grupo` que não filtram nada (`misto`, vazio, ausente). |
| `PREFIXOS_GRUPO` | Prefixos aceitos antes do nome do grupo (`somente_`, `so_`). |

Se um perfil trouxer um valor de `grupo` que não esteja mapeado, o script **não combina** esse perfil e imprime um aviso no terminal. Para suportar um novo valor, inclua-o em `GRUPO_PARA_GENERO`.

### Compatibilidade de focos

`FOCOS_COMPATIVEIS` é o conjunto de pares de focos compatíveis (a ordem não importa). Qualquer par que não esteja na lista é tratado como incompatível.

| | Ensinar | Aprender escutando | Tirar dúvidas | Resolver lista | Fazer revisão |
|---|:-:|:-:|:-:|:-:|:-:|
| **Ensinar** | N | S | S | N | S |
| **Aprender escutando** | S | N | N | N | S |
| **Tirar dúvidas** | S | N | N | N | S |
| **Resolver lista** | N | N | N | S | N |
| **Fazer revisão** | S | S | S | N | S |

Para alterar uma regra, adicione ou remova o par correspondente em `FOCOS_COMPATIVEIS`.

### Apresentação

| Constante | Descrição |
|---|---|
| `NOMES_DIAS` | Como cada dia aparece em `horariosEmComum` (por exemplo, `seg` → `Segunda`). A ordem define a ordenação dos horários. |

## Solução de problemas

| Mensagem ou sintoma | Causa provável |
|---|---|
| `Aluno '...' não encontrado` | O `id` não existe na collection `alunos` do banco configurado. Confira o campo `id` e se `MONGODB_DB` aponta para o mesmo banco do site. |
| `Defina a variável de ambiente MONGODB_URI` | Falta o `.env` na raiz (terminal) ou a variável na Vercel. |
| Timeout ao conectar | O IP não está liberado em Network Access no Atlas. |
| `[aviso] preferência de grupo desconhecida` | Valor de `grupo` sem mapeamento em `GRUPO_PARA_GENERO`. |
| Lista de matches vazia | Nenhum candidato passou nos filtros. Teste reduzindo `--min-minutos`. |