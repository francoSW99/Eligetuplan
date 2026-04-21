import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getIsapres, getPlanes, getZonas, getPrestadores } from '@/lib/api';
import type { PlansQuery } from '@/lib/api';
import IsapresClient from './isapres-client';

function parseIntParam(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseFilters(params: Record<string, string>): PlansQuery {
  const q: PlansQuery = { limit: 21 };
  if (params.isapre) q.isapre = params.isapre;
  if (params.modalidad) q.modalidad = params.modalidad;
  if (params.zona) q.zona = params.zona;
  const precioMin = parseIntParam(params.precio_min_clp);
  const precioMax = parseIntParam(params.precio_max_clp);
  const coberturaHospMin = parseIntParam(params.cobertura_hosp_min);
  const coberturaAmbMin = parseIntParam(params.cobertura_amb_min);
  if (precioMin != null) q.precio_min_clp = precioMin;
  if (precioMax != null) q.precio_max_clp = precioMax;
  if (coberturaHospMin != null) q.cobertura_hosp_min = coberturaHospMin;
  if (coberturaAmbMin != null) q.cobertura_amb_min = coberturaAmbMin;
  if (params.prestador) q.prestador = params.prestador;
  if (params.con_parto) q.con_parto = params.con_parto === 'true';
  if (params.search) q.search = params.search;
  const page = parseIntParam(params.page);
  if (page != null) q.page = page;
  if (params.sort) q.sort = params.sort;
  return q;
}

export default async function CompararIsapresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const [isapres, zonas, prestadores, plans] = await Promise.all([
    getIsapres(),
    getZonas(),
    getPrestadores(),
    getPlanes(parseFilters(params)),
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* Client interactive shell */}
      <IsapresClient
        initialIsapres={isapres}
        initialZonas={zonas}
        initialPrestadores={prestadores}
        initialData={plans}
      />

      {/* CTA Bottom */}
      <section className="bg-[#0f514b] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            ¿No sabes cual elegir?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Dejanos ayudarte. Nuestro comparador inteligente encuentra el plan perfecto para tu perfil.
          </p>
          <Link
            href="/tu-mejor-plan"
            className="inline-flex items-center gap-2 bg-[#14dcb4] text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-[#12c9a4] transition-all shadow-lg"
          >
            Encontrar Mi Plan Ideal <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
