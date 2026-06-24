// Mapeo ciudad/comuna → zona (id_zona de tu7) para que el usuario encuentre su zona
// sin saber la "región". Muchos clientes saben que viven en Concepción/Viña/Villarrica
// pero no qué zona es. Zonas geográficas:
//   Norte=1 · Octava=3 · Quinta=4 · RM=5 · Sur=6 · Centro=9
// La zona 8 ("Regional - CB | Colmena") es un grupo específico de Colmena, NO geográfico,
// así que no se mapea por ciudad (queda como checkbox manual).

// Ciudades de ejemplo por zona (se muestran bajo cada opción del filtro).
export const ZONA_CIUDADES_EJEMPLO: Record<number, string> = {
  5: 'Santiago y Región Metropolitana',
  4: 'Valparaíso, Viña del Mar, Quilpué',
  3: 'Concepción, Los Ángeles, Chillán',
  1: 'Arica, Antofagasta, La Serena',
  9: 'Rancagua, Talca, Curicó',
  6: 'Temuco, Valdivia, Puerto Montt',
};

// Lista ciudad/comuna → zonaId. Se busca normalizado (sin acentos, minúsculas).
export const CIUDAD_ZONA: ReadonlyArray<readonly [string, number]> = [
  // ── RM (5) ──
  ['Santiago', 5], ['Maipú', 5], ['Puente Alto', 5], ['La Florida', 5], ['Las Condes', 5],
  ['Providencia', 5], ['Ñuñoa', 5], ['San Bernardo', 5], ['Quilicura', 5], ['Peñalolén', 5],
  ['Macul', 5], ['La Reina', 5], ['Vitacura', 5], ['Recoleta', 5], ['Independencia', 5],
  ['Estación Central', 5], ['Pudahuel', 5], ['Renca', 5], ['Conchalí', 5], ['Huechuraba', 5],
  ['Lo Barnechea', 5], ['Colina', 5], ['Melipilla', 5], ['Talagante', 5], ['Buin', 5],
  ['San Miguel', 5], ['La Cisterna', 5], ['El Bosque', 5], ['La Granja', 5], ['Cerrillos', 5],
  ['Quinta Normal', 5], ['Maipo', 5], ['Padre Hurtado', 5],
  // ── Quinta — V Región (4) ──
  ['Valparaíso', 4], ['Viña del Mar', 4], ['Quilpué', 4], ['Villa Alemana', 4], ['Concón', 4],
  ['San Antonio', 4], ['Quillota', 4], ['Los Andes', 4], ['San Felipe', 4], ['Limache', 4],
  ['Olmué', 4], ['La Calera', 4], ['Casablanca', 4], ['Algarrobo', 4], ['El Quisco', 4],
  ['Cartagena', 4],
  // ── Octava — Biobío / Ñuble (3) ──
  ['Concepción', 3], ['Talcahuano', 3], ['San Pedro de la Paz', 3], ['Hualpén', 3],
  ['Chiguayante', 3], ['Coronel', 3], ['Lota', 3], ['Penco', 3], ['Tomé', 3], ['Los Ángeles', 3],
  ['Chillán', 3], ['Chillán Viejo', 3],
  // ── Norte (1) ──
  ['Arica', 1], ['Iquique', 1], ['Alto Hospicio', 1], ['Antofagasta', 1], ['Calama', 1],
  ['Tocopilla', 1], ['Copiapó', 1], ['Vallenar', 1], ['La Serena', 1], ['Coquimbo', 1],
  ['Ovalle', 1], ['Illapel', 1], ['Vicuña', 1],
  // ── Centro — O'Higgins / Maule (9) ──
  ['Rancagua', 9], ['San Fernando', 9], ['Rengo', 9], ['Machalí', 9], ['Talca', 9],
  ['Curicó', 9], ['Linares', 9], ['Constitución', 9], ['Molina', 9], ['Cauquenes', 9],
  // ── Sur (6) ──
  ['Temuco', 6], ['Padre Las Casas', 6], ['Villarrica', 6], ['Pucón', 6], ['Angol', 6],
  ['Victoria', 6], ['Valdivia', 6], ['La Unión', 6], ['Osorno', 6], ['Puerto Montt', 6],
  ['Puerto Varas', 6], ['Castro', 6], ['Ancud', 6], ['Quellón', 6], ['Coyhaique', 6],
  ['Punta Arenas', 6], ['Puerto Aysén', 6],
];

function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export interface CiudadMatch {
  ciudad: string;
  zonaId: number;
}

// Busca ciudades por query (sin acentos). Prioriza las que empiezan con el texto.
export function buscarCiudades(query: string, limit = 6): CiudadMatch[] {
  const q = normalize(query.trim());
  if (!q) return [];
  const starts: CiudadMatch[] = [];
  const includes: CiudadMatch[] = [];
  for (const [ciudad, zonaId] of CIUDAD_ZONA) {
    const n = normalize(ciudad);
    if (n.startsWith(q)) starts.push({ ciudad, zonaId });
    else if (n.includes(q)) includes.push({ ciudad, zonaId });
  }
  return [...starts, ...includes].slice(0, limit);
}
