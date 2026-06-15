import { getIsapres, getPlanes, getZonas, getPrestadoresV2 } from '@/lib/api';
import type { PlansResponse } from '@/lib/api';
import IsapresClient from './isapres-client';

const EMPTY_PLANS: PlansResponse = {
  items: [],
  total: 0,
  page: 1,
  limit: 15,
  total_pages: 0,
  price_min_clp: null,
  price_max_clp: null,
  price_histogram: [],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Tolerante a fallos transitorios del backend (Cloud Run puede arrancar en frío y
 * devolver un 500/lento en la primera petición). Reintenta y, si todo falla, cae a un
 * fallback en vez de abortar el build/ISR. ISR sirve la última versión buena mientras
 * tanto, y el cliente vuelve a pedir datos en vivo al montar.
 */
async function withRetry<T>(fn: () => Promise<T>, fallback: T, tries = 3): Promise<T> {
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch {
      if (i === tries - 1) return fallback;
      await sleep(500 * (i + 1));
    }
  }
  return fallback;
}

/**
 * Server Component ESTÁTICO (ISR). No lee searchParams → la ruta se pre-renderiza
 * y se sirve desde el edge de Vercel (primera pintura instantánea, aunque el backend
 * esté frío). Siempre renderiza la vista POR DEFECTO (sin filtros). El filtrado en
 * vivo lo maneja IsapresClient consultando el backend desde el navegador.
 *
 * Frescura: la página se revalida según `revalidate` (ver page.tsx) y on-demand tras
 * cada sync de planes; las interacciones (filtros/orden/página) siempre piden datos
 * frescos al backend.
 */
export default async function CompareBody() {
  const [isapres, zonas, prestadores, plans] = await Promise.all([
    withRetry(() => getIsapres(), []),
    withRetry(() => getZonas(), []),
    withRetry(() => getPrestadoresV2(), []),
    withRetry(() => getPlanes({ limit: 15 }), EMPTY_PLANS),
  ]);

  const totalGlobal = isapres.reduce((sum, i) => sum + i.plan_count, 0);

  return (
    <IsapresClient
      initialIsapres={isapres}
      initialZonas={zonas}
      initialPrestadores={prestadores}
      initialData={plans}
      totalGlobal={totalGlobal}
    />
  );
}
