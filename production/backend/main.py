import math
import os
import pathlib
import re
import sys
import threading
import time
import unicodedata
from typing import Any, Optional


def _norm(s: Optional[str]) -> str:
    """Normaliza texto para matching: minusculas + sin acentos."""
    if not s:
        return ""
    nfkd = unicodedata.normalize("NFKD", s)
    no_accents = "".join(c for c in nfkd if not unicodedata.combining(c))
    return no_accents.lower()

from fastapi import FastAPI, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from supabase import create_client, Client
from dotenv import load_dotenv


# ── TTL Cache ──────────────────────────────────────────────────────────────────

class _TTLCache:
    """Simple in-memory TTL cache. Thread-safe for read-heavy workloads."""
    def __init__(self, ttl: int = 300):
        self.ttl = ttl
        self._data: dict[str, Any] = {}
        self._times: dict[str, float] = {}

    def get(self, key: str):
        row = self._data.get(key)
        if row is not None and time.time() - self._times.get(key, 0) < self.ttl:
            return row
        if row is not None:
            del self._data[key]
            del self._times[key]
        return None

    def set(self, key: str, value: Any):
        self._data[key] = value
        self._times[key] = time.time()

    def invalidate(self, key: str):
        self._data.pop(key, None)
        self._times.pop(key, None)

    def clear(self):
        self._data.clear()
        self._times.clear()


# TTL de 30 min para los cachés de datos pesados: los planes cambian ~2 veces al
# mes (sync) — un TTL corto solo provocaba reconstrucciones frías innecesarias de
# los ~2.160 PlanListItem. La UF tiene su propio caché (1h) aparte.
_LIST_PLANS_CACHE = _TTLCache(ttl=1800)    # 30 min — plan list for /api/v1/planes
_PRICES_CACHE = _TTLCache(ttl=1800)        # 30 min — price histogram
_ISAPRES_CACHE = _TTLCache(ttl=3600)       # 1 h  — isapres + counts
_ZONAS_CACHE = _TTLCache(ttl=3600)         # 1 h  — zonas + counts
_PRESTADORES_CACHE = _TTLCache(ttl=3600)   # 1 h  — prestadores list
_MATCH_PLANS_CACHE = _TTLCache(ttl=1800)   # 30 min — plan list for match-plan
_PLAN_ITEMS_CACHE = _TTLCache(ttl=1800)    # 30 min — built PlanListItem list


# Load environment variables
load_dotenv()

app = FastAPI(
    title="Eligetuplan API",
    description="Backend API for comparing Isapres health plans in Chile",
    version="1.0.0"
)

# CORS Configuration — development + production origins
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

# Nota: el pre-warm de cachés al arranque vive en `_start_warm` (al final del archivo),
# que precalienta TODOS los cachés en un daemon thread.

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
    # Base + GES del plan actual: si llegan, el backend valoriza el plan actual con la
    # MISMA fórmula familiar (base × Σfactores + GES × N) para un ahorro comparable.
    current_base_plan_uf: Optional[float] = None
    current_ges_isapre_uf: Optional[float] = None
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
    # Desglose del precio personalizado: price_uf = base_plan_uf × suma_factores + ges × n_beneficiarios
    suma_factores: Optional[float] = None
    n_beneficiarios: Optional[int] = None
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


# Tabla de factores de riesgo tu7 (post-reforma 2020, unisex). (edad, tipo) → multiplicador.
# Fuente de verdad compartida con el frontend (lib/factores.ts). Mantener en sync.
_FACTORES_TABLE: list[tuple[int, int, float, float]] = [
    (0, 1, 0.0, 0.0),
    (2, 19, 0.6, 0.6),
    (20, 24, 0.9, 0.7),
    (25, 34, 1.0, 0.7),
    (35, 44, 1.3, 0.9),
    (45, 54, 1.4, 1.0),
    (55, 64, 2.0, 1.4),
    (65, 100, 2.4, 2.2),
]


def _factor_for(edad: Optional[int], tipo: str) -> float:
    """Multiplicador de riesgo por edad y tipo ('cotizante' | 'carga')."""
    if edad is None or edad < 0:
        return 0.0
    for lo, hi, cot, car in _FACTORES_TABLE:
        if lo <= edad <= hi:
            return cot if tipo == "cotizante" else car
    # Edades > 100 caen en el último tramo (65-100).
    return _FACTORES_TABLE[-1][2] if tipo == "cotizante" else _FACTORES_TABLE[-1][3]


def _household_factors(payload: "MatchPlanRequest") -> tuple[float, int]:
    """Σ factores y N° beneficiarios de un plan FAMILIAR compartido:
    titular = cotizante, pareja = carga, cada carga = carga."""
    suma = _factor_for(payload.age or 30, "cotizante")
    n = 1
    if (payload.tipo or "solo").strip().lower() == "pareja":
        suma += _factor_for(payload.edad_pareja or 30, "carga")
        n += 1
    for c in (payload.cargas or []):
        suma += _factor_for(c.edad or 10, "carga")
        n += 1
    return suma, n


def _personalized_price_uf(plan: dict, suma_factores: float, n_benef: int) -> float:
    """Precio REAL que pagaría la familia: base × Σfactores + GES × N. Fórmula tu7
    (idéntica a calcularPrecioPlanUF del frontend). Fallback al price_uf crudo si
    no hay base o si no hay factores (perfil vacío)."""
    base = _safe_float(plan.get("base_plan_uf"), 0.0) or _safe_float(plan.get("price_uf"), 0.0)
    ges = _safe_float(plan.get("ges_isapre_uf"), 0.0)
    if suma_factores <= 0:
        return _safe_float(plan.get("price_uf"), 0.0)
    return base * suma_factores + ges * n_benef


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


def _value_ratio(plan: dict, payload: "MatchPlanRequest" = None, price: Optional[float] = None) -> float:
    p = price if price is not None else _safe_float(plan.get("price_uf"), 0.0)
    p = p or 0.01
    return _coverage_combined(plan, payload) / p


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

    uf_value = _get_uf_value()
    household_income_clp = payload.income_clp or 0
    if tipo == "pareja" and payload.ingreso_pareja_clp:
        household_income_clp += payload.ingreso_pareja_clp

    income_uf = household_income_clp / uf_value

    # Piso legal = 7% obligatorio con TOPE IMPONIBLE por cotizante (90 UF c/u en 2026):
    # una renta sobre el tope cotiza solo hasta el tope, no sobre el total. Se aplica por
    # cotizante (titular y, si hay, pareja). affordable_max (15%) es una heurística de gasto
    # discrecional, NO una cotización legal → se mantiene sobre el ingreso real, sin tope.
    tope_uf = _get_tope_imponible_uf()
    titular_imponible_uf = min((payload.income_clp or 0) / uf_value, tope_uf)
    legal_floor = titular_imponible_uf * 0.07
    if tipo == "pareja" and payload.ingreso_pareja_clp:
        pareja_imponible_uf = min(payload.ingreso_pareja_clp / uf_value, tope_uf)
        legal_floor += pareja_imponible_uf * 0.07
    affordable_max = income_uf * 0.15

    is_couple = tipo == "pareja"
    n_cargas = len(payload.cargas) if payload.cargas else 0

    # Precio REAL por familia: base × Σfactores + GES × N (fórmula tu7). El scoring y
    # los percentiles se calculan sobre ESTE precio, no el crudo, para que la
    # recomendación refleje lo que la persona realmente pagaría.
    suma_factores, n_benef = _household_factors(payload)
    priced = [(p, _personalized_price_uf(p, suma_factores, n_benef)) for p in plans]

    sorted_value = sorted(_value_ratio(p, payload, pr) for p, pr in priced)
    sorted_coverage = sorted(_coverage_combined(p, payload) for p in plans)
    sorted_price = sorted(pr for _, pr in priced)
    market_total = len(plans)

    out: list[dict] = []
    for plan, price_uf in priced:
        price_uf = price_uf or 0.01
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

        # 3. Valor (percentil de cobertura/UF en el mercado, con precio real)
        value_pct = _percentile_rank(_value_ratio(plan, payload, price_uf), sorted_value)

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

        # Percentiles de mercado (sobre el precio real personalizado)
        market_pct_value = round(_percentile_rank(_value_ratio(plan, payload, price_uf), sorted_value), 1)
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
            "personalized_price_uf": round(price_uf, 2),
            "suma_factores": round(suma_factores, 2),
            "n_beneficiarios": n_benef,
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
    # Precio personalizado (base × Σfactores + GES × N) si el scorer lo calculó;
    # fallback al price_uf crudo. Es el precio real que se muestra y compara.
    price = _safe_float((market_data or {}).get("personalized_price_uf"), 0.0) or _safe_float(plan.get("price_uf"), 0.0)
    hosp = _safe_float(plan.get("hospital_coverage"), 0.0)
    amb = _safe_float(plan.get("ambulatory_coverage"), 0.0)

    # Deltas vs plan actual (precio)
    savings_uf = None
    savings_clp = None
    savings_pct = None
    if payload and payload.current_price_uf is not None and payload.current_price_uf > 0:
        diff = payload.current_price_uf - price
        savings_uf = round(diff, 2)
        savings_clp = int(round(diff * _get_uf_value()))
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
        suma_factores=(market_data or {}).get("suma_factores"),
        n_beneficiarios=(market_data or {}).get("n_beneficiarios"),
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


def _flush_all_caches() -> dict:
    """Vacía todos los cachés en memoria. Lo llama el workflow de sync tras
    actualizar Supabase para que los cambios (precios, planes nuevos/eliminados)
    se vean al instante, sin esperar el TTL de 30 min ni un redeploy."""
    caches = {
        "list_plans": _LIST_PLANS_CACHE,
        "prices": _PRICES_CACHE,
        "isapres": _ISAPRES_CACHE,
        "zonas": _ZONAS_CACHE,
        "prestadores": _PRESTADORES_CACHE,
        "prestadores_v2": _PRESTADORES_V2_CACHE,
        "match_plans": _MATCH_PLANS_CACHE,
        "plan_items": _PLAN_ITEMS_CACHE,
    }
    cleared = []
    for name, c in caches.items():
        try:
            c.clear()
            cleared.append(name)
        except Exception:
            pass
    # UF: forzar re-fetch en la próxima lectura (su caché es un dict aparte).
    _uf_cache["ts"] = 0.0
    cleared.append("uf")
    return {"cleared": cleared}


@app.post("/api/v1/admin/flush-cache")
def flush_cache(x_admin_token: Optional[str] = Header(default=None, alias="X-Admin-Token")):
    """Invalida los cachés en memoria. Protegido por token (env CACHE_FLUSH_TOKEN).
    Lo usa el cron de sync para reflejar cambios de la base al instante. Si la env
    var no está seteada, el endpoint queda DESHABILITADO (503) por seguridad."""
    expected = os.getenv("CACHE_FLUSH_TOKEN", "").strip()
    if not expected:
        raise HTTPException(status_code=503, detail="flush-cache deshabilitado (falta CACHE_FLUSH_TOKEN)")
    if not x_admin_token or x_admin_token.strip() != expected:
        raise HTTPException(status_code=401, detail="token invalido")
    return {"ok": True, **_flush_all_caches()}

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

    try:
        plans = _get_cached_match_plan_rows()
    except Exception as e:
        print(f"Warning: Database query failed, using mock plans. {e}")
        return _build_mock_plans()

    if not plans:
        return _build_mock_plans()

    # 0) Valorizar el plan ACTUAL con la MISMA fórmula familiar (base × Σfactores +
    #    GES × N) si llegaron base+GES. Así el ahorro compara precio real vs precio
    #    real. Si solo llegó current_price_uf (entrada manual), se usa tal cual.
    if payload.current_base_plan_uf and payload.current_base_plan_uf > 0:
        _suma, _n = _household_factors(payload)
        payload.current_price_uf = round(
            payload.current_base_plan_uf * _suma + (payload.current_ges_isapre_uf or 0.0) * _n, 2
        )

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
            if _safe_float(item.get("personalized_price_uf"), 99.0) < payload.current_price_uf
        ]
        print(
            f"DEBUG [match-plan] savings filter: current_price_uf={payload.current_price_uf} "
            f"pool_before={len(target_pool)} cheaper={len(cheaper)} "
            f"cheaper_prices={[_safe_float(i.get('personalized_price_uf'), 99.0) for i in cheaper[:5]]}"
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
            _safe_float(x.get("personalized_price_uf"), 99.0),
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
        top_price = _safe_float(target_pool[0].get("personalized_price_uf"), 99.0)
        print(
            f"DEBUG [match-plan] After sort (preference={preference}): "
            f"top_plan={target_pool[0]['plan'].get('name', '?')} "
            f"top_price={top_price} "
            f"pool_size={len(target_pool)}"
        )

    # 6) Sanity check post-orden — log si el contrato no se cumple
    top_item = target_pool[0] if target_pool else None
    top = top_item["plan"] if top_item else None
    if top and preference == "savings" and payload.current_price_uf:
        top_price = _safe_float(top_item.get("personalized_price_uf"), 99.0)
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


class PrestadorItem(BaseModel):
    id: str
    tu7_id_prestador: Optional[int] = None
    name: str
    logo_filename: Optional[str] = None
    zonas: Optional[list[int]] = None
    cubre_hospitalaria: bool = True
    cubre_ambulatoria: bool = True


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
# Fuente de verdad: tabla app_meta (key='valor_uf'), actualizada por el cron quincenal
# (scripts/sync_all.py). Se lee con caché TTL para no pegarle a la BD en cada request.
# Si la BD/clave no está disponible, cae al env var UF_VALUE_CLP (default 40374).
_UF_FALLBACK_CLP = int(os.getenv("UF_VALUE_CLP", "40374"))
_UF_CACHE_TTL_S = 3600  # 1h: el cron de UF corre a diario (sync-uf.yml); 1h de frescura basta.
_uf_cache: dict[str, float] = {"value": float(_UF_FALLBACK_CLP), "ts": 0.0}
_uf_lock = threading.Lock()


def _get_uf_value() -> int:
    """Valor UF en CLP desde app_meta, cacheado 1h. Fallback al env var UF_VALUE_CLP.

    El fallback NUNCA se cachea: si la lectura a app_meta falla o viene vacía,
    se prefiere el último valor bueno conocido (aunque el cache haya expirado) y
    recién como último recurso el fallback. Así una falla transitoria no deja la
    instancia pegada en el valor de respaldo (bug que mostraba UF vieja en prod)."""
    now = time.time()
    with _uf_lock:
        if _uf_cache["ts"] > 0 and now - _uf_cache["ts"] < _UF_CACHE_TTL_S:
            return int(round(_uf_cache["value"]))

    if supabase:
        try:
            resp = (
                supabase.table("app_meta")
                .select("value")
                .eq("key", "valor_uf")
                .limit(1)
                .execute()
            )
            if resp.data and resp.data[0].get("value"):
                value = float(resp.data[0]["value"])
                with _uf_lock:
                    _uf_cache["value"] = value
                    _uf_cache["ts"] = now
                return int(round(value))
            print("WARN [uf-resolver] app_meta.valor_uf vacío; usando ultimo valor/fallback sin cachear.")
        except Exception as e:
            print(f"WARN [uf-resolver] No se pudo leer app_meta.valor_uf: {e}. "
                  f"Usando ultimo valor/fallback sin cachear.")

    # Sin lectura fresca: preferir el último valor bueno (aunque expirado) al fallback.
    with _uf_lock:
        if _uf_cache["ts"] > 0:
            return int(round(_uf_cache["value"]))
    return _UF_FALLBACK_CLP


# Tope imponible de salud (renta imponible máxima para el 7% legal), en UF.
# Fuente de verdad: app_meta (key='tope_imponible_uf'), escrita por el cron diario
# (scripts/sync_all.py). Se cachea 1h igual que la UF. Fallback al env var o 90 UF
# (valor 2026) si app_meta no responde. La actualiza la Superintendencia 1×/año.
_TOPE_IMPONIBLE_FALLBACK_UF = float(os.getenv("TOPE_IMPONIBLE_UF", "90"))
_TOPE_CACHE_TTL_S = 3600
_tope_cache: dict[str, float] = {"value": _TOPE_IMPONIBLE_FALLBACK_UF, "ts": 0.0}
_tope_lock = threading.Lock()


def _get_tope_imponible_uf() -> float:
    """Tope imponible de salud en UF desde app_meta, cacheado 1h. Mismo patrón que
    _get_uf_value: ante falla de lectura, prefiere el último valor bueno conocido y
    recién el fallback como último recurso."""
    now = time.time()
    with _tope_lock:
        if _tope_cache["ts"] > 0 and now - _tope_cache["ts"] < _TOPE_CACHE_TTL_S:
            return _tope_cache["value"]

    if supabase:
        try:
            resp = (
                supabase.table("app_meta")
                .select("value")
                .eq("key", "tope_imponible_uf")
                .limit(1)
                .execute()
            )
            if resp.data and resp.data[0].get("value"):
                value = float(resp.data[0]["value"])
                if value > 0:
                    with _tope_lock:
                        _tope_cache["value"] = value
                        _tope_cache["ts"] = now
                    return value
            print("WARN [tope-resolver] app_meta.tope_imponible_uf vacío; usando ultimo valor/fallback.")
        except Exception as e:
            print(f"WARN [tope-resolver] No se pudo leer app_meta.tope_imponible_uf: {e}. "
                  f"Usando ultimo valor/fallback.")

    with _tope_lock:
        if _tope_cache["ts"] > 0:
            return _tope_cache["value"]
    return _TOPE_IMPONIBLE_FALLBACK_UF

# Base URL de los PDFs de planes. Se sirven desde la FUENTE (tu7.cl): Cloud Run es
# efímero y no conserva los .cache locales, y tu7 entrega los PDF con Content-Type
# application/pdf y SIN X-Frame-Options, así que se pueden incrustar en el iframe.
# Override con PDF_BASE_URL si algún día se auto-hospedan (ej. Supabase Storage).
PDF_BASE_URL = os.getenv("PDF_BASE_URL", "https://tu7.cl/pdf").rstrip("/")
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
        # Strip bracket/UF annotations BEFORE comma-split
        # "[0,30 UF]" → " "  (comma inside brackets would break split)
        segment = re.sub(r"\s*\[[^\]]*\]\s*", " ", segment)
        segment = re.sub(r"\s*\([^\)]*\)\s*", " ", segment)
        segment = segment.strip()
        if not segment:
            continue
        raw = [c.strip() for c in segment.split(",") if c.strip()]
        clinicas: list[str] = []
        for c in raw:
            c = c.strip().strip(",").strip()
            if not c:
                continue
            if c.isdigit():
                continue
            if re.match(r"^[\d.,]+\s*UF$", c, re.IGNORECASE):
                continue
            if len(c) < 3:
                continue
            clinicas.append(c)
        if clinicas:
            out.append(Cobertura(pct=pct, clinicas=clinicas))
    return out


def _max_pct(cobs: list[Cobertura]) -> Optional[int]:
    return max((c.pct for c in cobs), default=None)


def _uf_to_clp(uf: Optional[float]) -> Optional[int]:
    if uf is None:
        return None
    return int(round(float(uf) * _get_uf_value()))


def _pdf_url(pdf_plan: Optional[str]) -> Optional[str]:
    if not pdf_plan:
        return None
    return f"{PDF_BASE_URL}/{pdf_plan}"


class MetaResponse(BaseModel):
    valor_uf: int
    valor_uf_fecha: Optional[str] = None
    total_planes: Optional[int] = None
    last_update: Optional[str] = None
    tope_imponible_uf: float = 90.0


@app.get("/api/v1/meta", response_model=MetaResponse)
def get_meta():
    """Metadatos vivos para el frontend: valor UF del día, total de planes y última
    actualización. Fuente: tabla app_meta (la mantiene el cron quincenal scripts/sync_all.py).
    """
    data: dict[str, str] = {}
    if supabase:
        try:
            resp = supabase.table("app_meta").select("key,value").execute()
            data = {r["key"]: r["value"] for r in (resp.data or []) if r.get("key")}
        except Exception as e:
            print(f"WARN [meta] No se pudo leer app_meta: {e}")

    def _as_int(v: Optional[str]) -> Optional[int]:
        try:
            return int(v)
        except (TypeError, ValueError):
            return None

    def _as_float(v: Optional[str]) -> Optional[float]:
        try:
            return float(v)
        except (TypeError, ValueError):
            return None

    return MetaResponse(
        # Preferir el valor del MISMO read fresco (data); _get_uf_value() solo como
        # respaldo. Evita que la fecha salga fresca y la UF vieja (split-brain).
        valor_uf=_as_int(data.get("valor_uf")) or _get_uf_value(),
        valor_uf_fecha=data.get("valor_uf_fecha"),
        total_planes=_as_int(data.get("total_planes")),
        last_update=data.get("last_sync"),
        tope_imponible_uf=_as_float(data.get("tope_imponible_uf")) or _get_tope_imponible_uf(),
    )


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


def _sort_plan_list(plans: list["PlanListItem"], sort: str) -> list["PlanListItem"]:
    """Orden global del catálogo según el `sort` elegido por el usuario.

    Comparador NEUTRAL: sin prioridad por isapre — todos los planes compiten en
    igualdad de condiciones (antes Consalud se intercalaba en ~43% de los slots).
    Tie-break estable por (precio, nombre, id) → orden determinista entre páginas.
    """
    def price(p: "PlanListItem") -> float:
        return p.base_plan_uf if p.base_plan_uf is not None else (p.price_uf or 0.0)

    def name(p: "PlanListItem") -> str:
        return (p.name or "").lower()

    def coverage(p: "PlanListItem") -> float:
        return (p.hospital_coverage or 0) + (p.ambulatory_coverage or 0)

    if sort == "precio_desc":
        return sorted(plans, key=lambda p: (-price(p), name(p), p.id))
    if sort == "name_asc":
        return sorted(plans, key=lambda p: (name(p), price(p), p.id))
    if sort == "cobertura":
        # Mayor cobertura primero (hosp + amb); a igual cobertura, más barato primero.
        return sorted(plans, key=lambda p: (-coverage(p), price(p), p.id))
    # precio_asc (default): más barato primero.
    return sorted(plans, key=lambda p: (price(p), name(p), p.id))


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


# ── Cache helpers ──────────────────────────────────────────────────────────────

def _get_cached_plan_rows_for_list() -> list[dict]:
    """All tu7_activo plans with _PLAN_COLUMNS, cached 5 min."""
    cached = _LIST_PLANS_CACHE.get("all")
    if cached is not None:
        return cached
    if not supabase:
        return []
    query = supabase.table("planes").select(_PLAN_COLUMNS).eq("tu7_activo", True)
    rows = _fetch_filtered_plan_rows(query)
    _LIST_PLANS_CACHE.set("all", rows)
    return rows


def _filter_plans_in_python(
    rows: list[dict],
    tu7_activo: bool = True,
    modalidad: Optional[str] = None,
    con_parto: Optional[bool] = None,
    precio_min_uf: Optional[float] = None,
    precio_max_uf: Optional[float] = None,
    zona_ids: Optional[list[int]] = None,
    cobertura_hosp_min: Optional[float] = None,
    cobertura_amb_min: Optional[float] = None,
    prestador_q: Optional[str] = None,
    isapre_ids: Optional[list[str]] = None,
    search: Optional[str] = None,
) -> list[dict]:
    """Replicate Supabase WHERE filters in Python on cached rows."""
    out = []

    for r in rows:
        # tu7_activo — default True, skip false rows
        if tu7_activo and not r.get("tu7_activo"):
            continue

        if modalidad and r.get("modalidad") != modalidad:
            continue

        if con_parto is not None and r.get("con_parto") != con_parto:
            continue

        if isapre_ids and r.get("isapre_id") not in isapre_ids:
            continue

        if zona_ids:
            zid = r.get("id_zona")
            if zid is None or zid not in zona_ids:
                continue

        if precio_min_uf is not None:
            bp = r.get("base_plan_uf")
            if bp is None or _safe_float(bp, 0) < precio_min_uf:
                continue

        if precio_max_uf is not None:
            bp = r.get("base_plan_uf")
            if bp is not None and _safe_float(bp, 999999) > precio_max_uf:
                continue

        if cobertura_hosp_min is not None:
            v = r.get("cobertura_hosp_max")
            if v is None or int(v) < cobertura_hosp_min:
                continue

        if cobertura_amb_min is not None:
            v = r.get("cobertura_amb_max")
            if v is None or int(v) < cobertura_amb_min:
                continue

        if prestador_q:
            q = _norm(prestador_q)
            ht = _norm(r.get("hospitalaria_texto"))
            at = _norm(r.get("ambulatoria_texto"))
            if q not in ht and q not in at:
                continue

        if search:
            name = (r.get("name") or "").lower()
            code = (r.get("codigo_plan") or "").lower()
            sl = search.lower()
            if sl not in name and sl not in code:
                continue

        out.append(r)

    return out


def _get_cached_prices() -> list[float]:
    """Prices cache wrapper for _fetch_all_prices."""
    cached = _PRICES_CACHE.get("all")
    if cached is not None:
        return cached
    prices = _fetch_all_prices()
    _PRICES_CACHE.set("all", prices)
    return prices


def _get_cached_match_plan_rows() -> list[dict]:
    """Plans for match-plan (includes plan_clinica relation), cached 5 min."""
    cached = _MATCH_PLANS_CACHE.get("all")
    if cached is not None:
        return cached
    if not supabase:
        _MATCH_PLANS_CACHE.set("all", [])
        return []
    select_cols = (
        "id,name,price_uf,hospital_coverage,ambulatory_coverage,"
        "base_plan_uf,ges_isapre_uf,modalidad,isapre_id,"
        "isapres(id,name,slug,logo_url),plan_clinica(clinicas(region))"
    )
    query = supabase.table("planes").select(select_cols).eq("tu7_activo", True)
    rows = _fetch_filtered_plan_rows(query)
    _MATCH_PLANS_CACHE.set("all", rows)
    return rows


def _get_cached_plan_items() -> list[PlanListItem]:
    """Built PlanListItem list from cached raw rows, cached 5 min."""
    cached = _PLAN_ITEMS_CACHE.get("all")
    if cached is not None:
        return cached
    rows = _get_cached_plan_rows_for_list()
    items = [_build_plan_item(r) for r in rows]
    _PLAN_ITEMS_CACHE.set("all", items)
    return items


def _filter_plan_items(
    items: list[PlanListItem],
    tu7_activo: bool = True,
    slugs_filter: Optional[list[str]] = None,
    modalidad: Optional[str] = None,
    con_parto: Optional[bool] = None,
    precio_min_uf: Optional[float] = None,
    precio_max_uf: Optional[float] = None,
    zona_ids: Optional[list[int]] = None,
    cobertura_hosp_min: Optional[int] = None,
    cobertura_amb_min: Optional[int] = None,
    prestador_q: Optional[str] = None,
    prestador_plan_ids: Optional[set[str]] = None,
    prestador_names: Optional[list[str]] = None,
    search: Optional[str] = None,
) -> list[PlanListItem]:
    """Filter pre-built PlanListItem objects by user-facing attributes."""
    prestador_names_norm = [_norm(n) for n in prestador_names] if prestador_names else None
    out: list[PlanListItem] = []
    for p in items:
        if tu7_activo and not p.tu7_activo:
            continue
        if slugs_filter and (p.isapre_slug or "") not in slugs_filter:
            continue
        if modalidad and p.modalidad != modalidad:
            continue
        if con_parto is not None and p.con_parto != con_parto:
            continue
        if zona_ids and (p.id_zona is None or p.id_zona not in zona_ids):
            continue
        bp = p.base_plan_uf if p.base_plan_uf is not None else p.price_uf
        if precio_min_uf is not None and bp < precio_min_uf:
            continue
        if precio_max_uf is not None and bp > precio_max_uf:
            continue
        if cobertura_hosp_min is not None and (p.hospital_coverage is None or p.hospital_coverage < cobertura_hosp_min):
            continue
        if cobertura_amb_min is not None and (p.ambulatory_coverage is None or p.ambulatory_coverage < cobertura_amb_min):
            continue
        if prestador_q:
            q = _norm(prestador_q)
            found = False
            for cobs in (p.hospitalaria, p.ambulatoria):
                for cob in cobs:
                    if any(q in _norm(c) for c in cob.clinicas):
                        found = True
                        break
                if found:
                    break
            if not found:
                if prestador_plan_ids is None or p.id not in prestador_plan_ids:
                    continue
        elif prestador_names_norm:
            found = False
            for name in prestador_names_norm:
                for cobs in (p.hospitalaria, p.ambulatoria):
                    for cob in cobs:
                        if any(name in _norm(c) for c in cob.clinicas):
                            found = True
                            break
                    if found:
                        break
                if found:
                    break
            if not found:
                if prestador_plan_ids is None or p.id not in prestador_plan_ids:
                    continue
        elif prestador_plan_ids is not None and p.id not in prestador_plan_ids:
            continue
        if search:
            sl = search.lower()
            name = (p.name or "").lower()
            code = (p.codigo_plan or "").lower()
            if sl not in name and sl not in code:
                continue
        out.append(p)
    return out


@app.get("/api/v1/isapres", response_model=list[IsapreListItem])
def list_isapres():
    """Lista Isapres activas con conteo de planes y factor GES."""
    cached = _ISAPRES_CACHE.get("all")
    if cached is not None:
        return cached

    if not supabase:
        return []

    # 1) Fetch isapres
    isapres_resp = (
        supabase.table("isapres")
        .select("id,name,slug,logo_url")
        .in_("slug", list(ISAPRES_ACTIVAS))
        .execute()
    )
    isapres = isapres_resp.data or []
    if not isapres:
        return []

    isapre_ids = [i["id"] for i in isapres]

    # 2) Batch: fetch ALL active plans' isapre_id + ges_isapre_uf in one paginated query
    count_map: dict[str, int] = {}
    ges_map: dict[str, Optional[float]] = {}
    for iid in isapre_ids:
        count_map[iid] = 0
        ges_map[iid] = None

    offset = 0
    page_size = 1000
    while True:
        r = (
            supabase.table("planes")
            .select("isapre_id,ges_isapre_uf")
            .eq("tu7_activo", True)
            .in_("isapre_id", isapre_ids)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = r.data or []
        if not batch:
            break

        for row in batch:
            iid = row.get("isapre_id")
            if iid:
                count_map[iid] = count_map.get(iid, 0) + 1
            if row.get("ges_isapre_uf") is not None:
                ges_map[iid] = _safe_float(row["ges_isapre_uf"], None)

        if len(batch) < page_size:
            break
        offset += page_size

    result = [
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
    _ISAPRES_CACHE.set("all", result)
    return result


# ── GET /api/v1/prestadores ───────────────────────────────────────────────────

@app.get("/api/v1/prestadores", response_model=list[str])
def list_prestadores():
    """Lista única de clínicas mencionadas en coberturas hospitalaria/ambulatoria."""
    cached = _PRESTADORES_CACHE.get("all")
    if cached is not None:
        return cached

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

    result = sorted(prestadores, key=lambda s: s.lower())
    _PRESTADORES_CACHE.set("all", result)
    return result



@app.get("/api/v1/prestadores", response_model=list[str])
def list_prestadores():
    """Lista única de clínicas mencionadas en coberturas hospitalaria/ambulatoria."""
    cached = _PRESTADORES_CACHE.get("all")
    if cached is not None:
        return cached

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

    result = sorted(prestadores, key=lambda s: s.lower())
    _PRESTADORES_CACHE.set("all", result)
    return result


# ── GET /api/v1/prestadores/v2 ───────────────────────────────────────────────
# Devuelve los 71 prestadores oficiales (tabla clinicas, populada vía sync_tu7_prestadores).
# A diferencia del endpoint v1, expone metadata estructurada: id, logo, zonas, flags.

_PRESTADORES_V2_CACHE = _TTLCache(ttl=3600)


@app.get("/api/v1/prestadores/v2", response_model=list[PrestadorItem])
def list_prestadores_v2():
    """Lista de prestadores oficiales con metadata enriquecida."""
    cached = _PRESTADORES_V2_CACHE.get("all")
    if cached is not None:
        return cached

    if not supabase:
        return []

    rows = (
        supabase.table("clinicas")
        .select("id,tu7_id_prestador,name,logo_filename,zonas,cubre_hospitalaria,cubre_ambulatoria,visible")
        .eq("visible", True)
        .not_.is_("tu7_id_prestador", "null")
        .order("name")
        .execute()
        .data
        or []
    )

    result: list[PrestadorItem] = []
    for r in rows:
        zonas_csv = r.get("zonas")
        zonas_list: Optional[list[int]] = None
        if zonas_csv:
            try:
                zonas_list = [int(z.strip()) for z in zonas_csv.split(",") if z.strip()]
            except ValueError:
                zonas_list = None
        result.append(
            PrestadorItem(
                id=r["id"],
                tu7_id_prestador=r.get("tu7_id_prestador"),
                name=r["name"],
                logo_filename=r.get("logo_filename"),
                zonas=zonas_list,
                cubre_hospitalaria=bool(r.get("cubre_hospitalaria", True)),
                cubre_ambulatoria=bool(r.get("cubre_ambulatoria", True)),
            )
        )

    _PRESTADORES_V2_CACHE.set("all", result)
    return result


# ── GET /api/v1/zonas ─────────────────────────────────────────────────────────

@app.get("/api/v1/zonas", response_model=list[ZonaItem])
def list_zonas():
    """Lista zonas geográficas con conteo de planes tu7_activo."""
    cached = _ZONAS_CACHE.get("all")
    if cached is not None:
        return cached

    if not supabase:
        return []

    # Batch: fetch ALL tu7_activo id_zona values in one paginated query
    zone_counts: dict[int, int] = {zid: 0 for zid in ZONA_MAP}
    offset = 0
    page_size = 1000
    while True:
        r = (
            supabase.table("planes")
            .select("id_zona")
            .eq("tu7_activo", True)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        batch = r.data or []
        if not batch:
            break
        for row in batch:
            zid = row.get("id_zona")
            if zid is not None and zid in zone_counts:
                zone_counts[zid] += 1
        if len(batch) < page_size:
            break
        offset += page_size

    result = [
        ZonaItem(id=zid, nombre=nombre, plan_count=zone_counts.get(zid, 0))
        for zid, nombre in ZONA_MAP.items()
    ]
    _ZONAS_CACHE.set("all", result)
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
    prestador_ids: Optional[str] = Query(None, description="IDs de clínicas (UUID) separados por coma"),
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

    # ── 1. Get ALL cached PlanListItem objects ────────────────────────────
    all_items = _get_cached_plan_items()
    if not all_items:
        return PlanListResponse(items=[], total=0, page=page, limit=limit, total_pages=0)

    # ── 2. Resolve isapre slugs ──────────────────────────────────────────
    slugs_filter = (
        [s.strip() for s in isapre.split(",") if s.strip()]
        if isapre else list(ISAPRES_ACTIVAS)
    )

    # ── 3. Apply filters on cached PlanListItem objects ───────────────────
    _uf = _get_uf_value()
    precio_min_uf = (precio_min_clp / _uf) if precio_min_clp is not None else None
    precio_max_uf = (precio_max_clp / _uf) if precio_max_clp is not None else None
    zona_ids = [int(z.strip()) for z in zona.split(",") if z.strip().isdigit()] if zona else None
    prestador_q = prestador.replace(",", "").strip() if prestador else None

    # ── 3b. Resolve prestador_ids → plan IDs or fallback to text search ─────
    prestador_plan_ids: Optional[set[str]] = None
    prestador_names: Optional[list[str]] = None
    if prestador_ids:
        clinica_ids = [cid.strip() for cid in prestador_ids.split(",") if cid.strip()]
        if clinica_ids and supabase:
            try:
                r = (
                    supabase.table("plan_clinica")
                    .select("plan_id")
                    .in_("clinica_id", clinica_ids)
                    .execute()
                )
                found_ids = {str(row["plan_id"]) for row in (r.data or [])}
                if found_ids:
                    prestador_plan_ids = found_ids
                else:
                    names_r = (
                        supabase.table("clinicas")
                        .select("name")
                        .in_("id", clinica_ids)
                        .execute()
                    )
                    names = [(row["name"] or "").strip() for row in (names_r.data or []) if (row["name"] or "").strip()]
                    if names:
                        prestador_names = names
            except Exception:
                prestador_plan_ids = None

    # Combine text-based prestador filters
    combined_prestador_q = prestador_q

    filtered = _filter_plan_items(
        all_items,
        tu7_activo=tu7_activo,
        slugs_filter=slugs_filter,
        modalidad=modalidad,
        con_parto=con_parto,
        precio_min_uf=precio_min_uf,
        precio_max_uf=precio_max_uf,
        zona_ids=zona_ids,
        cobertura_hosp_min=cobertura_hosp_min,
        cobertura_amb_min=cobertura_amb_min,
        prestador_q=combined_prestador_q,
        prestador_plan_ids=prestador_plan_ids,
        prestador_names=prestador_names,
        search=search,
    )

    # ── 4. Orden global (comparador neutral, sin prioridad por isapre), slice ──
    ordered = _sort_plan_list(filtered, sort)

    total = len(ordered)
    total_pages = math.ceil(total / limit) if limit > 0 else 0
    offset = (page - 1) * limit
    items = ordered[offset:offset + limit]

    # ── 5. Price histogram from cached prices ────────────────────────────
    price_min_clp: Optional[int] = None
    price_max_clp: Optional[int] = None
    histogram: list[PriceBucket] = []
    if tu7_activo:
        all_prices = _get_cached_prices()
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
    cached = _PRICES_CACHE.get("all")
    if cached is not None:
        return cached
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
    _PRICES_CACHE.set("all", prices)
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
    base_plan_uf: Optional[float] = None
    ges_isapre_uf: Optional[float] = None
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
        .select("id,name,codigo_plan,price_uf,base_plan_uf,ges_isapre_uf,hospital_coverage,ambulatory_coverage,modalidad")
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
            base_plan_uf=_safe_float(r.get("base_plan_uf"), 0.0) or None,
            ges_isapre_uf=_safe_float(r.get("ges_isapre_uf"), 0.0) or None,
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





# ── Startup: pre-warm caches in background ────────────────────────────────────
@app.on_event("startup")
def _start_warm():
    """Fire background thread so server starts immediately."""
    if not supabase:
        return
    def _warm():
        sys.stdout.write("INFO [cache] Pre-warming caches...\n")
        sys.stdout.flush()
        try:
            _get_cached_plan_rows_for_list()
            n = len(_LIST_PLANS_CACHE._data.get("all", []) or [])
            sys.stdout.write(f"  [OK] _LIST_PLANS_CACHE ({n} planes)\n")
        except Exception as e:
            sys.stdout.write(f"  [FAIL] _LIST_PLANS_CACHE: {e}\n")
        try:
            _get_cached_plan_items()
            n = len(_PLAN_ITEMS_CACHE._data.get("all", []) or [])
            sys.stdout.write(f"  [OK] _PLAN_ITEMS_CACHE ({n} items)\n")
        except Exception as e:
            sys.stdout.write(f"  [FAIL] _PLAN_ITEMS_CACHE: {e}\n")
        try:
            _get_cached_prices()
            n = len(_PRICES_CACHE._data.get("all", []) or [])
            sys.stdout.write(f"  [OK] _PRICES_CACHE ({n} prices)\n")
        except Exception as e:
            sys.stdout.write(f"  [FAIL] _PRICES_CACHE: {e}\n")
        try:
            _get_cached_match_plan_rows()
            n = len(_MATCH_PLANS_CACHE._data.get("all", []) or [])
            sys.stdout.write(f"  [OK] _MATCH_PLANS_CACHE ({n} plans)\n")
        except Exception as e:
            sys.stdout.write(f"  [FAIL] _MATCH_PLANS_CACHE: {e}\n")
        try:
            list_isapres()
            sys.stdout.write("  [OK] _ISAPRES_CACHE\n")
        except Exception as e:
            sys.stdout.write(f"  [FAIL] _ISAPRES_CACHE: {e}\n")
        try:
            list_zonas()
            sys.stdout.write("  [OK] _ZONAS_CACHE\n")
        except Exception as e:
            sys.stdout.write(f"  [FAIL] _ZONAS_CACHE: {e}\n")
        try:
            list_prestadores()
            sys.stdout.write("  [OK] _PRESTADORES_CACHE\n")
        except Exception as e:
            sys.stdout.write(f"  [FAIL] _PRESTADORES_CACHE: {e}\n")
        sys.stdout.write("INFO [cache] Pre-warming complete.\n")
        sys.stdout.flush()
    threading.Thread(target=_warm, daemon=True).start()


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
