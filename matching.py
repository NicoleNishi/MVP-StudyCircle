#!/usr/bin/env python3
"""
StudyCircle - algoritmo de combinação de estudantes

Uso (linha de comando):
    python matching.py <id-do-aluno-alvo> [--min-minutos N] [--nao-gravar]

Exemplo:
    python matching.py denilson-santos-de-jesus

Variáveis de ambiente:
    MONGODB_URI   (obrigatória)  string de conexão do Atlas (pode vir de um arquivo .env)
    STUDYCIRCLE_MIN_MINUTOS (opcional) sobrescreve MIN_MINUTOS_EM_COMUM

Lê os perfis da collection  `alunos`
Grava o resultado na collection `matches` (um documento por aluno, _id = id do aluno).
"""

from __future__ import annotations

import argparse
import os
import sys
import unicodedata
from datetime import datetime, timezone

from pymongo import MongoClient

try:  # carrega o arquivo .env em desenvolvimento local (na Vercel as variáveis já existem)
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

# ============================================================================
# CONFIGURAÇÃO  (altere aqui; nada além desta seção precisa mudar)
# ============================================================================

# --- MongoDB ---------------------------------------------------------------
NOME_BANCO_PADRAO = "studycircle"
COLECAO_PERFIS = "alunos"
COLECAO_MATCHES = "matches"

# --- Filtros duros ---------------------------------------------------------
# Tempo mínimo (minutos) de um intervalo de disponibilidade em comum.
MIN_MINUTOS_EM_COMUM = 60

# Se True, as preferências do candidato (grupo/semestre/curso) também são
# checadas em relação ao aluno alvo (combinação mútua).
APLICAR_PREFERENCIAS_DO_CANDIDATO = True

# --- Pesos do cálculo de afinidade ----------------------------------------
# Só a proporção entre eles importa (o resultado é normalizado para 0-100).
PESO_DISCIPLINAS = 35
PESO_MINUTOS = 25
PESO_FOCOS = 20
PESO_CURSO = 10
PESO_SEMESTRE = 10

# Minutos em comum a partir dos quais a pontuação de disponibilidade é máxima.
MINUTOS_PARA_PONTUACAO_MAXIMA = 240

# --- Gênero / composição de grupo -----------------------------------------
GRUPO_PARA_GENERO = {
    "mulheres_cis": "mulher_cis",
    "homens_cis": "homem_cis",
    "mulheres_trans": "mulher_trans",
    "homens_trans": "homem_trans",
}
GRUPOS_MISTOS = {"misto", "", None}
PREFIXOS_GRUPO = ("somente_", "so_")

# --- Tabela de compatibilidade de focos -----------------------------------
FOCOS_COMPATIVEIS = {
    frozenset(("ensinar", "aprender_escutando")),
    frozenset(("ensinar", "tirar_duvidas")),
    frozenset(("ensinar", "fazer_revisao")),
    frozenset(("aprender_escutando", "fazer_revisao")),
    frozenset(("tirar_duvidas", "fazer_revisao")),
    frozenset(("resolver_lista",)),
    frozenset(("fazer_revisao",)),
}

# --- Apresentação ----------------------------------------------------------
NOMES_DIAS = {
    "seg": "Segunda", "ter": "Terça", "qua": "Quarta", "qui": "Quinta",
    "sex": "Sexta", "sab": "Sábado", "dom": "Domingo",
}
ORDEM_DIAS = list(NOMES_DIAS)

# ============================================================================
# MONGODB
# ============================================================================

# O cliente fica em variável global para ser reaproveitado entre invocações
# "quentes" de uma função serverless (Vercel) em vez de reconectar toda vez.
_CLIENTE: MongoClient | None = None


def obter_banco():
    global _CLIENTE
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        raise RuntimeError("Defina a variável de ambiente MONGODB_URI.")
    if _CLIENTE is None:
        _CLIENTE = MongoClient(uri, serverSelectionTimeoutMS=5000)
    return _CLIENTE[NOME_BANCO_PADRAO]


def carregar_perfis(db) -> dict[str, dict]:
    """Lê todos os documentos da collection de perfis, indexados por id."""
    perfis = {}
    for doc in db[COLECAO_PERFIS].find({}):
        _id = doc.pop("_id", None)
        doc["id"] = str(doc.get("id") or _id)
        perfis[doc["id"]] = doc
    return perfis


def salvar_matches(db, aluno_id: str, matches: list[dict]) -> None:
    """Grava (ou substitui) o resultado do aluno na collection de matches."""
    db[COLECAO_MATCHES].replace_one(
        {"_id": aluno_id},
        {
            "_id": aluno_id,
            "alunoId": aluno_id,
            "geradoEm": datetime.now(timezone.utc),
            "total": len(matches),
            "matches": matches,
        },
        upsert=True,
    )


# ============================================================================
# FUNÇÕES AUXILIARES
# ============================================================================


def normalizar(texto) -> str:
    """Minúsculas, sem acentos e sem espaços nas pontas (para comparações)."""
    if texto is None:
        return ""
    s = unicodedata.normalize("NFKD", str(texto))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.strip().casefold()


def hora_para_minutos(hhmm: str) -> int:
    h, m = hhmm.split(":")
    return int(h) * 60 + int(m)


def minutos_para_texto(total: int) -> str:
    h, m = divmod(total, 60)
    return f"{h}h" if m == 0 else f"{h}h{m:02d}"


def primeiro_nome(nome_completo) -> str:
    partes = str(nome_completo or "").split()
    return partes[0] if partes else ""


# ----------------------------- disponibilidade -----------------------------


def intervalos_por_dia(perfil: dict) -> dict[str, list[tuple[int, int]]]:
    """Agrupa e funde os intervalos de disponibilidade por dia."""
    por_dia: dict[str, list[tuple[int, int]]] = {}
    for d in perfil.get("disponibilidade", []):
        ini, fim = hora_para_minutos(d["inicio"]), hora_para_minutos(d["fim"])
        if fim > ini:
            por_dia.setdefault(d["dia"], []).append((ini, fim))
    for dia, lista in por_dia.items():
        lista.sort()
        fundidos = [lista[0]]
        for ini, fim in lista[1:]:
            if ini <= fundidos[-1][1]:
                fundidos[-1] = (fundidos[-1][0], max(fundidos[-1][1], fim))
            else:
                fundidos.append((ini, fim))
        por_dia[dia] = fundidos
    return por_dia


def disponibilidade_em_comum(a: dict, b: dict, minimo: int) -> list[tuple[str, int, int]]:
    """Interseção da disponibilidade, só intervalos contínuos >= `minimo`."""
    da, db = intervalos_por_dia(a), intervalos_por_dia(b)
    comuns = []
    for dia in da.keys() & db.keys():
        for ia, fa in da[dia]:
            for ib, fb in db[dia]:
                ini, fim = max(ia, ib), min(fa, fb)
                if fim - ini >= minimo:
                    comuns.append((dia, ini, fim))
    ordem = {d: i for i, d in enumerate(ORDEM_DIAS)}
    comuns.sort(key=lambda x: (ordem.get(x[0], 99), x[1]))
    return comuns


# --------------------------------- filtros ---------------------------------


_AVISADOS: set = set()


def genero_permitido(preferencia_grupo, genero_candidato) -> bool:
    pref = normalizar(preferencia_grupo)
    for prefixo in PREFIXOS_GRUPO:
        if pref.startswith(prefixo):
            pref = pref[len(prefixo):]
            break
    if pref in GRUPOS_MISTOS:
        return True
    exigido = GRUPO_PARA_GENERO.get(pref)
    if exigido is None:
        if preferencia_grupo not in _AVISADOS:
            _AVISADOS.add(preferencia_grupo)
            print(f"[aviso] preferência de grupo desconhecida: {preferencia_grupo!r}; "
                  "ajuste GRUPO_PARA_GENERO", file=sys.stderr)
        return False
    return normalizar(genero_candidato) == exigido


def passa_preferencias(dono: dict, outro: dict) -> bool:
    """Checa as preferências de `dono` contra o perfil de `outro`."""
    pref = dono.get("preferencias", {}) or {}
    if not genero_permitido(pref.get("grupo"), outro.get("genero")):
        return False
    if pref.get("aceitaOutroSemestre") is False and dono.get("semestre") != outro.get("semestre"):
        return False
    if pref.get("aceitaOutroCurso") is False:
        if {normalizar(c) for c in dono.get("cursos", [])}.isdisjoint(
            {normalizar(c) for c in outro.get("cursos", [])}
        ):
            return False
    return True


def disciplinas_em_comum(alvo: dict, outro: dict) -> list[str]:
    nomes_outro = {normalizar(d) for d in outro.get("disciplinas", [])}
    return [d for d in alvo.get("disciplinas", []) if normalizar(d) in nomes_outro]


# -------------------------------- afinidade --------------------------------


def pontuacao_focos(alvo: dict, outro: dict) -> float:
    """Fração dos focos do alvo que têm ao menos um foco compatível no outro."""
    fa, fb = alvo.get("focos", []), outro.get("focos", [])
    if not fa or not fb:
        return 0.0
    compativeis = sum(
        1 for x in fa if any(frozenset((x, y)) in FOCOS_COMPATIVEIS for y in fb)
    )
    return compativeis / len(fa)


def calcular_afinidade(alvo: dict, outro: dict, materias: list[str], minutos: int) -> int:
    n_alvo = len(alvo.get("disciplinas", [])) or 1
    mesmo_curso = not {normalizar(c) for c in alvo.get("cursos", [])}.isdisjoint(
        {normalizar(c) for c in outro.get("cursos", [])}
    )
    componentes = [
        (PESO_DISCIPLINAS, min(len(materias) / n_alvo, 1.0)),
        (PESO_MINUTOS, min(minutos / MINUTOS_PARA_PONTUACAO_MAXIMA, 1.0)),
        (PESO_FOCOS, pontuacao_focos(alvo, outro)),
        (PESO_CURSO, 1.0 if mesmo_curso else 0.0),
        (PESO_SEMESTRE, 1.0 if alvo.get("semestre") == outro.get("semestre") else 0.0),
    ]
    soma_pesos = sum(p for p, _ in componentes)
    if soma_pesos <= 0:
        return 0
    return round(100 * sum(p * v for p, v in componentes) / soma_pesos)


# --------------------------------- principal --------------------------------


def combinar(alvo: dict, candidatos: list[dict], min_minutos: int) -> list[dict]:
    resultado = []
    for outro in candidatos:
        if outro["id"] == alvo["id"]:
            continue

        if not passa_preferencias(alvo, outro):
            continue
        if APLICAR_PREFERENCIAS_DO_CANDIDATO and not passa_preferencias(outro, alvo):
            continue

        materias = disciplinas_em_comum(alvo, outro)
        if not materias:
            continue
        horarios = disponibilidade_em_comum(alvo, outro, min_minutos)
        if not horarios:
            continue

        minutos = sum(fim - ini for _, ini, fim in horarios)
        cursos_outro = outro.get("cursos", [])
        resultado.append({
            "id": outro["id"],
            "nome": primeiro_nome(outro.get("nome")),
            "semestre": outro.get("semestre"),
            "curso": cursos_outro[0] if len(cursos_outro) == 1 else ", ".join(cursos_outro),
            "materiasEmComum": materias,
            "horariosEmComum": [
                f"{NOMES_DIAS.get(d, d)} {minutos_para_texto(i)}-{minutos_para_texto(f)}"
                for d, i, f in horarios
            ],
            "afinidade": calcular_afinidade(alvo, outro, materias, minutos),
            "genero": outro.get("genero"),
        })

    resultado.sort(key=lambda m: (-m["afinidade"], m["nome"]))
    return resultado


def resolver_min_minutos(arg_cli: int | None = None) -> int:
    if arg_cli is not None:
        return arg_cli
    env = os.environ.get("STUDYCIRCLE_MIN_MINUTOS")
    return int(env) if env else MIN_MINUTOS_EM_COMUM


def gerar_matches(aluno_id: str, min_minutos: int | None = None,
                  gravar: bool = True, db=None) -> list[dict] | None:
    """
    Ponto de entrada reutilizável (CLI, função serverless, rota de API...).
    Retorna a lista de matches, ou None se o aluno não existir.
    """
    db = db if db is not None else obter_banco()
    perfis = carregar_perfis(db)
    if aluno_id not in perfis:
        return None
    matches = combinar(perfis[aluno_id], list(perfis.values()),
                       resolver_min_minutos(min_minutos))
    if gravar:
        salvar_matches(db, aluno_id, matches)
    return matches


def main() -> int:
    ap = argparse.ArgumentParser(description="Gera os matches de estudo de um aluno (MongoDB).")
    ap.add_argument("aluno_id", help="id do aluno alvo")
    ap.add_argument("--min-minutos", type=int, default=None,
                    help=f"disponibilidade mínima em comum (padrão {MIN_MINUTOS_EM_COMUM})")
    ap.add_argument("--nao-gravar", action="store_true",
                    help="não grava no Mongo; só calcula e mostra o total")
    args = ap.parse_args()

    matches = gerar_matches(args.aluno_id, args.min_minutos, gravar=not args.nao_gravar)
    if matches is None:
        print(f"Aluno '{args.aluno_id}' não encontrado na collection '{COLECAO_PERFIS}'",
              file=sys.stderr)
        return 1

    destino = "(não gravado)" if args.nao_gravar else f"collection '{COLECAO_MATCHES}'"
    print(f"{len(matches)} combinação(ões) {destino}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
