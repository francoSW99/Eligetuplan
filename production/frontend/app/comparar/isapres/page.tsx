import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getIsapres, getPlanes, getZonas, getPrestadores } from '@/lib/api';
import type { PlansQuery } from '@/lib/api';
import PageHeader from '@/components/comparar/page-header';
import IsapresClient from './isapres-client';

function parseIntParam(value?: string): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseFilters(params: Record<string, string>): PlansQuery {
  const q: PlansQuery = { limit: 15 };
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
  const hasFilters = Object.keys(params).length > 0;
  const [isapres, zonas, prestadores, plans, totalsResp] = await Promise.all([
    getIsapres(),
    getZonas(),
    getPrestadores(),
    getPlanes(parseFilters(params)),
    hasFilters ? getPlanes({ limit: 1 }) : Promise.resolve(null),
  ]);

  const totalGlobal = totalsResp?.total ?? plans.total;

  return (
    <div className="min-h-screen bg-[#fbf8f3]">
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

      {/* CTA Bottom */}
      <section className="bg-[#fbf8f3] px-5 md:px-8 pt-6 pb-16 md:pt-10 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative overflow-hidden rounded-[32px] grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center px-7 py-10 md:px-14 md:py-14"
            style={{
              background: 'linear-gradient(180deg, #0f514b 0%, #092e2a 100%)',
              boxShadow: '0 30px 80px -20px rgba(15,81,75,0.4)',
              border: '1px solid rgba(20,220,180,0.15)',
            }}
          >
            <div
              className="pointer-events-none absolute -top-[30%] -right-[10%]"
              style={{
                width: 400,
                height: 400,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20,220,180,.18) 0%, transparent 60%)',
              }}
              aria-hidden
            />
            <div className="relative z-10">
              <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#14dcb4] mb-3.5">
                · ¿Demasiadas opciones? ·
              </div>
              <h2 className="text-3xl md:text-[36px] font-bold text-white tracking-tight leading-tight mb-3">
                Deja que la IA te encuentre el plan ideal.
              </h2>
              <p className="text-white/70 text-base leading-relaxed max-w-lg m-0">
                Nuestro comparador inteligente analiza tu perfil y presupuesto para mostrarte el plan que mejor te calza, en menos de 2 minutos.
              </p>
            </div>
            <div className="relative z-10 flex flex-col gap-2.5">
              <Link
                href="/tu-mejor-plan"
                className="inline-flex items-center justify-center gap-2 text-white font-bold text-base transition-all hover:-translate-y-0.5 no-underline"
                style={{
                  padding: '17px 28px',
                  borderRadius: 16,
                  border: 'none',
                  background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)',
                  boxShadow: '0 14px 30px rgba(20,220,180,0.4)',
                }}
              >
                Encontrar mi Plan Ideal <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud."
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-white font-semibold text-sm transition-all hover:-translate-y-0.5 no-underline"
                style={{
                  padding: '15px 28px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.18)',
                }}
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
