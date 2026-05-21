// Tabla unificada de factores de riesgo (post-reforma 2020 chilena: unisex).
// Extraida de https://tu7.cl/Api/data/factores/
// Mapea (edad, tipo) → factor multiplicador del precio del plan.

export interface FactorRow {
  from: number;
  to: number;
  cotizante: number;
  carga: number;
}

export const FACTORES_TABLE: FactorRow[] = [
  { from: 0, to: 1, cotizante: 0, carga: 0 },
  { from: 2, to: 19, cotizante: 0.6, carga: 0.6 },
  { from: 20, to: 24, cotizante: 0.9, carga: 0.7 },
  { from: 25, to: 34, cotizante: 1.0, carga: 0.7 },
  { from: 35, to: 44, cotizante: 1.3, carga: 0.9 },
  { from: 45, to: 54, cotizante: 1.4, carga: 1.0 },
  { from: 55, to: 64, cotizante: 2.0, carga: 1.4 },
  { from: 65, to: 100, cotizante: 2.4, carga: 2.2 },
];

export type TipoBeneficiario = 'cotizante' | 'carga';

export interface Beneficiario {
  id: string;
  edad: number;
  tipo: TipoBeneficiario;
  sexo?: 'M' | 'F'; // informativo; tabla post-2020 no diferencia por sexo
}

export function getFactor(edad: number, tipo: TipoBeneficiario): number {
  if (!Number.isFinite(edad) || edad < 0) return 0;
  const row = FACTORES_TABLE.find((r) => edad >= r.from && edad <= r.to);
  if (!row) return 0;
  return tipo === 'cotizante' ? row.cotizante : row.carga;
}

export function getTotalFactor(beneficiarios: Beneficiario[]): number {
  return beneficiarios.reduce((sum, b) => sum + getFactor(b.edad, b.tipo), 0);
}

// Compactos para URL: `c30` = cotizante 30 años, `r5` = carga 5 años.
// Sexo opcional: `c30M`, `r5F`. Lista separada por comas: `?ben=c30M,r5F,c34`
export function serializeBeneficiarios(arr: Beneficiario[]): string {
  return arr
    .map((b) => {
      const prefix = b.tipo === 'cotizante' ? 'c' : 'r';
      const sx = b.sexo ? b.sexo : '';
      return `${prefix}${b.edad}${sx}`;
    })
    .join(',');
}

export function parseBeneficiarios(raw: string | null): Beneficiario[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((token, idx) => {
      const m = token.trim().match(/^([cr])(\d{1,3})([MF])?$/i);
      if (!m) return null;
      const tipo: TipoBeneficiario = m[1].toLowerCase() === 'c' ? 'cotizante' : 'carga';
      const edad = parseInt(m[2], 10);
      const sexo = m[3]?.toUpperCase() as 'M' | 'F' | undefined;
      if (!Number.isFinite(edad) || edad < 0 || edad > 120) return null;
      return { id: `${idx}-${token}`, edad, tipo, sexo };
    })
    .filter((b): b is Beneficiario => b !== null);
}

// Fórmula EXACTA usada por tu7.cl (extraída de su bundle JS):
//   precio_UF = BASE_PLAN × Σ(factores) + GES_ISAPRE × N°_beneficiarios
//
// Caso default (0 beneficiarios): muestra el costo asumiendo 1 cotizante hipotético
// con factor 0.9 (heurística tu7 para precio "Desde"):
//   precio_UF = BASE_PLAN × 0.9 + GES_ISAPRE
//
// Para CLP basta multiplicar por el valor UF del día.
export function calcularPrecioPlanUF(
  basePlanUf: number | null,
  gesIsapreUf: number | null,
  beneficiarios: Beneficiario[]
): number {
  const base = basePlanUf ?? 0;
  const ges = gesIsapreUf ?? 0;
  if (beneficiarios.length === 0) {
    return base * 0.9 + ges;
  }
  const sumaFactores = getTotalFactor(beneficiarios);
  return base * sumaFactores + ges * beneficiarios.length;
}
