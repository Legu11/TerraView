# Exécute les requêtes définies dans queries.sql et affiche les résultats
from __future__ import annotations

import re
import sys
from pathlib import Path

from db import cursor

QUERIES_FILE = Path(__file__).resolve().parent / "queries.sql"

def parse_queries(sql_text: str) -> list[tuple[int, str, str]]:
    queries: list[tuple[int, str, str]] = []
    blocks = re.split(r"(?m)^--\s*(\d+\.\s.+)$", sql_text)
    # blocks = [preambule, titre1, sql1, titre2, sql2, ...]
    for i in range(1, len(blocks), 2):
        title = blocks[i].strip()
        body = blocks[i + 1]
        for stmt in body.split(";"):
            stmt = stmt.strip()
            # On ignore les "USE agriculture;" en tête de fichier
            if stmt and not stmt.lower().startswith("use "):
                num = int(title.split(".", 1)[0])
                queries.append((num, title, stmt))
                break
    return queries

# Affiche un tableau
def print_table(headers: list[str], rows: list[tuple]) -> None:
    if not rows:
        print("  (aucun résultat)")
        return
    str_rows = [[str(v) if v is not None else "NULL" for v in r] for r in rows]
    widths = [max(len(h), *(len(r[i]) for r in str_rows)) for i, h in enumerate(headers)]
    sep = "  ".join("-" * w for w in widths)
    print("  " + "  ".join(h.ljust(w) for h, w in zip(headers, widths)))
    print("  " + sep)
    for r in str_rows:
        print("  " + "  ".join(c.ljust(w) for c, w in zip(r, widths)))

def main() -> None:
    selected: set[int] | None = None
    if len(sys.argv) > 1:
        try:
            selected = {int(x) for x in sys.argv[1:]}
        except ValueError:
            raise SystemExit("Arguments invalides : attendez des numéros de requête (ex: 1 4 7).")

    queries = parse_queries(QUERIES_FILE.read_text(encoding="utf-8"))

    with cursor() as (_, cur):
        for num, title, stmt in queries:
            if selected and num not in selected:
                continue
            print(f"\n=== {title} ===")
            cur.execute(stmt)
            headers = [d[0] for d in cur.description]
            print_table(headers, cur.fetchall())

if __name__ == "__main__":
    main()
