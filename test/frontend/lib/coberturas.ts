import type { Cobertura } from '@/lib/api';

// Helpers de cobertura compartidos por la tarjeta del plan y la ficha "Ver detalle".
// Las coberturas llegan como [{ pct, clinicas[] }] en el orden del texto de tu7, y una
// misma clínica puede aparecer con más de un % (p.ej. 60% y 40% según la prestación).

/** Colores por nivel de cobertura (mismos cortes que la tarjeta original). */
export function colorCobertura(pct: number): { fg: string; bg: string } {
  if (pct < 60) return { fg: '#c8401a', bg: 'rgba(200,64,26,0.10)' };
  if (pct < 80) return { fg: '#d97706', bg: 'rgba(217,119,6,0.10)' };
  return { fg: '#0f9d8a', bg: 'rgba(20,220,180,0.14)' };
}

/** Clínicas únicas, en el orden en que aparecen. */
export function clinicasUnicas(data: Cobertura[] | null | undefined): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of data ?? []) {
    for (const clin of c.clinicas) {
      if (!seen.has(clin)) {
        seen.add(clin);
        out.push(clin);
      }
    }
  }
  return out;
}

/** Rango de % del bloque (min y max), o null si no hay datos. */
export function rangoCobertura(data: Cobertura[] | null | undefined): { min: number; max: number } | null {
  const pcts = (data ?? []).map((c) => c.pct).filter((p) => Number.isFinite(p));
  if (pcts.length === 0) return null;
  return { min: Math.min(...pcts), max: Math.max(...pcts) };
}

/** "40%" o "40–60%". */
export function textoRango(r: { min: number; max: number }): string {
  return r.min === r.max ? `${r.max}%` : `${r.min}–${r.max}%`;
}

/** Clínicas agrupadas por % (de mayor a menor), sin repetir clínicas dentro de un grupo. */
export function gruposPorPct(data: Cobertura[] | null | undefined): { pct: number; clinicas: string[] }[] {
  const map = new Map<number, string[]>();
  for (const c of data ?? []) {
    const list = map.get(c.pct) ?? [];
    for (const clin of c.clinicas) if (!list.includes(clin)) list.push(clin);
    map.set(c.pct, list);
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([pct, clinicas]) => ({ pct, clinicas }));
}

export interface CoberturaClinica {
  nombre: string;
  /** Todos los % hospitalarios de esa clínica (puede haber más de uno). */
  hosp: number[];
  amb: number[];
  hospMax: number | null;
  ambMax: number | null;
}

/**
 * Une hospitalaria y ambulatoria por clínica. Orden: mejor cobertura primero
 * (máximo entre hosp y amb, luego la suma), y luego por nombre.
 */
export function coberturaPorClinica(
  hospitalaria: Cobertura[] | null | undefined,
  ambulatoria: Cobertura[] | null | undefined,
): CoberturaClinica[] {
  const map = new Map<string, { hosp: number[]; amb: number[] }>();
  const add = (data: Cobertura[] | null | undefined, key: 'hosp' | 'amb') => {
    for (const c of data ?? []) {
      for (const clin of c.clinicas) {
        const entry = map.get(clin) ?? { hosp: [], amb: [] };
        if (!entry[key].includes(c.pct)) entry[key].push(c.pct);
        map.set(clin, entry);
      }
    }
  };
  add(hospitalaria, 'hosp');
  add(ambulatoria, 'amb');

  const out: CoberturaClinica[] = [...map.entries()].map(([nombre, v]) => ({
    nombre,
    hosp: v.hosp.sort((a, b) => b - a),
    amb: v.amb.sort((a, b) => b - a),
    hospMax: v.hosp.length ? Math.max(...v.hosp) : null,
    ambMax: v.amb.length ? Math.max(...v.amb) : null,
  }));
  return out.sort((a, b) => {
    const bestA = Math.max(a.hospMax ?? 0, a.ambMax ?? 0);
    const bestB = Math.max(b.hospMax ?? 0, b.ambMax ?? 0);
    if (bestB !== bestA) return bestB - bestA;
    const sumA = (a.hospMax ?? 0) + (a.ambMax ?? 0);
    const sumB = (b.hospMax ?? 0) + (b.ambMax ?? 0);
    if (sumB !== sumA) return sumB - sumA;
    return a.nombre.localeCompare(b.nombre, 'es');
  });
}

/** Etiqueta simple del nivel de cobertura de un plan, según el promedio de sus clínicas. */
export function nivelCobertura(clinicas: CoberturaClinica[]): { label: string; tone: 'alta' | 'media' | 'basica' } | null {
  const valores = clinicas.flatMap((c) => [c.hospMax, c.ambMax]).filter((v): v is number => v != null);
  if (valores.length === 0) return null;
  const prom = valores.reduce((s, v) => s + v, 0) / valores.length;
  if (prom >= 80) return { label: 'Cobertura alta', tone: 'alta' };
  if (prom >= 60) return { label: 'Cobertura media', tone: 'media' };
  return { label: 'Cobertura básica', tone: 'basica' };
}
