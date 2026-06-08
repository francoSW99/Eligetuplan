'use client';

import Image from "next/image";
import { ISAPRES } from "@/lib/home-data";
import { useMeta } from "@/lib/meta-context";

export default function IsapresMarquee() {
  const { plansTotal } = useMeta();
  const marquee = [...ISAPRES, ...ISAPRES];
  return (
    <section id="isapres" className="bg-[#fbf8f3] py-12 md:py-14 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#14dcb4]" aria-hidden />

      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="text-center mb-7 md:mb-9">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0f9d8a] mb-2.5">
            · Las 7 Isapres del mercado ·
          </div>
          <h2 className="text-[22px] md:text-[28px] font-extrabold text-[#0f514b] tracking-[-0.018em] leading-[1.15] text-balance">
            Comparamos a todas.{" "}
            <span className="serif italic text-[#0f9d8a] font-medium">Sin excepciones.</span>
          </h2>
          <p className="mt-2 text-[13.5px] md:text-[14px] text-[#5a6b6a]">
            Datos oficiales en tiempo real desde la Superintendencia de Salud.
          </p>
        </header>
      </div>

      <div className="group relative">
        <div
          className="absolute inset-y-0 left-0 w-24 md:w-40 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, #fbf8f3 0%, transparent 100%)" }}
        />
        <div
          className="absolute inset-y-0 right-0 w-24 md:w-40 z-10 pointer-events-none"
          style={{ background: "linear-gradient(-90deg, #fbf8f3 0%, transparent 100%)" }}
        />

        <div
          className="flex w-max group-hover:[animation-play-state:paused]"
          style={{ animation: "isapre-scroll 28s linear infinite" }}
        >
          {marquee.map((i, idx) => (
            <a
              key={`${i.slug}-${idx}`}
              href={`/comparar/isapres?isapre=${i.slug}`}
              className="shrink-0 px-6 md:px-10 py-2 flex items-center justify-center transition-transform hover:scale-[1.08]"
              title={`${i.name} · ${i.planCount} planes`}
              aria-label={`${i.name}, ${i.planCount} planes`}
            >
              <Image
                src={i.logo}
                alt={i.name}
                width={200}
                height={80}
                className="h-[54px] md:h-[64px] w-auto object-contain"
                draggable={false}
              />
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 lg:px-10 mt-7 md:mt-9 text-center">
        <a
          href="/comparar/isapres"
          className="inline-flex items-center gap-2 text-[13.5px] font-bold text-[#0f514b] hover:text-[#0f9d8a] transition-colors no-underline"
        >
          Ver las {plansTotal.toLocaleString("es-CL")} planes del catálogo completo
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </section>
  );
}
