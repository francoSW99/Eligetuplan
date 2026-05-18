"""
ETL — Poblar tabla pivot plan_clinica a partir de las clinicas oficiales
y los textos de cobertura de cada plan.

Uso:
    cd test/backend
    python -m scripts.sync_plan_clinica

Algoritmo:
    Por cada plan activo (tu7_activo=true):
      Por cada clinica oficial (tu7_id_prestador NOT NULL):
        Si el nombre de la clinica esta como substring (normalizado, sin tildes)
        en hospitalaria_texto o ambulatoria_texto del plan, crea una relacion
        plan_clinica(plan_id, clinica_id).

Esto permite filtros por ID exactos en `/api/v1/planes?prestador_ids=<uuid>`
sin depender del fallback fragil de matching por texto.
"""

import logging
import os
import pathlib
import sys
import time
import unicodedata

from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from supabase import create_client, Client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

PAGE_SIZE = 1000
BATCH_INSERT = 500


def _norm(s: str | None) -> str:
    if not s:
        return ""
    nfkd = unicodedata.normalize("NFKD", s)
    no_accents = "".join(c for c in nfkd if not unicodedata.combining(c))
    return no_accents.lower()


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env")
    return create_client(url, key)


def fetch_clinicas(sb: Client) -> list[dict]:
    rows = (
        sb.table("clinicas")
        .select("id,name")
        .not_.is_("tu7_id_prestador", "null")
        .eq("visible", True)
        .execute()
        .data
        or []
    )
    return rows


def fetch_active_planes(sb: Client) -> list[dict]:
    rows: list[dict] = []
    offset = 0
    while True:
        r = (
            sb.table("planes")
            .select("id,hospitalaria_texto,ambulatoria_texto")
            .eq("tu7_activo", True)
            .range(offset, offset + PAGE_SIZE - 1)
            .execute()
        )
        batch = r.data or []
        if not batch:
            break
        rows.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return rows


def build_relations(planes: list[dict], clinicas: list[dict]) -> list[dict]:
    """Para cada plan, busca cuales clinicas oficiales aparecen en sus textos."""
    clinicas_normalized = [(c["id"], _norm(c["name"])) for c in clinicas]
    relations: list[dict] = []
    for p in planes:
        combined = _norm((p.get("hospitalaria_texto") or "") + " | " + (p.get("ambulatoria_texto") or ""))
        if not combined.strip("| "):
            continue
        for clinica_id, name_norm in clinicas_normalized:
            if name_norm and name_norm in combined:
                relations.append({
                    "plan_id":    p["id"],
                    "clinica_id": clinica_id,
                })
    return relations


def main():
    logger.info("=== Sync plan_clinica (relaciones plan <-> clinica oficial) ===")
    t0 = time.time()

    sb = get_supabase()

    clinicas = fetch_clinicas(sb)
    logger.info(f"Clinicas oficiales: {len(clinicas)}")
    if not clinicas:
        logger.error("No hay clinicas oficiales (corre primero sync_tu7_prestadores). Abortando.")
        sys.exit(1)

    planes = fetch_active_planes(sb)
    logger.info(f"Planes activos: {len(planes)}")
    if not planes:
        logger.error("No hay planes activos. Abortando.")
        sys.exit(1)

    relations = build_relations(planes, clinicas)
    logger.info(f"Relaciones detectadas: {len(relations)}")

    # Truncate antes de insertar — operacion idempotente.
    logger.info("Limpiando tabla plan_clinica...")
    # Supabase RLS bloquea DELETE sin WHERE. Filtramos por algo siempre verdadero.
    sb.table("plan_clinica").delete().neq("plan_id", "00000000-0000-0000-0000-000000000000").execute()

    if not relations:
        logger.warning("No se encontraron relaciones. plan_clinica quedo vacia.")
        return

    inserted = 0
    for i in range(0, len(relations), BATCH_INSERT):
        chunk = relations[i : i + BATCH_INSERT]
        sb.table("plan_clinica").insert(chunk).execute()
        inserted += len(chunk)
        logger.info(f"  Insertadas: {inserted}/{len(relations)}")

    elapsed = time.time() - t0
    logger.info("=" * 50)
    logger.info(f"Sync plan_clinica completado en {elapsed:.1f}s")
    logger.info(f"   Relaciones creadas: {inserted}")
    logger.info(f"   Promedio: {inserted / len(planes):.1f} clinicas/plan")
    logger.info("=" * 50)


if __name__ == "__main__":
    main()
