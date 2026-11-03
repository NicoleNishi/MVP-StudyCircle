#!/usr/bin/env python3
"""
StudyCircle - algoritmo de combinação de estudantes.

Uso:
    python matching.py <id-do-aluno-alvo> [--raiz CAMINHO] [--min-minutos N]

Exemplo:
    python matching.py denilson-santos-de-jesus

Lê todos os .json de  <raiz>/perfis-de-estudos
Grava o resultado em <raiz>/src/data/matches-<id>.json
(a raiz padrão é a pasta onde este script está, ou seja, MVP-StudyCircle).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import unicodedata
from pathlib import Path

# ============================================================================
# CONFIGURAÇÃO  (altere aqui; nada além desta seção precisa mudar)
# ============================================================================

# Pastas (relativas à raiz do projeto)
PASTA_PERFIS = Path("perfis-de-estudos")
PASTA_SAIDA = Path("src") / "data"

# --- Filtros duros ---------------------------------------------------------
# Tempo mínimo (minutos) de um intervalo de disponibilidade em comum.
# Pode ser sobrescrito sem mexer no código:
#   - argumento de linha de comando --min-minutos
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
# Valor de "preferencias.grupo" -> gênero exigido dos candidatos.
# "misto" não filtra nada. Aceita variações com/sem prefixo "somente_" ou "so_".
GRUPO_PARA_GENERO = {
    "mulheres_cis": "mulher_cis",
    "homens_cis": "homem_cis",
    "mulheres_trans": "mulher_trans",
    "homens_trans": "homem_trans",
}
GRUPOS_MISTOS = {"misto", "", None}
# Prefixos aceitos antes do nome do grupo (ex.: "somente_homens_trans").
PREFIXOS_GRUPO = ("somente_", "so_")

# --- Tabela de compatibilidade de focos -----------------------------------
# Pares compatíveis (a ordem não importa). Tudo que não estiver aqui é "N".
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
    """Retorna só o primeiro nome (ex.: 'Denilson Santos de Jesus' -> 'Denilson')."""
    partes = str(nome_completo or "").split()
    return partes[0] if partes else ""


def carregar_json(caminho: Path) -> dict:
    with open(caminho, "r", encoding="utf-8") as f:
        return json.load(f)


def carregar_perfis(pasta: Path) -> dict[str, dict]:
    """Lê todos os .json da pasta. Arquivos inválidos são ignorados com aviso."""
    perfis = {}
    for arq in sorted(pasta.glob("*.json")):
        try:
            perfil = carregar_json(arq)
            perfil.setdefault("id", arq.stem)
            perfis[perfil["id"]] = perfil
        except (json.JSONDecodeError, OSError) as e:
            print(f"[aviso] ignorando {arq.name}: {e}", file=sys.stderr)
    return perfis


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
    """
    Interseção da disponibilidade. Retorna apenas os intervalos contínuos
    com duração >= `minimo`, como (dia, inicio_min, fim_min).
    """
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
        # Preferência de grupo desconhecida: por segurança, não combina.
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

        # Filtros de preferência
        if not passa_preferencias(alvo, outro):
            continue
        if APLICAR_PREFERENCIAS_DO_CANDIDATO and not passa_preferencias(outro, alvo):
            continue

        # Filtros duros
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


def resolver_min_minutos(arg_cli: int | None) -> int:
    if arg_cli is not None:
        return arg_cli
    env = os.environ.get("STUDYCIRCLE_MIN_MINUTOS")
    return int(env) if env else MIN_MINUTOS_EM_COMUM


def main() -> int:
    ap = argparse.ArgumentParser(description="Gera os matches de estudo de um aluno.")
    ap.add_argument("aluno_id", help="id do aluno alvo (nome do arquivo sem .json)")
    ap.add_argument("--raiz", type=Path, default=Path(__file__).resolve().parent,
                    help="pasta raiz do projeto (MVP-StudyCircle)")
    ap.add_argument("--min-minutos", type=int, default=None,
                    help=f"disponibilidade mínima em comum (padrão {MIN_MINUTOS_EM_COMUM})")
    args = ap.parse_args()

    perfis = carregar_perfis(args.raiz / PASTA_PERFIS)
    if args.aluno_id not in perfis:
        print(f"Aluno '{args.aluno_id}' não encontrado em {args.raiz / PASTA_PERFIS}",
              file=sys.stderr)
        return 1

    matches = combinar(perfis[args.aluno_id], list(perfis.values()),
                       resolver_min_minutos(args.min_minutos))

    pasta_saida = args.raiz / PASTA_SAIDA
    pasta_saida.mkdir(parents=True, exist_ok=True)
    destino = pasta_saida / f"matches-{args.aluno_id}.json"
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(matches, f, ensure_ascii=False, indent=2)

    print(f"{len(matches)} combinação(ões) gravada(s) em {destino}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
