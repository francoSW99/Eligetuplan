"""
ETL — Sync de prestadores desde tu7.cl → Supabase

Uso:
    cd test/backend
    python -m scripts.sync_tu7_prestadores

Variables de entorno requeridas (en test/backend/.env):
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY

Llama a POST https://tu7.cl/Api/data/prestadores/ con {METHOD:"LIST",PARAMS:{}}
y upsertea las 71 clínicas (master list).

Requiere haber aplicado la migración 005_clinicas_tu7.sql.
"""

import json
import logging
import os
import pathlib
import ssl
import sys
import time
import urllib.request

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

TU7_API = "https://tu7.cl/Api/data/prestadores/"
CACHE_DIR = pathlib.Path(__file__).parent.parent / ".cache"
BATCH_SIZE = 100


def _ssl_context() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def fetch_tu7_prestadores(use_cache: bool = False) -> list[dict]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / "tu7_prestadores.json"

    if use_cache and cache_file.exists():
        logger.info(f"Usando caché: {cache_file}")
        return json.loads(cache_file.read_text(encoding="utf-8"))

    logger.info(f"Descargando: {TU7_API}")
    payload = json.dumps({"METHOD": "LIST", "PARAMS": {}}).encode("utf-8")
    req = urllib.request.Request(
        TU7_API,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
            "Origin": "https://tu7.cl",
            "Referer": "https://tu7.cl/Compara/Isapres/",
        },
        method="POST",
    )
    t0 = time.time()
    with urllib.request.urlopen(req, context=_ssl_context(), timeout=30) as resp:
        raw = resp.read()
    logger.info(f"Recibido: {len(raw) / 1024:.1f} KB en {time.time() - t0:.1f}s")

    cache_file.write_bytes(raw)
    return json.loads(raw.decode("utf-8"))


def _flag(val) -> bool:
    s = str(val).strip().lower()
    return s in ("1", "true", "t", "yes", "y")


def _int(val) -> int | None:
    if val is None:
        return None
    try:
        return int(str(val).strip())
    except (ValueError, TypeError):
        return None


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env")
    return create_client(url, key)


def upsert_prestadores(sb: Client, prestadores: list[dict]) -> tuple[int, int]:
    ok = 0
    skipped = 0
    batch: list[dict] = []

    for p in prestadores:
        tu7_id = _int(p.get("ID_PRESTADOR"))
        if tu7_id is None:
            skipped += 1
            continue

        name = (p.get("NOMBRE_PRESTADOR") or "").strip()
        if not name:
            skipped += 1
            continue

        logo = (p.get("LOGO") or "").strip() or None
        zonas = (p.get("ZONAS") or "").strip() or None

        batch.append({
            "tu7_id_prestador":   tu7_id,
            "name":               name,
            "logo_filename":      logo,
            "zonas":              zonas,
            "cubre_hospitalaria": _flag(p.get("HOSPITALARIA")),
            "cubre_ambulatoria":  _flag(p.get("AMBULATORIA")),
            "visible":            _flag(p.get("SHOW")),
            "updated_at":         "now()",
        })

        if len(batch) >= BATCH_SIZE:
            sb.table("clinicas").upsert(batch, on_conflict="tu7_id_prestador").execute()
            ok += len(batch)
            logger.info(f"  Batch upserted: {ok} prestadores...")
            batch = []

    if batch:
        sb.table("clinicas").upsert(batch, on_conflict="tu7_id_prestador").execute()
        ok += len(batch)

    return ok, skipped


def main():
    logger.info("=== Sync prestadores tu7.cl → Supabase ===")
    t0 = time.time()

    prestadores = fetch_tu7_prestadores(use_cache=False)
    logger.info(f"Prestadores recibidos: {len(prestadores)}")

    if not prestadores:
        logger.error("No se obtuvieron prestadores. Abortando.")
        sys.exit(1)

    sb = get_supabase()
    ok, skipped = upsert_prestadores(sb, prestadores)

    elapsed = time.time() - t0
    logger.info("=" * 50)
    logger.info(f"Sync prestadores completado en {elapsed:.1f}s")
    logger.info(f"   Prestadores upserted : {ok}")
    logger.info(f"   Prestadores omitidos : {skipped}")
    logger.info("=" * 50)


if __name__ == "__main__":
    main()
