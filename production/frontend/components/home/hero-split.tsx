'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import SevenPercentCalculator from "./seven-percent-calculator";
import { useMeta } from "@/lib/meta-context";
import { track } from "@/lib/analytics";

const HERO_SLIDES = ["/familia.jpeg", "/kine.jpeg", "/cirugia.png"];
const SLIDE_DURATION_MS = 4200;

function HeroBackground() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((v) => (v + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  const overlay =
    "linear-gradient(105deg, rgba(15,81,75,.94) 0%, rgba(15,81,75,.80) 45%, rgba(15,81,75,.55) 75%, rgba(9,46,42,.65) 100%)";

  return (
    <>
      <div className="absolute inset-0 overflow-hidden">
        {HERO_SLIDES.map((img, i) => (
          <div
            key={img}
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "50% 35%",
              opacity: i === active ? 1 : 0,
              transform: i === active ? "scale(1.08)" : "scale(1.02)",
              transition: "opacity 0.9s ease-in-out, transform 5s linear",
              willChange: "opacity, transform",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ background: overlay }} />

      <div
        className="absolute inset-x-0 bottom-0 h-[180px] pointer-events-none"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(9,46,42,.95) 100%)" }}
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, rgba(20,220,180,.4) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(20,220,180,.3) 0%, transparent 45%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-[140px] bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

      <div className="absolute bottom-6 left-6 md:left-10 z-10 flex gap-1.5 items-center">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Imagen ${i + 1} de ${HERO_SLIDES.length}`}
            className="group relative h-6 flex items-center"
            style={{ width: 44 }}
          >
            <span
              className="block w-full rounded-full transition-all"
              style={{
                height: 2,
                background: i === active ? "rgba(20,220,180,1)" : "rgba(255,255,255,0.25)",
              }}
            />
            {i === active && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  height: 2,
                  width: 0,
                  background: "rgba(255,255,255,0.95)",
                  animation: `hero-prog ${SLIDE_DURATION_MS}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </>
  );
}

export default function HeroSplit() {
  const { plansTotal } = useMeta();

  return (
    <section
      id="top"
      className="relative overflow-hidden text-white pt-[84px] pb-10 sm:pt-[92px] sm:pb-12 md:pt-[116px] lg:pt-[124px] lg:pb-14"
      style={{ animation: "hero-fade-in 0.7s cubic-bezier(.2,.8,.2,1)" }}
    >
      <HeroBackground />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-6 sm:gap-8 lg:gap-12 items-start">
          <div className="max-w-[620px]">
            <Link
              href="/comparar/isapres"
              onClick={() => track.comparadorClick("hero_cta")}
              className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-3 sm:mb-4 font-extrabold text-[12px] sm:text-[13px] uppercase tracking-[0.1em] text-[#0f2826] shadow-[0_10px_28px_rgba(20,220,180,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(20,220,180,0.6)] no-underline"
              style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ¡Compara y cotiza {plansTotal.toLocaleString("es-CL")} planes de salud AQUÍ!
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <h1
              className="font-extrabold tracking-[-0.025em] leading-[1.05] sm:leading-[1] mb-3 sm:mb-4"
              style={{ fontSize: "clamp(28px,5.2vw,54px)" }}
            >
              ¿Buscas el{" "}
              <span className="text-[#14dcb4] serif font-medium italic">plan de salud ideal</span>{" "}
              para ti y tu familia?
            </h1>

            <p className="text-[15px] sm:text-[16px] lg:text-[17px] text-white/72 leading-relaxed max-w-[540px] mb-4 sm:mb-5">
              En <strong className="text-white font-semibold">EligeTuPlan</strong> te ayudamos de 3 formas distintas — tú escoges la que más te acomode:
            </p>

            <div className="space-y-2.5">
              {[
                {
                  href: "/comparar/isapres",
                  label: "Compara todos los planes tú mismo",
                  sub: "Más de 2.000 planes · filtra por precio, cobertura y según tu 7% disponible",
                  badge: null as string | null,
                  onClick: () => track.comparadorClick("hero_cta"),
                  icon: (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                  ),
                },
                {
                  href: "/buscar",
                  label: "Solicita ayuda a un asesor certificado",
                  sub: "Verificados por la Superintendencia · te contactan inmediatamente",
                  badge: "Sin costo" as string | null,
                  onClick: () => track.asesorClick("hero_cta"),
                  icon: (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ),
                },
                {
                  href: "/tu-mejor-plan",
                  label: "Deja que la IA encuentre tu plan ideal",
                  sub: "3 preguntas · 90 segundos · resultado al instante",
                  badge: null as string | null,
                  onClick: () => track.iaClick("hero_cta"),
                  icon: (
                    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3l1.9 5.7L19.6 10l-5.7 1.9L12 17.6l-1.9-5.7L4.4 10l5.7-1.9L12 3z" />
                      <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
                    </svg>
                  ),
                },
              ].map((opt, i) => (
                <Link
                  key={opt.href}
                  href={opt.href}
                  onClick={opt.onClick}
                  style={{ animation: `hero-fade-in 0.55s cubic-bezier(.2,.8,.2,1) ${0.12 + i * 0.1}s backwards` }}
                  className="group flex items-center gap-3.5 px-3.5 py-3 sm:py-3.5 rounded-xl border backdrop-blur-[2px] transition-all duration-200 no-underline bg-white/[0.07] border-white/10 hover:-translate-y-0.5 hover:bg-[#14dcb4]/[0.14] hover:border-[#14dcb4]/55 hover:shadow-[0_12px_28px_rgba(20,220,180,0.25)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14dcb4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f514b]"
                >
                  <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center transition-all duration-200 bg-[#14dcb4]/12 border-[#14dcb4]/25 text-[#14dcb4] group-hover:scale-105 group-hover:bg-[#14dcb4] group-hover:border-[#14dcb4] group-hover:text-[#0f2826] group-hover:shadow-[0_4px_14px_rgba(20,220,180,0.4)]">
                    {opt.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-[14px] sm:text-[14.5px] leading-snug">{opt.label}</span>
                      {opt.badge && (
                        <span className="text-[9.5px] font-extrabold uppercase tracking-[0.08em] px-2 py-[3px] rounded-full leading-none bg-[#14dcb4]/15 text-[#14dcb4] border border-[#14dcb4]/30">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-white/50 text-[12px] sm:text-[12.5px] mt-0.5">{opt.sub}</div>
                  </div>
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 bg-white/[0.06] text-white/35 group-hover:translate-x-1 group-hover:bg-[#14dcb4]/25 group-hover:text-[#14dcb4]">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div id="calc" className="lg:max-w-[460px] lg:ml-auto w-full">
            <SevenPercentCalculator />
          </div>
        </div>
      </div>
    </section>
  );
}
