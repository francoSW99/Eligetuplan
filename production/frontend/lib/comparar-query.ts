import type { PlansQuery } from '@/lib/api';
import { type Beneficiario, getTotalFactor } from '@/lib/factores';

// Claves de la URL que afectan el RESULTADO del backend (no las puramente visuales).
// Si ninguna está presente, la vista es la "por defecto" y coincide con el snapshot
// pre-renderizado en el servidor (ISR) → no hace falta volver a pedir al backend.
export const DATA_PARAM_KEYS = [
  'isapre',
  'modalidad',
  'zona',
  'precio_min_clp',
  'precio_max_clp',
  'cobertura_hosp_min',
  'cobertura_amb_min',
  'prestador',
  'prestador_ids',
  'con_parto',
  'search',
  'page',
  'sort',
  'ben',
] as const;

const GES_AVG_CLP = 28_000;

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Construye el PlansQuery para el backend a partir de la URL + beneficiarios.
 * Replica EXACTAMENTE la lógica que vivía en compare-body.tsx (parseFilters),
 * incluyendo la conversión del precio mostrado (CLP, fórmula tu7) → base_plan_uf
 * que entiende el backend. Se usa en el cliente para el filtrado en vivo.
 */
export function buildPlansQuery(
  search: URLSearchParams,
  beneficiarios: Beneficiario[],
): PlansQuery {
  const q: PlansQuery = { limit: 15 };

  const isapre = search.get('isapre');
  if (isapre) q.isapre = isapre;
  const modalidad = search.get('modalidad');
  if (modalidad) q.modalidad = modalidad;
  const zona = search.get('zona');
  if (zona) q.zona = zona;

  const precioMin = parseIntParam(search.get('precio_min_clp'));
  const precioMax = parseIntParam(search.get('precio_max_clp'));
  const coberturaHospMin = parseIntParam(search.get('cobertura_hosp_min'));
  const coberturaAmbMin = parseIntParam(search.get('cobertura_amb_min'));

  // El 7% legal es un MARCADOR visual, no un filtro estricto: cuando aplicar_tope_legal=true
  // se ignora precio_max_clp → backend muestra todos los planes y las cards marcan el exceso.
  const isLegalBudgetSoft = search.get('aplicar_tope_legal') === 'true';

  const sumaFactores = getTotalFactor(beneficiarios);
  const numBeneficiarios = beneficiarios.length;

  // Fórmula tu7: displayed = base × sumaF + ges × N. Para que displayed ≤ X →
  // base ≤ (X - gesAvg × N) / sumaF. GES promedio aprox 0.7 UF ≈ 28k CLP.
  if (sumaFactores > 0 && numBeneficiarios > 0) {
    if (precioMin != null) {
      q.precio_min_clp = Math.max(0, Math.round((precioMin - GES_AVG_CLP * numBeneficiarios) / sumaFactores));
    }
    if (precioMax != null && !isLegalBudgetSoft) {
      q.precio_max_clp = Math.max(0, Math.round((precioMax - GES_AVG_CLP * numBeneficiarios) / sumaFactores));
    }
  } else {
    if (precioMin != null) q.precio_min_clp = precioMin;
    if (precioMax != null && !isLegalBudgetSoft) q.precio_max_clp = precioMax;
  }

  if (coberturaHospMin != null) q.cobertura_hosp_min = coberturaHospMin;
  if (coberturaAmbMin != null) q.cobertura_amb_min = coberturaAmbMin;

  const prestador = search.get('prestador');
  if (prestador) q.prestador = prestador;
  const prestadorIds = search.get('prestador_ids');
  if (prestadorIds) q.prestador_ids = prestadorIds;
  if (search.get('con_parto')) q.con_parto = search.get('con_parto') === 'true';
  const searchText = search.get('search');
  if (searchText) q.search = searchText;
  const page = parseIntParam(search.get('page'));
  if (page != null) q.page = page;
  const sort = search.get('sort');
  if (sort) q.sort = sort;

  return q;
}

/** True si la URL no tiene ningún filtro que cambie el resultado (vista por defecto). */
export function isDefaultPlansView(search: URLSearchParams): boolean {
  return DATA_PARAM_KEYS.every((k) => !search.get(k));
}
