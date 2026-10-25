import type { PlansQuery } from '@/lib/api';
import { type Beneficiario, getTotalFactor, perfilParaPrecio } from '@/lib/factores';

/** Planes por página del comparador (igual que tu7). */
export const PLANES_POR_PAGINA = 20;

/**
 * Evento para avisarle al comparador YA ABIERTO que su URL cambió desde fuera (p.ej.
 * el pop-up de inicio aplicó la edad/sueldo con history.pushState). El comparador no
 * usa useSearchParams (rompería el ISR), así que solo se entera vía popstate o este evento.
 */
export const COMPARAR_URL_EVENT = 'etp:comparar-url';

// Claves de la URL que afectan el RESULTADO del backend (no las puramente visuales).
// Si ninguna está presente, la vista es la "por defecto" y coincide con el snapshot
// pre-renderizado en el servidor (ISR) → no hace falta volver a pedir al backend.
// `plan` (ficha abierta) NO está aquí a propósito: abrir una ficha no cambia la lista.
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
  // El sueldo agrega el conteo "te alcanza / pago extra" a la respuesta.
  'sueldo_imponible_clp',
  'sueldo_liquido_clp',
  'en_presupuesto',
] as const;

function parseIntParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** El sueldo líquido se lleva a imponible igual que tu7: líquido ÷ 0,8 (≈20% de descuentos). */
export const LIQUIDO_A_IMPONIBLE = 0.8;

export interface SueldoPerfil {
  tipo: 'liquido' | 'bruto';
  /** Lo que escribió la persona. */
  monto: number;
  /** Renta imponible usada para el 7% (antes del tope). */
  imponible: number;
}

/** Sueldo del perfil leído de la URL (líquido o bruto imponible). */
export function sueldoDesdeURL(search: URLSearchParams): SueldoPerfil | null {
  const liquido = parseIntParam(search.get('sueldo_liquido_clp'));
  if (liquido != null && liquido > 0) {
    return { tipo: 'liquido', monto: liquido, imponible: Math.round(liquido / LIQUIDO_A_IMPONIBLE) };
  }
  const bruto = parseIntParam(search.get('sueldo_imponible_clp'));
  if (bruto != null && bruto > 0) return { tipo: 'bruto', monto: bruto, imponible: bruto };
  return null;
}

/**
 * Construye el PlansQuery para el backend a partir de la URL + beneficiarios.
 * Se usa igual en el servidor (vista por defecto, ISR) y en el cliente (filtrado en
 * vivo), así ambas consultas coinciden exactamente.
 *
 * Precio: siempre se envía el perfil (beneficiarios del usuario, o 1 persona de 30
 * años por defecto) para que el backend filtre, ordene y arme el histograma con el
 * precio familiar EXACTO (base × Σ factores + GES de cada isapre × N). Los precios
 * min/max de la URL ya están en esa misma escala, así que pasan directo.
 */
export function buildPlansQuery(
  search: URLSearchParams,
  beneficiarios: Beneficiario[],
  /** 7% legal del usuario (CLP), si ingresó su sueldo. Lo calcula el cliente (necesita la UF). */
  opts: { presupuestoClp?: number | null } = {},
): PlansQuery {
  const q: PlansQuery = { limit: PLANES_POR_PAGINA };

  const isapre = search.get('isapre');
  if (isapre) q.isapre = isapre;
  const modalidad = search.get('modalidad');
  if (modalidad) q.modalidad = modalidad;
  const zona = search.get('zona');
  if (zona) q.zona = zona;

  const perfil = perfilParaPrecio(beneficiarios);
  // 2 decimales: evita mandar 1.2999999999999998 por la suma en coma flotante.
  q.factor_total = Math.round(getTotalFactor(perfil) * 100) / 100;
  q.n_beneficiarios = perfil.length;

  const precioMin = parseIntParam(search.get('precio_min_clp'));
  const precioMax = parseIntParam(search.get('precio_max_clp'));
  // El 7% legal es un MARCADOR visual, no un filtro estricto: cuando aplicar_tope_legal=true
  // se ignora precio_max_clp → backend muestra todos los planes y las cards marcan el exceso.
  const isLegalBudgetSoft = search.get('aplicar_tope_legal') === 'true';
  if (precioMin != null) q.precio_min_clp = precioMin;
  if (precioMax != null && !isLegalBudgetSoft) q.precio_max_clp = precioMax;

  // Presupuesto (7%): el backend cuenta cuántos planes caben. "Me alcanza" / "Pago extra"
  // (en_presupuesto=si|no) recortan el precio en el 7% exacto.
  const presupuesto = opts.presupuestoClp && opts.presupuestoClp > 0 ? Math.round(opts.presupuestoClp) : null;
  if (presupuesto) {
    q.presupuesto_clp = presupuesto;
    const enPresupuesto = search.get('en_presupuesto');
    if (enPresupuesto === 'si') q.precio_max_clp = presupuesto;
    if (enPresupuesto === 'no') q.precio_min_clp = presupuesto + 1;
  }

  const coberturaHospMin = parseIntParam(search.get('cobertura_hosp_min'));
  const coberturaAmbMin = parseIntParam(search.get('cobertura_amb_min'));
  if (coberturaHospMin != null) q.cobertura_hosp_min = coberturaHospMin;
  if (coberturaAmbMin != null) q.cobertura_amb_min = coberturaAmbMin;

  const prestador = search.get('prestador');
  if (prestador) q.prestador = prestador;
  const prestadorIds = search.get('prestador_ids');
  if (prestadorIds) {
    q.prestador_ids = prestadorIds;
    // Con clínicas elegidas, el % mínimo se mide EN esas clínicas ("Cobertura en tu clínica").
    if (coberturaHospMin != null || coberturaAmbMin != null) q.cobertura_en_clinica = true;
  }
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
