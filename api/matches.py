# GET /api/matches?id=<id>: roda o matching.py para o aluno, grava em `matches` e devolve a lista.

import json
import os
import sys
import traceback
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if RAIZ not in sys.path:
    sys.path.insert(0, RAIZ)

from matching import gerar_matches


class handler(BaseHTTPRequestHandler):
    def _responder(self, status: int, corpo: dict) -> None:
        dados = json.dumps(corpo, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_GET(self):
        params = parse_qs(urlparse(self.path).query)
        aluno_id = (params.get("id") or [""])[0].strip()
        if not aluno_id:
            return self._responder(400, {"erro": "Informe o id do aluno (?id=...)."})

        try:
            matches = gerar_matches(aluno_id, gravar=True)
        except Exception:
            traceback.print_exc()
            return self._responder(500, {"erro": "Não foi possível calcular os matches agora."})

        if matches is None:
            return self._responder(404, {"erro": f"Aluno '{aluno_id}' não encontrado."})

        return self._responder(200, {"alunoId": aluno_id, "total": len(matches), "matches": matches})