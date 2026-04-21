import math
import os
import pathlib
import re
from typing import Any, Optional

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Eligetuplan API",
    description="Backend API for comparing Isapres health plans in Chile",
    version="1.0.0"
)

# CORS Configuration - restrict to frontend in production
origins = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,https://landingpage-asesoriasalud.vercel.app"
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Initialization
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://xyzcompany.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "public-anon-key")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Warning: Supabase client initialization failed. {e}")
    supabase = None

# Pydantic models for request bodies
class MatchPlanRequest(BaseModel):
    age: int
    income_clp: int
    dependents: int
    preferred_region: Optional[str] = None

class PlanResponse(BaseModel):
    id: str
    name: str
    isapre_name: str
    logo_url: str
    price_uf: float
    match_score: float
    hospital_coverage: float
    ambulatory_coverage: float


def _build_mock_plans() -> list[PlanResponse]:
    return [
        PlanResponse(
            id="mock-1",
            name="Plan Preferente A",
            isapre_name="Isapre Ejemplo 1",
            logo_url="https://via.placeholder.com/150",
            price_uf=3.5,
            match_score=95.5,
            hospital_coverage=92.0,
            ambulatory_coverage=86.0,
        ),
        PlanResponse(
            id="mock-2",
            name="Plan Libre Eleccion B",
            isapre_name="Isapre Ejemplo 2",
            logo_url="https://via.placeholder.com/150",
            price_uf=4.2,
            match_score=88.0,
            hospital_coverage=88.0,
            ambulatory_coverage=82.0,
        ),
        PlanResponse(
            id="mock-3",
            name="Plan Cerrado C",
            isapre_name="Isapre Ejemplo 3",
            logo_url="https://via.placeholder.com/150",
            price_uf=2.9,
            match_score=84.0,
            hospital_coverage=79.0,
            ambulatory_coverage=74.0,
        ),
    ]


def _safe_float(value, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _score_plan(plan: dict, payload: MatchPlanRequest) -> float:
    price_uf = _safe_float(plan.get("price_uf"), 99.0)
    hosp = _safe_float(plan.get("hospital_coverage"), 0.0)
    amb = _safe_float(plan.get("ambulatory_coverage"), 0.0)

    # Heuristica inicial de estabilidad para test.
    estimated_budget_uf = max((payload.income_clp * 0.07) / 38000, 1.0)
    affordability_gap = abs(price_uf - estimated_budget_uf)
    affordability_score = max(0.0, 100.0 - (affordability_gap * 20.0))

    dependents_bonus = min(payload.dependents, 4) * 1.5
    age_adjustment = 2.0 if payload.age < 35 else (1.0 if payload.age < 50 else -1.0)

    final_score = (0.45 * affordability_score) + (0.35 * hosp) + (0.20 * amb) + dependents_bonus + age_adjustment
    return round(max(0.0, min(final_score, 100.0)), 2)


def _has_region_match(plan: dict[str, Any], preferred_region: Optional[str]) -> bool:
    if not preferred_region:
        return False

    expected_region = preferred_region.strip().lower()
    relations = plan.get("plan_clinica") or []
    for relation in relations:
        clinic = relation.get("clinicas") or {}
        clinic_region = clinic.get("region")
        if isinstance(clinic_region, str) and clinic_region.strip().lower() == expected_region:
            return True

    return False


def _build_plan_response(plan: dict, score: float) -> PlanResponse:
    isapre_data = plan.get("isapres") or {}
    return PlanResponse(
        id=str(plan.get("id", "")),
        name=str(plan.get("name", "Plan sin nombre")),
        isapre_name=str(isapre_data.get("name", "Isapre sin nombre")),
        logo_url=str(isapre_data.get("logo_url", "https://via.placeholder.com/150")),
        price_uf=_safe_float(plan.get("price_uf"), 0.0),
        match_score=score,
        hospital_coverage=_safe_float(plan.get("hospital_coverage"), 0.0),
        ambulatory_coverage=_safe_float(plan.get("ambulatory_coverage"), 0.0),
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to the Eligetuplan API"}

@app.get("/api/v1/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/match-plan", response_model=list[PlanResponse])
def match_plan(payload: MatchPlanRequest):
    """
    Core Algorithm Endpoint:
    Receives user JSON payload (age, income, dependents)
    Calculates a mathematical score to return the Top 3 Isapre plans.
    """
    if not supabase:
        return _build_mock_plans()

    try:
        data = (
            supabase
            .table("planes")
            .select(
                "id,name,price_uf,hospital_coverage,ambulatory_coverage,"
                "isapres(name,logo_url),plan_clinica(clinicas(region))"
            )
            .execute()
        )
    except Exception as e:
        print(f"Warning: Database query failed, using mock plans. {e}")
        return _build_mock_plans()

    plans = data.data or []
    if not plans:
        return _build_mock_plans()

    scored = []
    for plan in plans:
        score = _score_plan(plan, payload)
        if _has_region_match(plan, payload.preferred_region):
            score = min(score + 5.0, 100.0)
        scored.append(_build_plan_response(plan, score))

    top_3 = sorted(scored, key=lambda p: p.match_score, reverse=True)[:3]
    return top_3

# ── Nuevos modelos para catálogo de planes ────────────────────────────────────

class IsapreListItem(BaseModel):
    id: str
    name: str
    slug: Optional[str] = None
    logo_url: Optional[str] = None
    plan_count: int = 0
    ges_isapre_uf: Optional[float] = None


class Cobertura(BaseModel):
    pct: int
    clinicas: list[str]


class PlanListItem(BaseModel):
    id: str
    codigo_plan: Optional[str] = None
    name: str
    isapre_name: str
    isapre_slug: Optional[str] = None
    logo_url: Optional[str] = None
    modalidad: Optional[str] = None
    price_uf: float
    base_plan_uf: Optional[float] = None
    ges_isapre_uf: Optional[float] = None
    price_clp: Optional[int] = None
    hospital_coverage: Optional[float] = None
    ambulatory_coverage: Optional[float] = None
    hospitalaria: list[Cobertura] = []
    ambulatoria: list[Cobertura] = []
    con_parto: Optional[bool] = None
    vigente: bool = True
    comercializable: bool = False
    tu7_activo: bool = False
    tipo_plan: Optional[str] = None
    id_zona: Optional[int] = None
    zona_nombre: Optional[str] = None
    pdf_plan: Optional[str] = None
    pdf_url: Optional[str] = None
    fecha_emision: Optional[str] = None


class PriceBucket(BaseModel):
    min_clp: int
    max_clp: int
    count: int


class PlanListResponse(BaseModel):
    items: list[PlanListItem]
    total: int
    page: int
    limit: int
    total_pages: int
    price_min_clp: Optional[int] = None
    price_max_clp: Optional[int] = None
    price_histogram: list[PriceBucket] = []


class ZonaItem(BaseModel):
    id: int
    nombre: str
    plan_count: int = 0


# ── Constantes / helpers ──────────────────────────────────────────────────────

# Isapres activas en 2026
ISAPRES_ACTIVAS = {"cruzblanca", "colmena", "banmedica", "nuevamasvida", "consalud", "vidatres", "esencial"}

# Mapeo ID_ZONA de tu7 → nombre legible
ZONA_MAP: dict[int, str] = {
    1: "Norte",
    3: "Octava",
    4: "Quinta",
    5: "RM",
    6: "Sur",
    8: "Regional - CB | Colmena",
    9: "Centro",
}

# Valor UF en CLP para conversión precio UF → pesos mensuales.
# Configurable vía env var UF_VALUE_CLP. Default: UF oficial abril 2026 ≈ $39,987.
UF_VALUE_CLP = int(os.getenv("UF_VALUE_CLP", "39987"))

# Base URL para servir PDFs descargados
PDF_BASE_URL = os.getenv("PDF_BASE_URL", "http://localhost:8000") + "/pdfs"
PRIORITY_ISAPRE_SLUG = "consalud"
PLAN_BATCH_SIZE = 1000


def _parse_coberturas(text: Optional[str]) -> list[Cobertura]:
    """
    Parsea texto tipo 'X% Clínica A, Clínica B, Y% Clínica C'
    en lista estructurada [{pct, clinicas[]}].
    """
    if not text or not text.strip():
        return []
    matches = list(re.finditer(r"(\d+)%", text))
    if not matches:
        return []
    out: list[Cobertura] = []
    for i, m in enumerate(matches):
        pct = int(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        segment = text[start:end].strip().strip(",").strip()
        if not segment:
            continue
        clinicas = [c.strip() for c in segment.split(",") if c.strip()]
        if clinicas:
            out.append(Cobertura(pct=pct, clinicas=clinicas))
    return out


def _max_pct(cobs: list[Cobertura]) -> Optional[int]:
    return max((c.pct for c in cobs), default=None)


def _uf_to_clp(uf: Optional[float]) -> Optional[int]:
    if uf is None:
        return None
    return int(round(float(uf) * UF_VALUE_CLP))


def _pdf_url(pdf_plan: Optional[str]) -> Optional[str]:
    if not pdf_plan:
        return None
    return f"{PDF_BASE_URL}/{pdf_plan}"


def _build_plan_item(row: dict) -> PlanListItem:
    isapre_data = row.get("isapres") or {}
    hosp = _parse_coberturas(row.get("hospitalaria_texto"))
    amb = _parse_coberturas(row.get("ambulatoria_texto"))
    uf = _safe_float(row.get("base_plan_uf") or row.get("price_uf"), 0.0)
    return PlanListItem(
        id=str(row["id"]),
        codigo_plan=row.get("codigo_plan"),
        name=row.get("name", "Plan sin nombre"),
        isapre_name=isapre_data.get("name", "Isapre desconocida"),
        isapre_slug=isapre_data.get("slug"),
        logo_url=isapre_data.get("logo_url"),
        modalidad=row.get("modalidad"),
        price_uf=uf,
        base_plan_uf=_safe_float(row.get("base_plan_uf"), 0.0) or None,
        ges_isapre_uf=_safe_float(row.get("ges_isapre_uf"), 0.0) or None,
        price_clp=_uf_to_clp(uf),
        hospital_coverage=row.get("hospital_coverage"),
        ambulatory_coverage=row.get("ambulatory_coverage"),
        hospitalaria=hosp,
        ambulatoria=amb,
        con_parto=row.get("con_parto"),
        vigente=row.get("vigente", True),
        comercializable=row.get("comercializable", False),
        tu7_activo=row.get("tu7_activo", False),
        tipo_plan=row.get("tipo_plan"),
        id_zona=row.get("id_zona"),
        zona_nombre=ZONA_MAP.get(row.get("id_zona")) if row.get("id_zona") else None,
        pdf_plan=row.get("pdf_plan"),
        pdf_url=_pdf_url(row.get("pdf_plan")),
        fecha_emision=row.get("fecha_emision"),
    )


def _plan_sort_key(plan: PlanListItem, sort: str) -> tuple:
    priority_rank = 0 if plan.isapre_slug == PRIORITY_ISAPRE_SLUG else 1
    price_value = plan.base_plan_uf if plan.base_plan_uf is not None else plan.price_uf
    name_value = (plan.name or "").lower()

    if sort == "precio_desc":
        return (priority_rank, -price_value, name_value, plan.id)
    if sort == "name_asc":
        return (priority_rank, name_value, price_value, plan.id)
    return (priority_rank, price_value, name_value, plan.id)


def _fetch_filtered_plan_rows(query) -> list[dict]:
    rows: list[dict] = []
    offset = 0

    while True:
        batch = query.range(offset, offset + PLAN_BATCH_SIZE - 1).execute()
        batch_rows = batch.data or []
        rows.extend(batch_rows)

        if len(batch_rows) < PLAN_BATCH_SIZE:
            break

        offset += PLAN_BATCH_SIZE

    return rows

@app.get("/api/v1/isapres", response_model=list[IsapreListItem])
def list_isapres():
    """Lista Isapres activas con conteo de planes y factor GES."""
    if not supabase:
        return []

    isapres_resp = (
        supabase.table("isapres")
        .select("id,name,slug,logo_url")
        .in_("slug", list(ISAPRES_ACTIVAS))
        .execute()
    )
    isapres = isapres_resp.data or []

    count_map: dict[str, int] = {}
    ges_map: dict[str, Optional[float]] = {}
    for i in isapres:
        cnt_resp = (
            supabase.table("planes")
            .select("id", count="exact")
            .eq("tu7_activo", True)
            .eq("isapre_id", i["id"])
            .limit(1)
            .execute()
        )
        count_map[i["id"]] = cnt_resp.count or 0

        ges_resp = (
            supabase.table("planes")
            .select("ges_isapre_uf")
            .eq("tu7_activo", True)
            .eq("isapre_id", i["id"])
            .not_.is_("ges_isapre_uf", "null")
            .limit(1)
            .execute()
        )
        if ges_resp.data:
            ges_map[i["id"]] = _safe_float(ges_resp.data[0].get("ges_isapre_uf"), None)
        else:
            ges_map[i["id"]] = None

    return [
        IsapreListItem(
            id=i["id"],
            name=i["name"],
            slug=i.get("slug"),
            logo_url=i.get("logo_url"),
            plan_count=count_map.get(i["id"], 0),
            ges_isapre_uf=ges_map.get(i["id"]),
        )
        for i in isapres
    ]


# ── GET /api/v1/prestadores ───────────────────────────────────────────────────

@app.get("/api/v1/prestadores", response_model=list[str])
def list_prestadores():
    """Lista única de clínicas mencionadas en coberturas hospitalaria/ambulatoria."""
    if not supabase:
        return []

    prestadores: set[str] = set()
    offset = 0
    page = 1000
    while True:
        r = (
            supabase.table("planes")
            .select("hospitalaria_texto,ambulatoria_texto")
            .eq("tu7_activo", True)
            .range(offset, offset + page - 1)
            .execute()
        )
        if not r.data:
            break
        for row in r.data:
            for txt in (row.get("hospitalaria_texto"), row.get("ambulatoria_texto")):
                if not txt:
                    continue
                for cov in _parse_coberturas(txt):
                    prestadores.update(cov.clinicas)
        if len(r.data) < page:
            break
        offset += page

    return sorted(prestadores, key=lambda s: s.lower())


# ── GET /api/v1/zonas ─────────────────────────────────────────────────────────

@app.get("/api/v1/zonas", response_model=list[ZonaItem])
def list_zonas():
    """Lista zonas geográficas con conteo de planes tu7_activo."""
    if not supabase:
        return []

    result: list[ZonaItem] = []
    for zid, nombre in ZONA_MAP.items():
        cnt = (
            supabase.table("planes")
            .select("id", count="exact")
            .eq("tu7_activo", True)
            .eq("id_zona", zid)
            .limit(1)
            .execute()
        )
        result.append(ZonaItem(id=zid, nombre=nombre, plan_count=cnt.count or 0))
    return result


# ── GET /api/v1/planes ────────────────────────────────────────────────────────

_PLAN_COLUMNS = (
    "id,codigo_plan,name,price_uf,hospital_coverage,ambulatory_coverage,"
    "modalidad,con_parto,vigente,comercializable,tu7_activo,tipo_plan,"
    "fecha_emision,isapre_id,base_plan_uf,ges_isapre_uf,id_zona,"
    "pdf_plan,pdf_local_path,hospitalaria_texto,ambulatoria_texto,"
    "cobertura_hosp_max,cobertura_amb_max,"
    "isapres(name,slug,logo_url)"
)


@app.get("/api/v1/planes", response_model=PlanListResponse)
def list_planes(
    isapre: Optional[str] = Query(None, description="Slug(s) CSV — ej. banmedica,consalud"),
    modalidad: Optional[str] = Query(None, description="Libre Elección | Preferente | Cerrado"),
    zona: Optional[str] = Query(None, description="IDs de zona CSV — ej. 5,6,9"),
    precio_min_clp: Optional[int] = Query(None, ge=0, description="Precio mínimo en CLP"),
    precio_max_clp: Optional[int] = Query(None, ge=0, description="Precio máximo en CLP"),
    cobertura_hosp_min: Optional[int] = Query(None, ge=0, le=100),
    cobertura_amb_min: Optional[int] = Query(None, ge=0, le=100),
    prestador: Optional[str] = Query(None, description="Filtra por nombre de clínica/prestador"),
    con_parto: Optional[bool] = Query(None),
    tu7_activo: bool = Query(True, description="Solo planes activos en tu7 (default)"),
    search: Optional[str] = Query(None, description="Busca en nombre o código"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("precio_asc", description="precio_asc | precio_desc | name_asc"),
):
    """Listado paginado de planes con filtros."""
    if not supabase:
        return PlanListResponse(items=[], total=0, page=page, limit=limit, total_pages=0)

    query = supabase.table("planes").select(_PLAN_COLUMNS, count="exact")

    if tu7_activo:
        query = query.eq("tu7_activo", True)

    if modalidad:
        query = query.eq("modalidad", modalidad)

    if con_parto is not None:
        query = query.eq("con_parto", con_parto)

    # Precio en CLP → convertir a UF para filtro server-side sobre base_plan_uf
    if precio_min_clp is not None:
        query = query.gte("base_plan_uf", precio_min_clp / UF_VALUE_CLP)
    if precio_max_clp is not None:
        query = query.lte("base_plan_uf", precio_max_clp / UF_VALUE_CLP)

    if zona:
        zona_ids = [int(z.strip()) for z in zona.split(",") if z.strip().isdigit()]
        if zona_ids:
            query = query.in_("id_zona", zona_ids)

    if cobertura_hosp_min is not None:
        query = query.gte("cobertura_hosp_max", cobertura_hosp_min)

    if cobertura_amb_min is not None:
        query = query.gte("cobertura_amb_max", cobertura_amb_min)

    if prestador:
        # Prestador matchea texto de coberturas hospitalarias O ambulatorias
        q = prestador.replace(",", "").strip()
        query = query.or_(
            f"hospitalaria_texto.ilike.%{q}%,ambulatoria_texto.ilike.%{q}%"
        )

    # Filtro por isapre slug → resolver IDs
    slugs_filter = (
        [s.strip() for s in isapre.split(",") if s.strip()]
        if isapre else list(ISAPRES_ACTIVAS)
    )
    isapre_resp = supabase.table("isapres").select("id").in_("slug", slugs_filter).execute()
    isapre_ids = [r["id"] for r in (isapre_resp.data or [])]
    if isapre_ids:
        query = query.in_("isapre_id", isapre_ids)
    else:
        return PlanListResponse(items=[], total=0, page=page, limit=limit, total_pages=0)

    if search:
        query = query.or_(f"name.ilike.%{search}%,codigo_plan.ilike.%{search}%")

    filtered_rows = _fetch_filtered_plan_rows(query)
    sorted_items = sorted((_build_plan_item(row) for row in filtered_rows), key=lambda plan: _plan_sort_key(plan, sort))

    total = len(sorted_items)
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    offset = (page - 1) * limit
    items = sorted_items[offset:offset + limit]

    # Rango global + histograma de precios (sobre tu7_activo completo)
    price_min_clp: Optional[int] = None
    price_max_clp: Optional[int] = None
    histogram: list[PriceBucket] = []
    if tu7_activo:
        all_prices = _fetch_all_prices()
        if all_prices:
            price_min_clp = _uf_to_clp(min(all_prices))
            price_max_clp = _uf_to_clp(max(all_prices))
            histogram = _build_histogram(all_prices, bins=24)

    return PlanListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        price_min_clp=price_min_clp,
        price_max_clp=price_max_clp,
        price_histogram=histogram,
    )


def _fetch_all_prices() -> list[float]:
    """Devuelve todos los base_plan_uf de planes tu7_activo (paginado)."""
    if not supabase:
        return []
    prices: list[float] = []
    offset = 0
    page = 1000
    while True:
        r = (
            supabase.table("planes")
            .select("base_plan_uf")
            .eq("tu7_activo", True)
            .not_.is_("base_plan_uf", "null")
            .range(offset, offset + page - 1)
            .execute()
        )
        if not r.data:
            break
        prices.extend(
            float(row["base_plan_uf"])
            for row in r.data
            if row.get("base_plan_uf") is not None
        )
        if len(r.data) < page:
            break
        offset += page
    return prices


def _build_histogram(prices_uf: list[float], bins: int = 24) -> list[PriceBucket]:
    if not prices_uf or bins <= 0:
        return []
    lo, hi = min(prices_uf), max(prices_uf)
    if hi <= lo:
        return [PriceBucket(
            min_clp=_uf_to_clp(lo) or 0,
            max_clp=_uf_to_clp(hi) or 0,
            count=len(prices_uf),
        )]
    width = (hi - lo) / bins
    counts = [0] * bins
    for p in prices_uf:
        idx = min(int((p - lo) / width), bins - 1)
        counts[idx] += 1
    return [
        PriceBucket(
            min_clp=_uf_to_clp(lo + i * width) or 0,
            max_clp=_uf_to_clp(lo + (i + 1) * width) or 0,
            count=c,
        )
        for i, c in enumerate(counts)
    ]


# ── GET /api/v1/planes/{plan_id} ──────────────────────────────────────────────

@app.get("/api/v1/planes/{plan_id}", response_model=PlanListItem)
def get_plan(plan_id: str):
    """Detalle de un plan por ID."""
    if not supabase:
        return PlanListItem(id=plan_id, name="No disponible", isapre_name="N/A", price_uf=0)

    resp = (
        supabase.table("planes")
        .select(_PLAN_COLUMNS)
        .eq("id", plan_id)
        .single()
        .execute()
    )
    return _build_plan_item(resp.data)


# ── Static: servir PDFs descargados ───────────────────────────────────────────
_PDF_DIR = pathlib.Path(__file__).parent / ".cache" / "pdfs"
if _PDF_DIR.exists():
    app.mount("/pdfs", StaticFiles(directory=str(_PDF_DIR)), name="pdfs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
