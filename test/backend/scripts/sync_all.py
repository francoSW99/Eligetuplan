"""
Orquestador del cron quincenal — actualiza datos de tu7.cl + UF del día y deja
todo reflejado en Supabase (única fuente de verdad para el frontend y backend).

Uso:
    cd test/backend
    python scripts/sync_all.py            # corrida real (escribe en Supabase)
    python scripts/sync_all.py --dry-run  # solo lee: UF del día + conteo, sin mutar nada

Variables de entorno requeridas (en .env local o inyectadas por el workflow):
    SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY

Flujo:
    1. Snapshot de codigos de plan activos (antes).
    2. Fetch UF del día (mindicador.cl, fallback CMF).
    3. Corre los 3 syncs en orden: sync_tu7 → sync_tu7_prestadores → sync_plan_clinica.
    4. Snapshot posterior + diff (agregados / quitados).
    5. Guardarraíl: aborta SIN tocar `app_meta` si los datos lucen anómalos.
    6. Upsert de `app_meta` (valor_uf, valor_uf_fecha, total_planes, last_sync, ...).
    7. Imprime un resumen JSON en stdout (lo consume el workflow). Los logs van a stderr.

Códigos de salida:
    0  ok (o dry-run)
    2  guardarraíl disparado / fuente anómala — NO se escribió `app_meta`
    1  error inesperado / falló algún sync
"""

import argparse
import datetime as dt
import json
import logging
import os
import pathlib
import ssl
import subprocess
import sys
import urllib.request

from dotenv import load_dotenv

BACKEND_DIR = pathlib.Path(__file__).parent.parent
load_dotenv(BACKEND_DIR / ".env")

from supabase import create_client, Client

# Logs a stderr para mantener stdout limpio (solo el JSON final).
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)

UF_API = "https://mindicador.cl/api/uf"
UF_API_FALLBACK = "https://api.cmfchile.cl/api-sbifv3/recursos_api/uf"  # requiere apikey; best-effort
SYNC_STEPS = ["scripts.sync_tu7", "scripts.sync_tu7_prestadores", "scripts.sync_plan_clinica"]

# Guardarraíles
MAX_DROP_PCT = 0.20      # caída máxima tolerada de planes vs corrida previa
UF_MIN_CLP = 30_000      # rango sano para el valor de la UF en CLP
UF_MAX_CLP = 60_000

MESES_ES = [
    "ene", "feb", "mar", "abr", "may", "jun",
    "jul", "ago", "sep", "oct", "nov", "dic",
]


def _ssl_context() -> ssl.SSLContext:
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


def fetch_uf() -> tuple[float, str]:
    """Devuelve (valor_uf_clp, fecha_iso). Lanza si no logra un valor sano.

    mindicador.cl/api/uf devuelve {..., "serie": [{"fecha": ISO, "valor": float}, ...]}
    con el dato más reciente primero.
    """
    req = urllib.request.Request(UF_API, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=_ssl_context(), timeout=30) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    serie = data.get("serie") or []
    if not serie or serie[0].get("valor") is None:
        raise RuntimeError("mindicador.cl devolvió una serie de UF vacía o sin valor")
    latest = serie[0]
    valor = float(latest["valor"])
    fecha = str(latest.get("fecha", ""))[:10]  # ISO yyyy-mm-dd
    if not fecha:
        fecha = dt.date.today().isoformat()
    logger.info(f"UF del día: ${valor:,.2f} ({fecha})")
    return valor, fecha


def active_plan_codes(sb: Client) -> set[str]:
    """Set de codigo_plan con tu7_activo=true (paginado)."""
    codes: set[str] = set()
    offset = 0
    page = 1000
    while True:
        r = (
            sb.table("planes")
            .select("codigo_plan")
            .eq("tu7_activo", True)
            .range(offset, offset + page - 1)
            .execute()
        )
        batch = r.data or []
        for row in batch:
            c = row.get("codigo_plan")
            if c:
                codes.add(c)
        if len(batch) < page:
            break
        offset += page
    return codes


def read_prev_total(sb: Client) -> int | None:
    """total_planes de la corrida previa. Tolera que app_meta aún no exista."""
    try:
        r = sb.table("app_meta").select("value").eq("key", "total_planes").execute()
    except Exception as e:
        logger.warning(f"No se pudo leer app_meta.total_planes (¿migración 006 aplicada?): {e}")
        return None
    if r.data and r.data[0].get("value"):
        try:
            return int(r.data[0]["value"])
        except ValueError:
            return None
    return None


def run_sync_step(module: str) -> None:
    """Corre `python -m <module>` desde el backend dir. Lanza si retorna != 0."""
    logger.info(f"→ corriendo {module} ...")
    proc = subprocess.run(
        [sys.executable, "-m", module],
        cwd=str(BACKEND_DIR),
        env=os.environ.copy(),
        capture_output=True,
        text=True,
    )
    # Reenvía el output del sub-sync a stderr (no contamina el JSON de stdout).
    if proc.stdout:
        for line in proc.stdout.rstrip().splitlines():
            logger.info(f"   [{module}] {line}")
    if proc.stderr:
        for line in proc.stderr.rstrip().splitlines():
            logger.info(f"   [{module}] {line}")
    if proc.returncode != 0:
        raise RuntimeError(f"{module} falló con código {proc.returncode}")


def upsert_meta(sb: Client, rows: dict[str, str]) -> None:
    payload = [{"key": k, "value": str(v), "updated_at": "now()"} for k, v in rows.items()]
    sb.table("app_meta").upsert(payload, on_conflict="key").execute()


def fecha_es(fecha_iso: str) -> str:
    """yyyy-mm-dd → 'DD mmm YYYY' en español (ej: '17 may 2026')."""
    try:
        d = dt.date.fromisoformat(fecha_iso)
        return f"{d.day} {MESES_ES[d.month - 1]} {d.year}"
    except ValueError:
        return fecha_iso


def emit(summary: dict) -> None:
    """Único print a stdout: el resumen JSON que consume el workflow."""
    print(json.dumps(summary, ensure_ascii=False))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Solo lee UF + conteo actual; no corre syncs ni escribe app_meta.")
    args = parser.parse_args()

    summary: dict = {
        "ok": False,
        "dry_run": args.dry_run,
        "aborted": False,
        "reason": None,
        "uf": None,
        "uf_fecha": None,
        "total_before": None,
        "total_after": None,
        "agregados": 0,
        "quitados": 0,
    }

    try:
        sb = get_supabase()

        # 1. Snapshot previo
        before = active_plan_codes(sb)
        prev_total = read_prev_total(sb)
        summary["total_before"] = len(before)
        logger.info(f"Planes activos antes: {len(before)} (meta previa: {prev_total})")

        # 2. UF del día
        uf_valor, uf_fecha = fetch_uf()
        summary["uf"] = round(uf_valor, 2)
        summary["uf_fecha"] = uf_fecha

        if args.dry_run:
            logger.info("DRY-RUN: no se corren syncs ni se escribe app_meta.")
            summary["ok"] = True
            summary["total_after"] = len(before)
            emit(summary)
            return 0

        # 3. Syncs en orden
        for step in SYNC_STEPS:
            run_sync_step(step)

        # 4. Snapshot posterior + diff
        after = active_plan_codes(sb)
        summary["total_after"] = len(after)
        agregados = sorted(after - before)
        quitados = sorted(before - after)
        summary["agregados"] = len(agregados)
        summary["quitados"] = len(quitados)
        logger.info(f"Planes activos después: {len(after)} (+{len(agregados)} / -{len(quitados)})")

        # 5. Guardarraíles
        if len(after) == 0:
            summary["aborted"] = True
            summary["reason"] = "tu7 devolvió 0 planes activos — fuente probablemente caída."
        elif not (UF_MIN_CLP <= uf_valor <= UF_MAX_CLP):
            summary["aborted"] = True
            summary["reason"] = f"UF fuera de rango sano (${uf_valor:,.0f})."
        elif prev_total and len(after) < prev_total * (1 - MAX_DROP_PCT):
            drop = 100 * (1 - len(after) / prev_total)
            summary["aborted"] = True
            summary["reason"] = (
                f"Caída de planes {drop:.0f}% (> {int(MAX_DROP_PCT*100)}%): "
                f"{prev_total} → {len(after)}. Posible error de fuente."
            )

        if summary["aborted"]:
            logger.error(f"GUARDARRAÍL: {summary['reason']} — NO se actualiza app_meta.")
            emit(summary)
            return 2

        # 6. Upsert app_meta
        upsert_meta(sb, {
            "valor_uf":         int(round(uf_valor)),
            "valor_uf_fecha":   uf_fecha,
            "total_planes":     len(after),
            "last_sync":        fecha_es(uf_fecha),
            "planes_agregados": len(agregados),
            "planes_quitados":  len(quitados),
        })
        logger.info("app_meta actualizada.")

        summary["ok"] = True
        emit(summary)
        return 0

    except Exception as e:
        logger.exception("Error en sync_all")
        summary["reason"] = f"{type(e).__name__}: {e}"
        emit(summary)
        return 1


if __name__ == "__main__":
    sys.exit(main())
