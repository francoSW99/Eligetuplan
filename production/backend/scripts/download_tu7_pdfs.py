"""
Descarga masiva de PDFs de planes desde tu7.cl.

Uso:
    cd test/backend
    python scripts/download_tu7_pdfs.py [--limit N] [--force]

URLs: https://tu7.cl/pdf/{PDF_PLAN}
Destino: test/backend/.cache/pdfs/{PDF_PLAN}

Idempotente: salta archivos ya descargados (a menos que --force).
Al terminar actualiza planes.pdf_local_path en Supabase.
"""
import argparse
import concurrent.futures
import logging
import os
import pathlib
import ssl
import time
import urllib.error
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

PDF_BASE = "https://tu7.cl/pdf/{filename}"
CACHE_DIR = pathlib.Path(__file__).parent.parent / ".cache"
PDF_DIR = CACHE_DIR / "pdfs"
WORKERS = 8


def _ssl_ctx() -> ssl.SSLContext:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    return ctx


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
    return create_client(url, key)


def fetch_planes_list(sb: Client) -> list[dict]:
    """Pagina sobre todos los planes tu7_activo=true con pdf_plan no nulo."""
    rows: list[dict] = []
    offset = 0
    page = 1000
    while True:
        r = (
            sb.table("planes")
            .select("id,codigo_plan,pdf_plan")
            .eq("tu7_activo", True)
            .not_.is_("pdf_plan", "null")
            .range(offset, offset + page - 1)
            .execute()
        )
        if not r.data:
            break
        rows.extend(r.data)
        if len(r.data) < page:
            break
        offset += page
    return rows


def download_one(filename: str, force: bool) -> tuple[str, str]:
    """Devuelve (filename, status). status: 'ok' | 'skip' | 'error:msg'"""
    target = PDF_DIR / filename
    if target.exists() and not force and target.stat().st_size > 0:
        return (filename, "skip")

    url = PDF_BASE.format(filename=filename)
    try:
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://tu7.cl/Compara/Isapres/",
            },
        )
        with urllib.request.urlopen(req, context=_ssl_ctx(), timeout=30) as resp:
            data = resp.read()
        if not data or not data.startswith(b"%PDF"):
            return (filename, "error:not-pdf")
        target.write_bytes(data)
        return (filename, "ok")
    except urllib.error.HTTPError as e:
        return (filename, f"error:http-{e.code}")
    except Exception as e:
        return (filename, f"error:{type(e).__name__}")


def update_local_paths(sb: Client, rows: list[dict]):
    """Actualiza planes.pdf_local_path para archivos descargados exitosamente."""
    updates: list[tuple[str, str]] = []
    for r in rows:
        pdf = r.get("pdf_plan")
        if not pdf:
            continue
        local = PDF_DIR / pdf
        if local.exists() and local.stat().st_size > 0:
            updates.append((r["codigo_plan"], f"pdfs/{pdf}"))

    if not updates:
        logger.info("Nada que actualizar en pdf_local_path.")
        return

    logger.info(f"Actualizando pdf_local_path en {len(updates)} planes...")
    done = 0
    for codigo, path in updates:
        sb.table("planes").update({"pdf_local_path": path}).eq(
            "codigo_plan", codigo
        ).execute()
        done += 1
        if done % 200 == 0:
            logger.info(f"  {done}/{len(updates)}")
    logger.info(f"  {done}/{len(updates)}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=None, help="Descargar solo N PDFs (debug)")
    parser.add_argument("--force", action="store_true", help="Re-descargar aunque ya existan")
    parser.add_argument("--skip-db-update", action="store_true", help="No actualizar Supabase al final")
    args = parser.parse_args()

    PDF_DIR.mkdir(parents=True, exist_ok=True)

    logger.info("=== Descarga de PDFs tu7 ===")
    sb = get_supabase()
    rows = fetch_planes_list(sb)
    logger.info(f"Planes con pdf_plan: {len(rows)}")

    if args.limit:
        rows = rows[: args.limit]
        logger.info(f"Limitado a {len(rows)} (debug)")

    filenames = sorted({r["pdf_plan"] for r in rows if r.get("pdf_plan")})
    logger.info(f"PDFs únicos a descargar: {len(filenames)}")

    t0 = time.time()
    stats = {"ok": 0, "skip": 0}
    errors: list[tuple[str, str]] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futures = {ex.submit(download_one, f, args.force): f for f in filenames}
        for i, fut in enumerate(concurrent.futures.as_completed(futures), 1):
            fn, status = fut.result()
            if status == "ok":
                stats["ok"] += 1
            elif status == "skip":
                stats["skip"] += 1
            else:
                errors.append((fn, status))
            if i % 100 == 0:
                logger.info(f"  Progreso: {i}/{len(filenames)} | ok={stats['ok']} skip={stats['skip']} err={len(errors)}")

    elapsed = time.time() - t0
    logger.info("=" * 50)
    logger.info(f"✅ Descarga completada en {elapsed:.1f}s")
    logger.info(f"   Descargados     : {stats['ok']}")
    logger.info(f"   Ya existían     : {stats['skip']}")
    logger.info(f"   Errores         : {len(errors)}")
    if errors[:10]:
        logger.info(f"   Primeros errores: {errors[:10]}")
    logger.info("=" * 50)

    if not args.skip_db_update and stats["ok"] + stats["skip"] > 0:
        update_local_paths(sb, rows)


if __name__ == "__main__":
    main()
