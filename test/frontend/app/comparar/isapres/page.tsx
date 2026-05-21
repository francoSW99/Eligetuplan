import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ResultsSkeleton, { SidebarSkeleton } from '@/components/comparar/results-skeleton';
import CompareBody from './compare-body';

function BodyFallback() {
  return (
    <>
      {/* PageHeader skeleton */}
      <section className="relative bg-gradient-to-br from-[#0f514b] to-[#092e2a] py-3 sm:py-3.5 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#14dcb4]" aria-hidden />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            <div className="flex items-baseline gap-3 flex-wrap">
              <div className="h-2.5 w-28 bg-white/15 rounded animate-pulse" />
              <div className="h-4 w-56 bg-white/15 rounded animate-pulse" />
            </div>
            <div className="h-7 w-40 rounded-xl bg-white/8 border border-[#14dcb4]/20 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-4 sm:py-5 md:py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-4 sm:gap-6 lg:gap-8">
          <aside className="hidden lg:block">
            <SidebarSkeleton />
          </aside>
          <ResultsSkeleton />
        </div>
      </section>
    </>
  );
}

export default async function CompararIsapresPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      <Suspense key={JSON.stringify(params)} fallback={<BodyFallback />}>
        <CompareBody params={params} />
      </Suspense>

      {/* CTA Bottom — static, renders immediately */}
      <section className="bg-[#fbf8f3] px-5 sm:px-6 lg:px-10 pt-6 pb-16 md:pt-10 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] grid md:grid-cols-[1.4fr_1fr] gap-6 sm:gap-8 md:gap-10 items-center px-6 py-10 sm:px-8 sm:py-12 md:px-14 md:py-14"
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
