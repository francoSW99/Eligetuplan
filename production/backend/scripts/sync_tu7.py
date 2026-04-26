"""
ETL — Enriquecimiento desde tu7.cl → Supabase

Uso:
    cd test/backend
    python scripts/sync_tu7.py

Variables de entorno requeridas (en test/backend/.env):
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY

Llama a POST https://tu7.cl/Api/data/planes/ con {METHOD:"LIST",PARAMS:{}}
y upserta 1,854 planes marcándolos con tu7_activo=true.
"""

import json
import logging
import os
import pathlib
import re
import ssl
import sys
import time
import urllib.request
from decimal import Decimal, InvalidOperation

from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from supabase import create_client, Client
from scripts.sis_normalize import tu7_isapre_slug

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

TU7_API = "https://tu7.cl/Api/data/planes/"
CACHE_DIR = pathlib.Path(__file__).parent.parent / ".cache"
BATCH_SIZE = 200


def _ssl_context() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def fetch_tu7_planes(use_cache: bool = True) -> list[dict]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / "tu7_planes.json"

    if use_cache and cache_file.exists():
        logger.info(f"Usando caché: {cache_file} ({cache_file.stat().st_size / 1024:.0f} KB)")
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
    logger.info(f"Recibido: {len(raw) / 1024:.0f} KB en {time.time() - t0:.1f}s")

    cache_file.write_bytes(raw)
    return json.loads(raw.decode("utf-8"))


def _dec(val: str) -> float | None:
    if not val or not str(val).strip():
        return None
    try:
        return float(Decimal(str(val).strip()))
    except (InvalidOperation, ValueError):
        return None


def _int(val: str) -> int | None:
    if not val or not str(val).strip():
        return None
    try:
        return int(str(val).strip())
    except ValueError:
        return None


def _cobertura_max_pct(text: str | None) -> int | None:
    """Extrae el mayor porcentaje del texto 'X% clínicas, Y% clínicas, ...'."""
    if not text or not text.strip():
        return None
    pcts = [int(m) for m in re.findall(r"(\d+)%", text)]
    return max(pcts) if pcts else None


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env")
    return create_client(url, key)


def build_slug_to_id(sb: Client) -> dict[str, str]:
    rows = sb.table("isapres").select("id,slug").execute().data
    return {r["slug"]: r["id"] for r in rows if r.get("slug")}


def upsert_planes(sb: Client, planes: list[dict], slug_to_id: dict[str, str]) -> tuple[int, int]:
    ok = 0
    skipped = 0
    batch: list[dict] = []

    for p in planes:
        slug = tu7_isapre_slug(p.get("NOMBRE_ISAPRE", ""))
        if not slug:
            skipped += 1
            continue
        isapre_id = slug_to_id.get(slug)
        if not isapre_id:
            logger.warning(f"slug '{slug}' no existe en isapres")
            skipped += 1
            continue

        codigo = (p.get("CODIGO_PLAN") or "").strip()
        if not codigo:
            skipped += 1
            continue

        hosp_txt = p.get("HOSPITALARIA_PLAN", "").strip() or None
        amb_txt = p.get("AMBULATORIA_PLAN", "").strip() or None

        batch.append({
            "codigo_plan":        codigo,
            "isapre_id":          isapre_id,
            "name":               p.get("NOMBRE_PLAN", "").strip(),
            "modalidad":          p.get("TIPO_PLAN", "").strip() or None,
            "price_uf":           _dec(p.get("BASE_PLAN")),
            "base_plan_uf":       _dec(p.get("BASE_PLAN")),
            "ges_isapre_uf":      _dec(p.get("GES_ISAPRE")),
            "id_zona":            _int(p.get("ID_ZONA")),
            "pdf_plan":           p.get("PDF_PLAN", "").strip() or None,
            "hospitalaria_texto": hosp_txt,
            "ambulatoria_texto":  amb_txt,
            "cobertura_hosp_max": _cobertura_max_pct(hosp_txt),
            "cobertura_amb_max":  _cobertura_max_pct(amb_txt),
            "tu7_id_plan":        p.get("ID_PLAN", "").strip() or None,
            "tu7_activo":         True,
            "vigente":            True,
            "updated_at":         "now()",
        })

        if len(batch) >= BATCH_SIZE:
            sb.table("planes").upsert(batch, on_conflict="codigo_plan").execute()
            ok += len(batch)
            logger.info(f"  Batch upserted: {ok} planes...")
            batch = []

    if batch:
        sb.table("planes").upsert(batch, on_conflict="codigo_plan").execute()
        ok += len(batch)

    return ok, skipped


def main():
    logger.info("=== Sync tu7.cl → Supabase ===")
    t0 = time.time()

    planes = fetch_tu7_planes(use_cache=True)
    logger.info(f"Planes recibidos desde tu7: {len(planes)}")

    if not planes:
        logger.error("No se obtuvieron planes. Abortando.")
        sys.exit(1)

    sb = get_supabase()
    slug_to_id = build_slug_to_id(sb)
    logger.info(f"Isapres disponibles: {list(slug_to_id.keys())}")

    ok, skipped = upsert_planes(sb, planes, slug_to_id)

    elapsed = time.time() - t0
    logger.info("=" * 50)
    logger.info(f"✅ Sync tu7 completado en {elapsed:.1f}s")
    logger.info(f"   Planes upserted : {ok}")
    logger.info(f"   Planes omitidos : {skipped}")
    logger.info("=" * 50)


if __name__ == "__main__":
    main()
