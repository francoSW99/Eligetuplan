import { getIsapres, getPlanes, getZonas, getPrestadoresV2 } from '@/lib/api';
import type { PlansQuery } from '@/lib/api';
import { getTotalFactor, parseBeneficiarios } from '@/lib/factores';
import PageHeader from '@/components/comparar/page-header';
import IsapresClient from './isapres-client';

function parseIntParam(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseFilters(
  params: Record<string, string>,
  sumaFactores: number,
  numBeneficiarios: number
): PlansQuery {
  const q: PlansQuery = { limit: 15 };
  if (params.isapre) q.isapre = params.isapre;
  if (params.modalidad) q.modalidad = params.modalidad;
  if (params.zona) q.zona = params.zona;
  const precioMin = parseIntParam(params.precio_min_clp);
  const precioMax = parseIntParam(params.precio_max_clp);
  const coberturaHospMin = parseIntParam(params.cobertura_hosp_min);
  const coberturaAmbMin = parseIntParam(params.cobertura_amb_min);

  // El 7% legal es un MARCADOR visual, no un filtro estricto. Cuando aplicar_tope_legal=true
  // se ignora el precio_max_clp en el backend → muestra todos los planes. Las cards muestran
  // "Pagas $X extra sobre tu 7%" en los que exceden.
  // Si en cambio el usuario movió el slider de precio (sin 7%), respetamos el cap estricto.
  const isLegalBudgetSoft = params.aplicar_tope_legal === 'true';

  // Fórmula tu7: displayed = base × sumaF + ges × N. Para que displayed ≤ X →
  // base ≤ (X - gesAvg × N) / sumaF. Usamos GES promedio aprox 0.7 UF ≈ 28k CLP.
  const GES_AVG_CLP = 28_000;
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
  if (params.prestador) q.prestador = params.prestador;
  if (params.prestador_ids) q.prestador_ids = params.prestador_ids;
  if (params.con_parto) q.con_parto = params.con_parto === 'true';
  if (params.search) q.search = params.search;
  const page = parseIntParam(params.page);
  if (page != null) q.page = page;
  if (params.sort) q.sort = params.sort;
  return q;
}

export default async function CompareBody({
  params,
}: {
  params: Record<string, string>;
}) {
  const hasFilters = Object.keys(params).length > 0;
  const beneficiarios = parseBeneficiarios(params.ben ?? null);
  const totalFactor = getTotalFactor(beneficiarios);
  const [isapres, zonas, prestadores, plans, totalsResp] = await Promise.all([
    getIsapres(),
    getZonas(),
    getPrestadoresV2(),
    getPlanes(parseFilters(params, totalFactor, beneficiarios.length)),
    hasFilters ? getPlanes({ limit: 1 }) : Promise.resolve(null),
  ]);

  const totalGlobal = totalsResp?.total ?? plans.total;

  return (
    <>
      <PageHeader
        totalShowing={plans.items.length}
        totalFiltered={plans.total}
        totalGlobal={totalGlobal}
      />

      <IsapresClient
        initialIsapres={isapres}
        initialZonas={zonas}
        initialPrestadores={prestadores}
        initialData={plans}
      />
    </>
  );
}
