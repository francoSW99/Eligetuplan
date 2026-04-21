"""
ETL — Sincronización de Planes de Salud SIS → Supabase

Uso:
    cd test/backend
    python scripts/sync_sis.py --period 202602

Variables de entorno requeridas (en test/backend/.env):
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY   ← usa service role para bypassear RLS en INSERT
    SIS_PERIOD                  ← fallback si no se pasa --period

El script es idempotente: puede ejecutarse múltiples veces.
Usa upsert con on_conflict=codigo_plan para no duplicar planes.
"""

import argparse
import logging
import pathlib
import ssl
import sys
import time
import urllib.request
import zipfile
from datetime import date
from typing import Optional

from dotenv import load_dotenv
import os

# Cargar .env desde el directorio del backend
env_path = pathlib.Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

from supabase import create_client, Client
from scripts.sis_parser import parse_planes_bytes, SisPlanRow

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ── Configuración ──────────────────────────────────────────────────────────────

SIS_BASE_URL = (
    "https://datos.superdesalud.gob.cl/archivos/Planes%20de%20Salud"
    "/{year}/Planes_de_salud_{period}.zip"
)
CACHE_DIR = pathlib.Path(__file__).parent.parent / ".cache" / "sis"
BATCH_SIZE = 200  # filas por upsert (evita timeouts en Supabase)


# ── Descarga ───────────────────────────────────────────────────────────────────

def _ssl_context() -> ssl.SSLContext:
    """Contexto SSL sin verificación — necesario en Windows sin certificados raíz."""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def download_zip(period: str, force: bool = False) -> pathlib.Path:
    """Descarga el ZIP del período indicado. Usa caché si ya existe."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = CACHE_DIR / f"Planes_de_salud_{period}.zip"

    if zip_path.exists() and not force:
        logger.info(f"Usando ZIP en caché: {zip_path} ({zip_path.stat().st_size / 1024:.1f} KB)")
        return zip_path

    year = period[:4]
    url = SIS_BASE_URL.format(year=year, period=period)
    logger.info(f"Descargando: {url}")

    t0 = time.time()
    with urllib.request.urlopen(url, context=_ssl_context()) as resp:
        data = resp.read()
    elapsed = time.time() - t0

    zip_path.write_bytes(data)
    logger.info(f"Descargado: {len(data) / 1024:.1f} KB en {elapsed:.1f}s → {zip_path}")
    return zip_path


def extract_planes_bytes(zip_path: pathlib.Path) -> bytes:
    """Extrae el archivo de planes del ZIP (busca el .txt o .csv más grande)."""
    with zipfile.ZipFile(zip_path) as z:
        members = sorted(z.infolist(), key=lambda i: i.file_size, reverse=True)
        logger.info(f"Archivos en ZIP: {[m.filename for m in members]}")
        target = members[0]  # el más grande es siempre el de planes
        logger.info(f"Leyendo: {target.filename} ({target.file_size / 1024:.1f} KB)")
        return z.read(target.filename)


# ── Supabase ───────────────────────────────────────────────────────────────────

def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError(
            "Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY"
        )
    return create_client(url, key)


def upsert_isapres(sb: Client, rows: list[SisPlanRow]) -> dict[str, str]:
    """
    Inserta/actualiza Isapres. Devuelve mapa {slug: uuid}.
    """
    # Deduplicar por slug
    seen: dict[str, dict] = {}
    for r in rows:
        if r.isapre_slug not in seen:
            seen[r.isapre_slug] = {
                "name": r.isapre_nombre,
                "slug": r.isapre_slug,
                "codigo_sis": r.codigo_isapre,
                "logo_url": f"/logos/{r.isapre_logo}" if r.isapre_logo else None,
            }

    isapre_list = list(seen.values())
    logger.info(f"Upserting {len(isapre_list)} isapres...")

    result = (
        sb.table("isapres")
        .upsert(isapre_list, on_conflict="slug")
        .execute()
    )

    # Obtener UUIDs actuales
    all_isapres = sb.table("isapres").select("id,slug").execute()
    slug_to_id = {row["slug"]: row["id"] for row in all_isapres.data}
    logger.info(f"Isapres en BD: {len(slug_to_id)}")
    return slug_to_id


def upsert_planes(sb: Client, rows: list[SisPlanRow], slug_to_id: dict[str, str]) -> tuple[int, int]:
    """
    Upsert de planes en batches. Devuelve (insertados/actualizados, omitidos).
    """
    total_ok = 0
    total_skip = 0

    payload_batch = []
    for r in rows:
        isapre_id = slug_to_id.get(r.isapre_slug)
        if not isapre_id:
            total_skip += 1
            continue

        payload_batch.append({
            "isapre_id":           isapre_id,
            "name":                r.nombre_plan,
            "codigo_plan":         r.codigo_plan,
            "price_uf":            r.price_uf,
            "hospital_coverage":   r.hospital_coverage,
            "ambulatory_coverage": r.ambulatory_coverage,
            "modalidad":           r.modalidad,
            "con_parto":           r.con_parto,
            "vigente":             True,
            "fecha_emision":       r.fecha_emision.isoformat() if isinstance(r.fecha_emision, date) else None,
            "comercializable":     r.comercializable,
            "tipo_plan":           r.tipo_plan,
            "updated_at":          "now()",
        })

        if len(payload_batch) >= BATCH_SIZE:
            sb.table("planes").upsert(payload_batch, on_conflict="codigo_plan").execute()
            total_ok += len(payload_batch)
            logger.info(f"  Batch upserted: {total_ok} planes...")
            payload_batch = []

    # Último batch
    if payload_batch:
        sb.table("planes").upsert(payload_batch, on_conflict="codigo_plan").execute()
        total_ok += len(payload_batch)

    return total_ok, total_skip


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Sync planes SIS → Supabase")
    parser.add_argument(
        "--period",
        default=os.getenv("SIS_PERIOD", "202602"),
        help="Período YYYYMM (default: var SIS_PERIOD o 202602)",
    )
    parser.add_argument(
        "--force-download",
        action="store_true",
        help="Re-descargar aunque el ZIP ya esté en caché",
    )
    args = parser.parse_args()

    logger.info(f"=== Sync SIS → Supabase | Período: {args.period} ===")
    t_start = time.time()

    # 1. Descargar
    zip_path = download_zip(args.period, force=args.force_download)

    # 2. Extraer
    raw = extract_planes_bytes(zip_path)

    # 3. Parsear
    logger.info("Parseando archivo de planes...")
    rows = parse_planes_bytes(raw)
    logger.info(f"Filas válidas para cargar: {len(rows)}")

    if not rows:
        logger.error("No se parsearon filas válidas. Abortando.")
        sys.exit(1)

    # 4. Conectar a Supabase
    logger.info("Conectando a Supabase...")
    sb = get_supabase()

    # 5. Upsert isapres
    slug_to_id = upsert_isapres(sb, rows)

    # 6. Upsert planes
    logger.info(f"Upserting planes en batches de {BATCH_SIZE}...")
    ok, skipped = upsert_planes(sb, rows, slug_to_id)

    elapsed = time.time() - t_start
    logger.info("=" * 50)
    logger.info(f"✅ Sync completado en {elapsed:.1f}s")
    logger.info(f"   Planes upserted : {ok}")
    logger.info(f"   Planes omitidos : {skipped}")
    logger.info(f"   Isapres en BD   : {len(slug_to_id)}")
    logger.info("=" * 50)


if __name__ == "__main__":
    main()
