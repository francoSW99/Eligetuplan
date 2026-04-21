"""
Parser puro del archivo de Planes de Salud de la SIS.

Responsabilidades:
- Detectar encoding del archivo (latin-1 / cp1252)
- Parsear líneas pipe-separated (|)
- Devolver una lista de dicts listos para insertar en Supabase
- No tiene efectos secundarios (sin I/O de red, sin BD)

Formato del archivo (39 columnas, sin header):
  col[ 0] periodo          YYYYMM
  col[ 1] codigo_isapre    numérico (ej: 78 = Cruz Blanca)
  col[ 2] codigo_plan      código del plan (ej: "CBON 42A D20")
  col[ 3] nombre_plan      nombre legible
  col[ 4] nombre_empresa   empresa/grupo objetivo
  col[ 5] fecha_emision    YYYYMM
  col[11] modalidad        "Libre elección" | "Prestador Preferente" | "Plan Cerrado"
  col[12] tipo_parto       indica cobertura de parto
  col[14] unidad_precio    "UF" | "7%" (porcentaje de salario)
  col[15] precio_base_uf   precio base (sin ajustes)
  col[23] precio_final_uf  precio final (con ajustes vigentes) ← usar este
  col[26] cobertura_hosp   % cobertura hospitalaria
  col[27] cobertura_amb    % cobertura ambulatoria
"""

import csv
import io
import logging
from dataclasses import dataclass
from datetime import date
from typing import Optional

from scripts.sis_normalize import normalize_isapre, normalize_modalidad, is_con_parto

logger = logging.getLogger(__name__)

DELIMITER = "|"
EXPECTED_COLS = 39


@dataclass
class SisPlanRow:
    periodo: str
    codigo_isapre: str
    isapre_nombre: str
    isapre_slug: str
    isapre_logo: str
    codigo_plan: str
    nombre_plan: str
    modalidad: str
    con_parto: bool
    unidad_precio: str
    price_uf: float
    hospital_coverage: Optional[float]
    ambulatory_coverage: Optional[float]
    fecha_emision: Optional[date]
    comercializable: bool
    tipo_plan: str


def _parse_float(value: str) -> Optional[float]:
    try:
        return float(value.strip().replace(",", "."))
    except (ValueError, AttributeError):
        return None


def _parse_fecha(yyyymm: str) -> Optional[date]:
    try:
        s = yyyymm.strip()
        if len(s) == 6 and s.isdigit():
            return date(int(s[:4]), int(s[4:6]), 1)
    except (ValueError, AttributeError):
        pass
    return None


def detect_encoding(raw: bytes) -> str:
    """Intenta detectar el encoding del archivo."""
    for enc in ("utf-8", "latin-1", "cp1252"):
        try:
            raw.decode(enc)
            return enc
        except UnicodeDecodeError:
            continue
    return "latin-1"  # fallback seguro para archivos gubernamentales chilenos


def parse_planes_bytes(raw: bytes) -> list[SisPlanRow]:
    """
    Parsea el contenido binario del archivo de planes SIS.
    Devuelve una lista de SisPlanRow ignorando filas inválidas.
    """
    encoding = detect_encoding(raw)
    logger.info(f"Encoding detectado: {encoding}")

    text = raw.decode(encoding, errors="replace")
    rows: list[SisPlanRow] = []
    skipped = 0

    reader = csv.reader(io.StringIO(text), delimiter=DELIMITER)
    for line_num, cols in enumerate(reader, start=1):
        # Ignorar filas vacías o con columnas insuficientes
        if len(cols) < EXPECTED_COLS:
            skipped += 1
            continue

        try:
            codigo_isapre = cols[1].strip()
            isapre_nombre, isapre_slug, isapre_logo = normalize_isapre(codigo_isapre)

            codigo_plan  = cols[2].strip()
            nombre_plan  = cols[3].strip()
            comer_raw    = cols[8].strip()
            tipo_plan    = cols[10].strip()
            modalidad    = normalize_modalidad(cols[11])
            tipo_parto   = cols[12].strip()
            unidad       = cols[14].strip()

            # col[8] = "Si Comer." (comercializable) | "No Comer." (no)
            comercializable = "No" not in comer_raw

            # Usar precio final (col 23), que incluye adecuaciones vigentes
            price_raw    = _parse_float(cols[23])
            # Solo incluir planes con precio UF válido
            if unidad != "UF" or price_raw is None or price_raw <= 0:
                skipped += 1
                continue

            hosp = _parse_float(cols[26])
            amb  = _parse_float(cols[27])

            # Validar rangos de cobertura (0-100%)
            if hosp is not None and not (0 <= hosp <= 100):
                hosp = None
            if amb is not None and not (0 <= amb <= 100):
                amb = None

            rows.append(SisPlanRow(
                periodo=cols[0].strip(),
                codigo_isapre=codigo_isapre,
                isapre_nombre=isapre_nombre,
                isapre_slug=isapre_slug,
                isapre_logo=isapre_logo,
                codigo_plan=codigo_plan,
                nombre_plan=nombre_plan,
                modalidad=modalidad,
                con_parto=is_con_parto(tipo_parto),
                unidad_precio=unidad,
                price_uf=round(price_raw, 2),
                hospital_coverage=hosp,
                ambulatory_coverage=amb,
                fecha_emision=_parse_fecha(cols[5]),
                comercializable=comercializable,
                tipo_plan=tipo_plan,
            ))

        except Exception as e:
            logger.warning(f"Línea {line_num}: error al parsear — {e}")
            skipped += 1
            continue

    logger.info(f"Parseadas {len(rows)} filas válidas, {skipped} ignoradas.")
    return rows
