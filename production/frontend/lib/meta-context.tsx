'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SiteMeta } from '@/lib/api';
import { STATS } from '@/lib/home-data';

// Default = valores estáticos de STATS. Sirve como fallback si un componente
// se renderiza fuera del provider (o antes de que el fetch resuelva).
const DEFAULT_META: SiteMeta = {
  ufValueCLP: STATS.ufValueCLP,
  plansTotal: STATS.plansTotal,
  lastUpdate: STATS.lastUpdate,
};

const MetaContext = createContext<SiteMeta>(DEFAULT_META);

export function MetaProvider({
  value,
  children,
}: {
  value: SiteMeta;
  children: ReactNode;
}) {
  return <MetaContext.Provider value={value}>{children}</MetaContext.Provider>;
}

/** UF del día, total de planes y fecha de última actualización, en vivo desde app_meta. */
export function useMeta(): SiteMeta {
  return useContext(MetaContext);
}
