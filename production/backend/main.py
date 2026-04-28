import math
import os
import pathlib
import re
from typing import Any, Optional
# Force deploy 28-04
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv

# In production, env vars come from Cloud Run or .env file.
# load_dotenv() is safe to call — it only reads .env if it exists.
load_dotenv()

app = FastAPI(
    title="Eligetuplan API",
    description="Backend API for comparing Isapres health plans in Chile",
    version="1.0.0"
)

# CORS Configuration — production origins + localhost for development
CORS_DEFAULTS = (
    "http://localhost:3000,"
    "https://elige-tuplan.cl,"
    "https://www.elige-tuplan.cl,"
    "https://elige-tuplan.vercel.app,"
    "https://landingpage-asesoriasalud.vercel.app"
)
origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", CORS_DEFAULTS).split(",")
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
class CargaInfo(BaseModel):
    sexo: str = "masculino"
    edad: int = 0


class MatchPlanRequest(BaseModel):
    age: int
    income_clp: int
    dependents: int
    preferred_region: Optional[str] = None
    isapre: Optional[str] = None
    current_price_uf: Optional[float] = None
    current_hospital_coverage: Optional[float] = None
    current_ambulatory_coverage: Optional[float] = None
    preference: Optional[str] = "balanced"
    limit: int = 6
    sexo: Optional[str] = None
    tipo: Optional[str] = None
    sexo_pareja: Optional[str] = None
    edad_pareja: Optional[int] = None
    ingreso_pareja_clp: Optional[int] = None
    cargas: Optional[list[CargaInfo]] = None


class ScoreBreakdown(BaseModel):
    """Desglose del composite score para transparencia con el usuario."""
    affordability: float
    coverage: float
    value: float
    extras: float
    weights: dict


class PlanResponse(BaseModel):
    id: str
    name: str
    isapre_name: str
    isapre_slug: Optional[str] = None
    logo_url: str
    price_uf: float
    base_plan_uf: Optional[float] = None
    ges_isapre_uf: Optional[float] = None
    modalidad: Optional[str] = None
    match_score: float
    hospital_coverage: float
    ambulatory_coverage: float
    savings_uf: Optional[float] = None
    savings_clp: Optional[int] = None
    savings_pct: Optional[float] = None
    # Deltas vs plan actual (solo si current_*_coverage llegaron en el request)
    coverage_diff_hosp_pp: Optional[float] = None  # puntos porcentuales
    coverage_diff_amb_pp: Optional[float] = None
    # Posicion en el mercado completo (1854 planes activos, 7 isapres) — 0-100
    market_percentile_value: Optional[float] = None      # cobertura por UF
    market_percentile_coverage: Optional[float] = None   # cobertura combinada
    market_percentile_price: Optional[float] = None      # precio (100 = el mas barato)
    # Conteo concreto: "mejor que X de 1854 planes"
    market_total_plans: Optional[int] = None
    # Desglose del score
    score_breakdown: Optional[ScoreBreakdown] = None
    reason_tag: Optional[str] = None


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


# Pesos del composite por preferencia del usuario.
# 'balanced' = 3B (bueno, bonito, barato).
PREFERENCE_WEIGHTS: dict[str, dict[str, float]] = {
    "savings":  {"afford": 0.55, "coverage": 0.20, "value": 0.20, "extras": 0.05},
    "balanced": {"afford": 0.35, "coverage": 0.35, "value": 0.25, "extras": 0.05},
    "coverage": {"afford": 0.15, "coverage": 0.55, "value": 0.25, "extras": 0.05},
}


def _coverage_combined(plan: dict, payload: "MatchPlanRequest" = None) -> float:
    hosp = _safe_float(plan.get("hospital_coverage"), 0.0)
    amb = _safe_float(plan.get("ambulatory_coverage"), 0.0)
    if payload is None:
        h_weight, a_weight = 0.6, 0.4
    else:
        n_cargas = len(payload.cargas) if payload.cargas else 0
        has_young = any(c.edad < 18 for c in (payload.cargas or []) if c.edad)
        is_couple = (payload.tipo or "solo") == "pareja"
        if has_young or (n_cargas >= 2):
            h_weight, a_weight = 0.45, 0.55
        elif is_couple or n_cargas > 0:
            h_weight, a_weight = 0.50, 0.50
        else:
            h_weight, a_weight = 0.60, 0.40
    return hosp * h_weight + amb * a_weight


def _value_ratio(plan: dict, payload: "MatchPlanRequest" = None) -> float:
    price = _safe_float(plan.get("price_uf"), 0.0) or 0.01
    return _coverage_combined(plan, payload) / price


def _percentile_rank(value: float, sorted_values: list[float], higher_is_better: bool = True) -> float:
    """Percentil de `value` dentro de `sorted_values` (0-100). Si higher_is_better=False
    (ej: precio), invierte (los mas baratos van al 100)."""
    from bisect import bisect_left, bisect_right
    if not sorted_values:
        return 50.0
    below = bisect_left(sorted_values, value)
    equal = bisect_right(sorted_values, value) - below
    pct = (below + 0.5 * equal) / len(sorted_values) * 100.0
    return pct if higher_is_better else (100.0 - pct)


def _score_plans_against_market(
    plans: list[dict],
    payload: "MatchPlanRequest",
) -> list[dict]:
    """
    Scoring estadistico multi-objetivo, perfil-aware. Pondera segun payload.preference:
      - 'savings'  -> prioriza precio bajo
      - 'balanced' -> equilibrio (3B: bueno, bonito, barato)
      - 'coverage' -> prioriza cobertura, sin penalizar tanto precio

    Perfil-aware:
      - Affordability usa ingreso familiar (titular + pareja)
      - Age/sexo factor ajustado al perfil demografico
      - Dependents factor pondera por edad de cargas
      - Coverage weights se adaptan al tipo familiar
    """
    if not plans:
        return []

    weights = PREFERENCE_WEIGHTS.get(
        (payload.preference or "balanced").lower(),
        PREFERENCE_WEIGHTS["balanced"],
    )

    tipo = (payload.tipo or "solo").strip().lower()
    sexo = (payload.sexo or "masculino").strip().lower()

    household_income_clp = payload.income_clp or 0
    if tipo == "pareja" and payload.ingreso_pareja_clp:
        household_income_clp += payload.ingreso_pareja_clp

    income_uf = household_income_clp / UF_VALUE_CLP
    legal_floor = income_uf * 0.07
    affordable_max = income_uf * 0.15

    is_couple = tipo == "pareja"
    n_cargas = len(payload.cargas) if payload.cargas else 0

    sorted_value = sorted(_value_ratio(p, payload) for p in plans)
    sorted_coverage = sorted(_coverage_combined(p, payload) for p in plans)
    sorted_price = sorted(_safe_float(p.get("price_uf"), 0.0) for p in plans)
    market_total = len(plans)

    out: list[dict] = []
    for plan in plans:
        price_uf = _safe_float(plan.get("price_uf"), 0.0) or 0.01
        hosp = _safe_float(plan.get("hospital_coverage"), 0.0)
        amb = _safe_float(plan.get("ambulatory_coverage"), 0.0)
        coverage_raw = _coverage_combined(plan, payload)

        # 1. Asequibilidad (ingreso familiar)
        if income_uf <= 0 or price_uf <= legal_floor:
            afford = 100.0
        elif price_uf <= affordable_max:
            span = max(affordable_max - legal_floor, 1e-6)
            afford = 100.0 - 60.0 * (price_uf - legal_floor) / span
        else:
            over = price_uf - affordable_max
            afford = max(0.0, 40.0 - over * 8.0)

        # 2. Cobertura (con pesos adaptativos segun perfil)
        coverage = min(coverage_raw, 100.0)

        # 3. Valor (percentil de cobertura/UF en el mercado)
        value_pct = _percentile_rank(_value_ratio(plan, payload), sorted_value)

        # 4. Extras (region + dependientes perfil-aware + edad/sexo)
        region = 50.0 + (50.0 if _has_region_match(plan, payload.preferred_region) else 0.0)

        # Dependents: peso por edad de cada carga
        carga_weight_total = 0.0
        if payload.cargas:
            for c in payload.cargas:
                c_age = c.edad if c.edad else 10
                if c_age < 18:
                    carga_weight_total += 0.7
                elif c_age <= 35:
                    carga_weight_total += 1.0
                elif c_age <= 50:
                    carga_weight_total += 1.2
                else:
                    carga_weight_total += 1.4
        carga_bonus = min(carga_weight_total, 4.0) * 12.5

        # Age/sexo factor
        age = payload.age or 30
        if sexo == "femenino":
            age_factor = 55.0 if age < 35 else (45.0 if age < 50 else 35.0)
        else:
            age_factor = 60.0 if age < 35 else (50.0 if age < 50 else 35.0)

        # Pareja bonus: si es pareja, los planes con mejor cobertura familiar puntuan mas
        pareja_bonus = 5.0 if is_couple else 0.0

        extras = min((region + carga_bonus + age_factor + pareja_bonus) / 3.5, 100.0)

        composite = (
            weights["afford"]   * afford +
            weights["coverage"] * coverage +
            weights["value"]    * value_pct +
            weights["extras"]   * extras
        )
        composite = round(max(0.0, min(composite, 100.0)), 2)

        # Reason tag
        reason_tag = _build_reason_tag(payload, plan, afford, coverage, price_uf, is_couple, n_cargas)

        # Percentiles de mercado
        market_pct_value = round(_percentile_rank(_value_ratio(plan, payload), sorted_value), 1)
        market_pct_coverage = round(_percentile_rank(coverage_raw, sorted_coverage), 1)
        market_pct_price = round(_percentile_rank(price_uf, sorted_price, higher_is_better=False), 1)

        breakdown = {
            "affordability": round(afford, 2),
            "coverage": round(coverage, 2),
            "value": round(value_pct, 2),
            "extras": round(extras, 2),
            "weights": weights,
        }

        out.append({
            "plan": plan,
            "composite": composite,
            "breakdown": breakdown,
            "market_pct_value": market_pct_value,
            "market_pct_coverage": market_pct_coverage,
            "market_pct_price": market_pct_price,
            "market_total": market_total,
            "reason_tag": reason_tag,
        })

    return out


REGION_LABELS = {
    "rm": "Region Metropolitana",
    "valparaiso": "Valparaiso",
    "biobio": "Biobio",
    "araucania": "La Araucania",
    "loslagos": "Los Lagos",
    "otra": "tu region",
}


def _build_reason_tag(
    payload: "MatchPlanRequest",
    plan: dict,
    afford: float,
    coverage: float,
    price_uf: float,
    is_couple: bool,
    n_cargas: int,
) -> str:
    """Genera una frase corta de justificacion personalizada para el perfil del usuario."""
    parts = []
    sexo = (payload.sexo or "masculino").strip().lower()
    age = payload.age or 30

    if sexo == "femenino":
        if age < 35:
            parts.append("mujer joven")
        elif age < 50:
            parts.append("mujer en edad reproductiva")
        else:
            parts.append("mujer 50+")
    else:
        if age < 35:
            parts.append("hombre joven")
        elif age < 50:
            parts.append("hombre en plenitud")
        else:
            parts.append("hombre 50+")

    if is_couple:
        parts.append("con pareja")
    if n_cargas > 0:
        parts.append(f"con {n_cargas} carga{'s' if n_cargas > 1 else ''}")

    region_key = (payload.preferred_region or "").strip().lower()
    region_label = REGION_LABELS.get(region_key)
    if region_label:
        parts.append(f"en {region_label}")

    if afford >= 80 and coverage >= 70:
        parts.append("gran valor")
    elif afford >= 70:
        parts.append("precio accesible")
    elif coverage >= 75:
        parts.append("cobertura destacada")

    return " — ".join(parts[:3]) if len(parts) > 3 else " — ".join(parts)


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


def _build_plan_response(
    plan: dict,
    score: float,
    payload: Optional[MatchPlanRequest] = None,
    market_data: Optional[dict] = None,
) -> PlanResponse:
    """
    Construye la respuesta enriquecida con metricas de justificacion:
      - savings_*: deltas de precio vs plan actual
      - coverage_diff_*_pp: deltas de cobertura vs plan actual
      - market_percentile_*: posicion vs los 1854 planes activos del mercado
      - score_breakdown: desglose del composite score por componente
    """
    isapre_data = plan.get("isapres") or {}
    price = _safe_float(plan.get("price_uf"), 0.0)
    hosp = _safe_float(plan.get("hospital_coverage"), 0.0)
    amb = _safe_float(plan.get("ambulatory_coverage"), 0.0)

    # Deltas vs plan actual (precio)
    savings_uf = None
    savings_clp = None
    savings_pct = None
    if payload and payload.current_price_uf is not None and payload.current_price_uf > 0:
        diff = payload.current_price_uf - price
        savings_uf = round(diff, 2)
        savings_clp = int(round(diff * UF_VALUE_CLP))
        savings_pct = round(diff / payload.current_price_uf * 100, 1)

    # Deltas vs plan actual (cobertura)
    coverage_diff_hosp = None
    coverage_diff_amb = None
    if payload and payload.current_hospital_coverage is not None:
        coverage_diff_hosp = round(hosp - payload.current_hospital_coverage, 1)
    if payload and payload.current_ambulatory_coverage is not None:
        coverage_diff_amb = round(amb - payload.current_ambulatory_coverage, 1)

    # Datos de mercado (si vienen)
    market_pct_value = market_pct_coverage = market_pct_price = None
    market_total = None
    breakdown = None
    if market_data:
        market_pct_value = market_data.get("market_pct_value")
        market_pct_coverage = market_data.get("market_pct_coverage")
        market_pct_price = market_data.get("market_pct_price")
        market_total = market_data.get("market_total")
        bk = market_data.get("breakdown") or {}
        breakdown = ScoreBreakdown(
            affordability=bk.get("affordability", 0.0),
            coverage=bk.get("coverage", 0.0),
            value=bk.get("value", 0.0),
            extras=bk.get("extras", 0.0),
            weights=bk.get("weights", {}),
        )

    reason_tag = market_data.get("reason_tag") if market_data else None

    return PlanResponse(
        id=str(plan.get("id", "")),
        name=str(plan.get("name", "Plan sin nombre")),
        isapre_name=str(isapre_data.get("name", "Isapre sin nombre")),
        isapre_slug=isapre_data.get("slug"),
        logo_url=str(isapre_data.get("logo_url", "https://via.placeholder.com/150")),
        price_uf=price,
        base_plan_uf=_safe_float(plan.get("base_plan_uf"), 0.0) or None,
        ges_isapre_uf=_safe_float(plan.get("ges_isapre_uf"), 0.0) or None,
        modalidad=plan.get("modalidad"),
        match_score=score,
        hospital_coverage=hosp,
        ambulatory_coverage=amb,
        savings_uf=savings_uf,
        savings_clp=savings_clp,
        savings_pct=savings_pct,
        coverage_diff_hosp_pp=coverage_diff_hosp,
        coverage_diff_amb_pp=coverage_diff_amb,
        market_percentile_value=market_pct_value,
        market_percentile_coverage=market_pct_coverage,
        market_percentile_price=market_pct_price,
        market_total_plans=market_total,
        score_breakdown=breakdown,
        reason_tag=reason_tag,
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
    - Trae TODO el mercado activo (tu7_activo=TRUE, ~1854 planes).
    - Score estadistico multi-objetivo contra el mercado completo: cada plan
      obtiene su composite y sus percentiles vs los 1854.
    - Filtra los resultados a la Isapre de prioridad (Consalud) salvo que
      payload.isapre venga explicito (ej: para debug o features futuras).
    - Devuelve top-K Consalud con metricas de justificacion completas:
      deltas vs plan actual + percentiles de mercado + breakdown del score.

    El sesgo a Consalud es intencional (modelo de negocio): la justificacion
    cuantitativa muestra POR QUE este plan de Consalud es competitivo
    incluso comparado contra los 1854 del mercado.
    """
    print(
        f"DEBUG [match-plan] Payload recibido: "
        f"age={payload.age} sexo={payload.sexo} tipo={payload.tipo} "
        f"income_clp={payload.income_clp} ingreso_pareja_clp={payload.ingreso_pareja_clp} "
        f"dependents={payload.dependents} cargas={len(payload.cargas) if payload.cargas else 0} "
        f"preferred_region={payload.preferred_region} isapre={payload.isapre} "
        f"preference={payload.preference!r} limit={payload.limit} "
        f"current_price_uf={payload.current_price_uf} "
        f"current_hospital_coverage={payload.current_hospital_coverage} "
        f"current_ambulatory_coverage={payload.current_ambulatory_coverage}"
    )

    if not supabase:
        return _build_mock_plans()

    select_cols = (
        "id,name,price_uf,hospital_coverage,ambulatory_coverage,"
        "base_plan_uf,ges_isapre_uf,modalidad,isapre_id,"
        "isapres(id,name,slug,logo_url),plan_clinica(clinicas(region))"
    )

    try:
        # tu7_activo = TRUE: solo planes vivos en el mercado actual
        query = supabase.table("planes").select(select_cols).eq("tu7_activo", True)
        plans = _fetch_filtered_plan_rows(query)
    except Exception as e:
        print(f"Warning: Database query failed, using mock plans. {e}")
        return _build_mock_plans()

    if not plans:
        return _build_mock_plans()

    # 1) Scorear todo el mercado (necesario para que los percentiles sean reales)
    scored_market = _score_plans_against_market(plans, payload)

    # 2) Determinar el slug objetivo (Consalud por defecto).
    target_slug = PRIORITY_ISAPRE_SLUG
    if payload.isapre:
        target_slug = payload.isapre.strip().lower()

    # 3) Filtrar ESTRICTO por isapre slug (Consalud por defecto).

    target_pool = [
        item for item in scored_market
        if (item["plan"].get("isapres") or {}).get("slug", "").lower() == target_slug
    ]

    print(
        f"INFO [match-plan] target_slug={target_slug} matcheo {len(target_pool)} planes "
        f"de {len(scored_market)} en el mercado. "
        f"preference={payload.preference!r} current_price_uf={payload.current_price_uf} "
        f"current_hospital_coverage={payload.current_hospital_coverage} "
        f"current_ambulatory_coverage={payload.current_ambulatory_coverage}"
    )

    if not target_pool:
        observed_slugs = sorted({(item["plan"].get("isapres") or {}).get("slug", "") for item in scored_market})[:10]
        print(
            f"WARN [match-plan] Sin planes para target_slug={target_slug}. "
            f"Slugs vistos en mercado: {observed_slugs}. Devolviendo []."
        )
        return []

    preference = (payload.preference or "balanced").strip().lower()
    full_consalud_pool = list(target_pool)

    if preference == "savings" and payload.current_price_uf and payload.current_price_uf > 0:
        cheaper = [
            item for item in target_pool
            if _safe_float(item["plan"].get("price_uf"), 99.0) < payload.current_price_uf
        ]
        print(
            f"DEBUG [match-plan] savings filter: current_price_uf={payload.current_price_uf} "
            f"pool_before={len(target_pool)} cheaper={len(cheaper)} "
            f"cheaper_prices={[_safe_float(i['plan'].get('price_uf'), 99.0) for i in cheaper[:5]]}"
        )
        target_pool = cheaper if cheaper else full_consalud_pool
        if not cheaper:
            print(
                f"WARN [match-plan] savings filter vacio: ningun plan Consalud < {payload.current_price_uf} UF. "
                f"Usando pool completo ({len(full_consalud_pool)} planes)."
            )

    elif preference == "coverage" and (
        payload.current_hospital_coverage is not None
        and payload.current_ambulatory_coverage is not None
    ):
        cur_combined = _coverage_combined(
            {"hospital_coverage": payload.current_hospital_coverage, "ambulatory_coverage": payload.current_ambulatory_coverage},
            payload,
        )
        better = [
            item for item in target_pool
            if _coverage_combined(item["plan"], payload) > cur_combined
        ]
        print(
            f"DEBUG [match-plan] coverage filter: current_combined={cur_combined:.1f} "
            f"pool_before={len(target_pool)} better={len(better)}"
        )
        target_pool = better if better else full_consalud_pool
        if not better:
            print(
                f"WARN [match-plan] coverage filter vacio: ningun plan Consalud con cobertura > {cur_combined:.1f}. "
                f"Usando pool completo ({len(full_consalud_pool)} planes)."
            )

    if preference == "savings":
        target_pool.sort(key=lambda x: (
            _safe_float(x["plan"].get("price_uf"), 99.0),
            -x["composite"],
        ))
    elif preference == "coverage":
        target_pool.sort(key=lambda x: (
            -_coverage_combined(x["plan"], payload),
            -x["composite"],
        ))
    else:
        target_pool.sort(key=lambda x: -x["composite"])

    if target_pool:
        top_price = _safe_float(target_pool[0]["plan"].get("price_uf"), 99.0)
        print(
            f"DEBUG [match-plan] After sort (preference={preference}): "
            f"top_plan={target_pool[0]['plan'].get('name', '?')} "
            f"top_price={top_price} "
            f"pool_size={len(target_pool)}"
        )

    # 6) Sanity check post-orden — log si el contrato no se cumple
    top = target_pool[0]["plan"] if target_pool else None
    if top and preference == "savings" and payload.current_price_uf:
        top_price = _safe_float(top.get("price_uf"), 99.0)
        if top_price >= payload.current_price_uf:
            print(
                f"WARN [match-plan] preference=savings pero top_price={top_price} >= "
                f"current_price={payload.current_price_uf} (no hay Consalud mas barato)"
            )
    if top and preference == "coverage" and payload.current_hospital_coverage is not None:
        top_cov = _coverage_combined(top, payload)
        cur_cov = _coverage_combined(
            {"hospital_coverage": payload.current_hospital_coverage, "ambulatory_coverage": payload.current_ambulatory_coverage or 0},
            payload,
        )
        if top_cov <= cur_cov:
            print(
                f"WARN [match-plan] preference=coverage pero top_cov={top_cov:.1f} <= "
                f"current_cov={cur_cov:.1f} (no hay Consalud con mas cobertura)"
            )

    limit = min(payload.limit, 20)
    return [
        _build_plan_response(item["plan"], item["composite"], payload, market_data=item)
        for item in target_pool[:limit]
    ]

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
# Fallback hardcodeado al UUID de Consalud (override via env var si la BD cambia).
PRIORITY_ISAPRE_ID = os.getenv(
    "PRIORITY_ISAPRE_ID",
    "2308d796-d11c-4324-b748-89f7686a9af4",
)

# Cache lazy del ID resuelto desde la tabla isapres por slug.
# Es la fuente mas confiable: cada Supabase tiene su propio UUID, pero el
# slug "consalud" deberia ser invariante entre proyectos.
_RESOLVED_CONSALUD_ID: Optional[str] = None


def _get_consalud_id() -> str:
    """Resuelve el isapre_id de Consalud por slug, cacheando el resultado.
    Si el slug no existe (BD distinta), cae al PRIORITY_ISAPRE_ID hardcodeado.
    """
    global _RESOLVED_CONSALUD_ID
    if _RESOLVED_CONSALUD_ID:
        return _RESOLVED_CONSALUD_ID
    if supabase:
        try:
            resp = (
                supabase.table("isapres")
                .select("id,slug")
                .ilike("slug", PRIORITY_ISAPRE_SLUG)
                .limit(1)
                .execute()
            )
            if resp.data:
                _RESOLVED_CONSALUD_ID = resp.data[0]["id"]
                print(f"INFO [isapre-resolver] Consalud resuelto a id={_RESOLVED_CONSALUD_ID}")
                return _RESOLVED_CONSALUD_ID
            else:
                print(
                    f"WARN [isapre-resolver] Slug '{PRIORITY_ISAPRE_SLUG}' no encontrado "
                    f"en tabla isapres. Usando fallback {PRIORITY_ISAPRE_ID}."
                )
        except Exception as e:
            print(f"WARN [isapre-resolver] Error: {e}. Usando fallback {PRIORITY_ISAPRE_ID}.")
    return PRIORITY_ISAPRE_ID
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


import random as _random


def _interleaved_plan_list(plans: list["PlanListItem"], sort: str, page_size: int) -> list["PlanListItem"]:
    """Distribute Consalud plans at top/middle/bottom of each page.

    Priority positions within a page of size 21:
        [0, 1, 2, 5, 8, 11, 13, 16, 20]  → 9 / 21 ≈ 43 %

    For other page sizes the positions scale proportionally.
    Non-Consalud plans are shuffled deterministically and fill the gaps.
    """
    PRIORITY = PRIORITY_ISAPRE_SLUG

    priority_plans: list[PlanListItem] = [p for p in plans if p.isapre_slug == PRIORITY]
    other_plans: list[PlanListItem] = [p for p in plans if p.isapre_slug != PRIORITY]

    if not priority_plans:
        return other_plans
    if not other_plans:
        return priority_plans

    # Secondary sort for priority plans (cheapest first = default)
    def _secondary(p: PlanListItem) -> tuple:
        price = p.base_plan_uf if p.base_plan_uf is not None else p.price_uf
        name_val = (p.name or "").lower()
        if sort == "precio_desc":
            return (-price, name_val, p.id)
        if sort == "name_asc":
            return (name_val, price, p.id)
        return (price, name_val, p.id)

    priority_plans.sort(key=_secondary)

    # Deterministic shuffle for other plans → "al azar"
    rng = _random.Random(42)
    rng.shuffle(other_plans)

    total = len(priority_plans) + len(other_plans)
    result: list[Optional["PlanListItem"]] = [None] * total  # type: ignore[name-defined]

    # Base positions for page_size = 21
    _BASE = 21
    _BASE_POS = [0, 1, 2, 5, 8, 11, 13, 16, 20]
    prio_positions = sorted({int(p * page_size / _BASE) for p in _BASE_POS})

    num_pages = (total + page_size - 1) // page_size
    all_slots: list[int] = []
    for page in range(num_pages):
        base = page * page_size
        for pos in prio_positions:
            abs_pos = base + pos
            if abs_pos < total:
                all_slots.append(abs_pos)

    # Place priority plans at calculated slots
    pi = 0
    for slot in all_slots:
        if pi < len(priority_plans):
            result[slot] = priority_plans[pi]
            pi += 1

    # Overflow priority plans fill remaining empty slots
    for i in range(total):
        if result[i] is None and pi < len(priority_plans):
            result[i] = priority_plans[pi]
            pi += 1

    # Fill the rest with other plans
    oi = 0
    for i in range(total):
        if result[i] is None and oi < len(other_plans):
            result[i] = other_plans[oi]
            oi += 1

    return [p for p in result if p is not None]


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
    all_items = [_build_plan_item(row) for row in filtered_rows]
    interleaved = _interleaved_plan_list(all_items, sort, limit)

    total = len(interleaved)
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    offset = (page - 1) * limit
    items = interleaved[offset:offset + limit]

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


# ── GET /api/v1/plans-autocomplete ────────────────────────────────────────────

class PlanAutocompleteItem(BaseModel):
    id: str
    name: str
    codigo_plan: Optional[str] = None
    price_uf: float
    hospital_coverage: Optional[float] = None
    ambulatory_coverage: Optional[float] = None
    modalidad: Optional[str] = None
    isapre_name: str = ""


@app.get("/api/v1/plans-autocomplete", response_model=list[PlanAutocompleteItem])
def plans_autocomplete(
    isapre: str = Query(..., description="Slug de la Isapre, ej. consalud"),
    search: Optional[str] = Query(None, description="Texto de busqueda"),
    limit: int = Query(50, ge=1, le=200),
):
    """Busca planes de una Isapre para autocompletar. Retorna datos reales."""
    if not supabase:
        return []

    isapre_resp = (
        supabase.table("isapres")
        .select("id,name")
        .eq("slug", isapre)
        .execute()
    )
    if not isapre_resp.data:
        return []

    isapre_id = isapre_resp.data[0]["id"]
    isapre_name = isapre_resp.data[0]["name"]

    query = (
        supabase.table("planes")
        .select("id,name,codigo_plan,price_uf,hospital_coverage,ambulatory_coverage,modalidad")
        .eq("isapre_id", isapre_id)
        .eq("tu7_activo", True)
    )

    if search:
        query = query.ilike("name", f"%{search}%")

    query = query.order("price_uf").limit(limit)

    resp = query.execute()
    rows = resp.data or []

    return [
        PlanAutocompleteItem(
            id=str(r["id"]),
            name=str(r.get("name", "")),
            codigo_plan=r.get("codigo_plan"),
            price_uf=_safe_float(r.get("price_uf"), 0.0),
            hospital_coverage=r.get("hospital_coverage"),
            ambulatory_coverage=r.get("ambulatory_coverage"),
            modalidad=r.get("modalidad"),
            isapre_name=isapre_name,
        )
        for r in rows
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
    _backend_dir = str(pathlib.Path(__file__).parent)
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[_backend_dir],
        reload_includes=["*.py"],
        reload_excludes=["__pycache__", "*.pyc", "debug_*", "test_*"],
    )
