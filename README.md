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

## Formato do JSON

```json
{
  _id: ObjectId('6aeb19e331025321cd2111c2'),
  versao: NumberInt('2'),
  enviadoEm: '2026-11-04T11:41:21.140Z',
  nome: 'Laura Gimenez',
  genero: 'mulher_cis',
  cursos: [
    'Educação Física e Saúde'
  ],
  semestre: NumberInt('2'),
  disciplinas: [
    'Análise, Projeto e Interface Humano-Computador'
  ],
  disponibilidade: [
    {
      dia: 'ter',
      inicio: '14:00',
      fim: '16:00'
    },
    {
      dia: 'qua',
      inicio: '14:00',
      fim: '16:00'
    },
    {
      dia: 'qui',
      inicio: '14:00',
      fim: '16:00'
    }
  ],
  focos: [
    'aprender_escutando',
    'tirar_duvidas'
  ],
  preferencias: {
    grupo: 'misto',
    aceitaOutroSemestre: true,
    aceitaOutroCurso: true
  },
  id: 'laura-gimenez',
  createdAt: ISODate('2026-11-04T11:41:23.519Z')
}
```

- `dia`: `seg`, `ter`, `qua`, `qui`, `sex`, `sab`, `dom`
- `focos`: `ensinar`, `aprender_escutando`, `tirar_duvidas`, `resolver_lista`, `fazer_revisao`
- `grupo`: `misto`, `somente_homens`, `somente_mulheres` ou `qualquer` (quando o aluno não define preferência)
- `id`: acrescentado pelo servidor ao salvar; é o nome do arquivo sem `.json`

# Algoritmo de combinação (matching)

O `matching.py` recebe um aluno "alvo", lê os perfis dos demais estudantes, aplica os filtros de compatibilidade, calcula a afinidade de cada combinação e grava um JSON com os resultados que o site deve exibir.

## Requisitos

- Python 3.8 ou superior (`python --version`; no Windows, `py --version`).
- Nenhuma biblioteca externa: o script usa só a biblioteca padrão, então não há `requirements.txt` nem `pip install`.

## Como rodar

Na raiz do projeto (`MVP-StudyCircle`):

```bash
python matching.py <id-do-aluno-alvo>
```

Exemplo:

```bash
python matching.py denilson-santos-de-jesus
```

Saída esperada no terminal:

```
1 combinação(ões) gravada(s) em .../src/data/matches-denilson-santos-de-jesus.json
```

### Argumentos de linha de comando

| Argumento | Obrigatório | Descrição |
|---|---|---|
| `aluno_id` | sim | `id` do aluno alvo. |
| `--raiz CAMINHO` | não | Pasta raiz do projeto. Padrão: a pasta onde está o `matching.py`. |
| `--min-minutos N` | não | Disponibilidade mínima em comum, em minutos. Sobrescreve o valor padrão. |

Exemplos:

```bash
# Exigir pelo menos 90 minutos em comum
python matching.py denilson-santos-de-jesus --min-minutos 90

# Rodar de outra pasta, apontando para a raiz do projeto
python matching.py denilson-santos-de-jesus --raiz "C:\projetos\MVP-StudyCircle"
```

Para rodar via `npm`, adicione em `scripts` no `package.json`:

```json
"matching": "python matching.py"
```

E use `npm run matching -- denilson-santos-de-jesus`. Se o comando `python` não existir no seu terminal, troque por `py` ou `python3`.

## Formato dos arquivos

### Saída (`src/data/matches-<id>.json`)

Lista ordenada da maior para a menor afinidade (empates em ordem alfabética):

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
- Se não houver nenhuma combinação, o arquivo contém `[]`.

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

### Pastas

| Constante | Padrão | Descrição |
|---|---|---|
| `PASTA_PERFIS` | `perfis-de-estudos` | Pasta dos perfis, relativa à raiz. |
| `PASTA_SAIDA` | `src/data` | Pasta de saída, relativa à raiz. |

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
| `Aluno '...' não encontrado` | O `id` não existe em `perfis-de-estudos`. Confira o campo `id` do perfil ou o nome do arquivo. |
| `[aviso] ignorando <arquivo>` | JSON inválido ou ilegível. Corrija o arquivo. |
| `[aviso] preferência de grupo desconhecida` | Valor de `grupo` sem mapeamento em `GRUPO_PARA_GENERO`. |
| Saída com `[]` | Nenhum candidato passou nos filtros. Teste reduzindo `--min-minutos`. |