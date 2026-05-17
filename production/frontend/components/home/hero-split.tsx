'use client';

import { useEffect, useState } from "react";
import SevenPercentCalculator from "./seven-percent-calculator";
import { STATS } from "@/lib/home-data";

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

const TRUST_ROWS = [
  {
    icon: "shield" as const,
    t: "Datos oficiales de la Superintendencia de Salud",
    s: `actualizado al ${STATS.lastUpdate}`,
  },
  {
    icon: "eye" as const,
    t: "Sin pedir email para ver tus resultados",
    s: "preview transparente antes de cualquier formulario",
  },
  {
    icon: "no" as const,
    t: "Sin costo y sin spam",
    s: "cobramos comisión legal directo de las Isapres",
  },
];

export default function HeroSplit() {
  return (
    <section
      id="top"
      className="relative overflow-hidden text-white pt-[120px] pb-20 lg:pt-[160px] lg:pb-28"
      style={{ animation: "hero-fade-in 0.7s cubic-bezier(.2,.8,.2,1)" }}
    >
      <HeroBackground />
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">
          <div className="max-w-[620px]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14dcb4]/12 border border-[#14dcb4]/30 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#14dcb4]">
                Comparador 100% gratuito · {STATS.plansTotal.toLocaleString("es-CL")} planes
              </span>
            </div>

            <h1
              className="font-extrabold tracking-[-0.025em] leading-[0.98] mb-6"
              style={{ fontSize: "clamp(40px,5.8vw,72px)" }}
            >
              ¿Cuánto{" "}
              <span className="text-[#14dcb4] serif font-medium italic">deberías</span>{" "}
              pagar por tu plan de salud?
            </h1>

            <p className="text-[17px] lg:text-[18px] text-white/72 leading-relaxed max-w-[540px] mb-8">
              La ley te reserva el <strong className="text-white font-semibold">7% de tu sueldo bruto</strong> para salud. Ingrésalo aquí y te mostramos cuántos planes vigentes están realmente a tu alcance — sin formularios, sin cuentas, sin promesas raras.
            </p>

            <div className="space-y-2.5">
              {TRUST_ROWS.map((row) => (
                <div key={row.t} className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-[#14dcb4]/12 border border-[#14dcb4]/25 flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5 text-[#14dcb4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      {row.icon === "shield" && <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />}
                      {row.icon === "eye" && (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                      {row.icon === "no" && (
                        <>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M5 5l14 14" />
                        </>
                      )}
                    </svg>
                  </div>
                  <div className="text-[14px] leading-snug">
                    <div className="font-semibold text-white/95">{row.t}</div>
                    <div className="text-white/45 text-[12.5px]">{row.s}</div>
                  </div>
                </div>
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
