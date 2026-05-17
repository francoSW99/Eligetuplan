'use client';

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { PATHS } from "@/lib/home-data";

function IAVisual() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0f514b] to-[#092e2a] p-6 flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <svg viewBox="0 0 360 220" className="relative w-full max-w-md drop-shadow-2xl">
        <g style={{ animation: "ia-pulse 3s ease-in-out infinite" }}>
          <circle cx="55" cy="110" r="32" fill="#fbf8f3" />
          <circle cx="55" cy="100" r="11" fill="#0f514b" />
          <path d="M 35 130 Q 55 117 75 130 L 75 142 L 35 142 Z" fill="#0f514b" />
        </g>
        <g stroke="#14dcb4" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="4 6">
          <path d="M 90 90  Q 160 60 220 80"  style={{ animation: "ia-dash 1.8s linear infinite" }} />
          <path d="M 90 110 Q 160 110 220 110" style={{ animation: "ia-dash 2.2s linear infinite" }} />
          <path d="M 90 130 Q 160 160 220 140" style={{ animation: "ia-dash 2s linear infinite" }} />
        </g>
        <g>
          <polygon points="270,40 320,70 320,150 270,180 220,150 220,70" fill="#14dcb4" opacity="0.15" />
          <polygon points="278,55 312,75 312,145 278,165 244,145 244,75" fill="#14dcb4" />
          <rect x="263" y="95" width="10" height="14" rx="2" fill="#0f2826" />
          <rect x="283" y="95" width="10" height="14" rx="2" fill="#0f2826" />
          <rect x="263" y="120" width="30" height="3" rx="1.5" fill="#0f2826" opacity="0.6" />
          <rect x="266" y="128" width="24" height="2" rx="1" fill="#0f2826" opacity="0.4" />
          <path
            d="M 310 50 L 313 56 L 319 59 L 313 62 L 310 68 L 307 62 L 301 59 L 307 56 Z"
            fill="#fbf8f3"
            style={{ animation: "ia-sparkle 1.6s ease-in-out infinite" }}
          />
        </g>
        <g style={{ animation: "ia-float 3s ease-in-out infinite" }}>
          <rect x="110" y="35" width="80" height="22" rx="11" fill="#fbf8f3" stroke="#14dcb4" strokeWidth="1.5" />
          <text x="150" y="50" fontSize="10" fontWeight="700" fill="#0f514b" textAnchor="middle">Cobertura ★</text>
        </g>
        <g style={{ animation: "ia-float 3s ease-in-out -1s infinite" }}>
          <rect x="125" y="165" width="80" height="22" rx="11" fill="#fbf8f3" stroke="#14dcb4" strokeWidth="1.5" />
          <text x="165" y="180" fontSize="10" fontWeight="700" fill="#0f514b" textAnchor="middle">Ahorro $</text>
        </g>
      </svg>
      <div className="absolute bottom-4 left-6 right-6 text-center">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#14dcb4]/85">
          IA analiza tu perfil en tiempo real
        </div>
      </div>
    </div>
  );
}

function ComparePreviewVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-[#fbf8f3] rounded-2xl">
      <Image
        src="/comparar-preview.png"
        alt="Vista del comparador de planes"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover object-top"
        style={{ objectPosition: "50% 0%" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#fbf8f3] to-transparent pointer-events-none" />
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#0f514b]/15 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0f514b] shadow-sm">
        Vista real del comparador
      </div>
      <div className="absolute bottom-3 left-3 right-3 text-center">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0f514b]">
          Filtros · precio · cobertura · clínicas
        </div>
      </div>
    </div>
  );
}

function AsesorVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <Image
        src="/familia.jpeg"
        alt="Familia consultando con un asesor"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f514b]/85 via-[#0f514b]/35 to-transparent" />
      <div className="absolute top-4 right-4 max-w-[180px] bg-white rounded-2xl rounded-tr-sm px-3 py-2 shadow-lg">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#0f9d8a] mb-0.5">Asesor certificado</div>
        <div className="text-[11px] font-semibold text-[#0f514b] leading-snug">&ldquo;Te llamo en 24 h con 3 opciones&rdquo;</div>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold shadow-md">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
          O por WhatsApp al instante
        </div>
      </div>
    </div>
  );
}

const VISUALS: Record<string, React.ReactNode> = {
  ia: <IAVisual />,
  comparar: <ComparePreviewVisual />,
  asesor: <AsesorVisual />,
};

export default function PathsSection() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (!isTouch) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        }
        if (best) {
          const id = best.target.getAttribute("data-path-id");
          setActiveId(id);
        }
      },
      { threshold: [0.55, 0.7, 0.85], rootMargin: "-20% 0% -20% 0%" }
    );

    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="ia" className="relative overflow-hidden text-white py-14 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#092e2a] via-[#0f514b] to-[#092e2a]" />
      <div
        className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,220,180,.16) 0%, transparent 60%)" }}
      />
      <div
        className="absolute -bottom-[20%] -left-[10%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,220,180,.10) 0%, transparent 60%)" }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#14dcb4]" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="max-w-2xl mb-9 md:mb-12">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#14dcb4] mb-3">
            · 3 caminos · 1 plan ideal ·
          </div>
          <h2
            className="font-extrabold text-white tracking-[-0.025em] leading-[1.03] mb-4 text-balance"
            style={{ fontSize: "clamp(32px,4.4vw,48px)" }}
          >
            Elige la forma que mejor te{" "}
            <span className="serif italic font-medium text-[#14dcb4]">acomoda</span>.
          </h2>
          <p className="text-[16px] text-white/65 leading-relaxed max-w-xl">
            Tres rutas para llegar al mismo lugar: tu plan ideal. Pasa el cursor sobre cada una para ver de qué se trata.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {PATHS.map((p) => {
            const isActive = activeId === p.id;
            const isDimmed = activeId !== null && !isActive;

            return (
              <a
                key={p.id}
                href={p.href}
                data-path-id={p.id}
                ref={(el) => {
                  cardRefs.current[p.id] = el;
                }}
                onMouseEnter={() => setActiveId(p.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(p.id)}
                onBlur={() => setActiveId(null)}
                className={`
                  relative group overflow-hidden rounded-[22px] no-underline
                  transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]
                  flex flex-col
                  ${
                    isActive
                      ? "min-h-[420px] md:min-h-[460px] scale-[1.02] z-10 bg-gradient-to-br from-white via-white to-[#14dcb4]/8 text-[#0f514b] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] ring-1 ring-[#14dcb4]/40"
                      : isDimmed
                      ? "min-h-[230px] md:min-h-[280px] bg-white/[0.06] text-white border border-white/10 opacity-65 scale-[0.985] backdrop-blur-sm"
                      : "min-h-[230px] md:min-h-[280px] bg-white/[0.08] text-white border border-[#14dcb4]/20 hover:border-[#14dcb4]/40 backdrop-blur-sm"
                  }
                `}
              >
                {p.primary && (
                  <div className="absolute top-5 right-5 z-20">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase transition-colors ${
                        isActive ? "bg-[#14dcb4] text-[#0f2826]" : "bg-[#14dcb4]/15 text-[#14dcb4] border border-[#14dcb4]/30"
                      }`}
                    >
                      ★ {p.kicker}
                    </div>
                  </div>
                )}

                <div className="relative z-10 p-6 md:p-7 flex flex-col h-full">
                  {!p.primary && (
                    <div
                      className={`text-[10.5px] font-bold tracking-[0.22em] uppercase mb-3 transition-colors ${
                        isActive ? "text-[#0f9d8a]" : "text-[#14dcb4]/85"
                      }`}
                    >
                      · {p.kicker} ·
                    </div>
                  )}

                  <h3
                    className={`font-extrabold tracking-[-0.018em] leading-[1.08] transition-all ${
                      p.primary
                        ? isActive
                          ? "text-[26px] md:text-[30px] mt-8"
                          : "text-[22px] md:text-[24px] mt-8"
                        : isActive
                        ? "text-[24px] md:text-[26px]"
                        : "text-[20px] md:text-[22px]"
                    } ${isActive ? "text-[#0f514b]" : "text-white"}`}
                  >
                    {p.title}
                  </h3>

                  <p
                    className={`mt-2.5 text-[14px] leading-relaxed transition-colors ${
                      isActive ? "text-[#5a6b6a]" : "text-white/65"
                    }`}
                  >
                    {p.desc}
                  </p>

                  <div
                    className={`relative mt-4 rounded-2xl overflow-hidden transition-all duration-500 ${
                      isActive ? "flex-1 min-h-[180px] opacity-100" : "flex-1 min-h-0 opacity-0"
                    }`}
                  >
                    {isActive && VISUALS[p.id]}
                  </div>

                  <div
                    className={`mt-4 inline-flex items-center gap-2.5 text-[13.5px] font-bold transition-colors ${
                      isActive ? "text-[#0f514b]" : "text-white"
                    }`}
                  >
                    {p.cta}
                    <span
                      className={`inline-grid place-items-center w-7 h-7 rounded-full transition-all ${
                        isActive ? "bg-[#14dcb4] text-[#0f2826] translate-x-1" : "bg-[#14dcb4]/20 text-[#14dcb4] group-hover:bg-[#14dcb4]/30"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        <div className="mt-6 hidden md:flex items-center justify-center gap-2 text-[12px] text-white/45">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11V5l-4 4v6l4 4M15 11V5l4 4v6l-4 4M9 11h6" />
          </svg>
          Pasa el cursor sobre cada card para ver una previsualización
        </div>
      </div>
    </section>
  );
}
