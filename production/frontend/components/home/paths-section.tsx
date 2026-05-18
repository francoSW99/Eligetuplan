'use client';

import { useEffect, useRef, useState } from "react";
import { PATHS } from "@/lib/home-data";

function GridBg() {
  return (
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    />
  );
}

function IAVisual() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0f514b] to-[#092e2a] p-6 flex items-center justify-center overflow-hidden">
      <GridBg />
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

// ── Compare Visual — tabla de planes con filas y barras de cobertura animadas ──
function CompareVisual() {
  // 3 filas: una "match" (highlighted), dos regulares
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0f514b] to-[#092e2a] p-6 flex items-center justify-center overflow-hidden">
      <GridBg />

      <svg viewBox="0 0 360 220" className="relative w-full max-w-md drop-shadow-2xl">
        {/* Chips de filtros flotantes (top) */}
        <g style={{ animation: "ia-float 4s ease-in-out infinite" }}>
          <rect x="20" y="14" width="60" height="18" rx="9" fill="#14dcb4" opacity="0.18" stroke="#14dcb4" strokeWidth="1" />
          <text x="50" y="26" fontSize="8.5" fontWeight="700" fill="#14dcb4" textAnchor="middle">Precio ≤ 7%</text>
        </g>
        <g style={{ animation: "ia-float 4s ease-in-out -1.3s infinite" }}>
          <rect x="86" y="14" width="64" height="18" rx="9" fill="#14dcb4" opacity="0.18" stroke="#14dcb4" strokeWidth="1" />
          <text x="118" y="26" fontSize="8.5" fontWeight="700" fill="#14dcb4" textAnchor="middle">Cobertura ≥80%</text>
        </g>
        <g style={{ animation: "ia-float 4s ease-in-out -2.6s infinite" }}>
          <rect x="156" y="14" width="56" height="18" rx="9" fill="#14dcb4" opacity="0.18" stroke="#14dcb4" strokeWidth="1" />
          <text x="184" y="26" fontSize="8.5" fontWeight="700" fill="#14dcb4" textAnchor="middle">Consalud</text>
        </g>

        {/* Header de tabla */}
        <text x="22" y="56" fontSize="7.5" fontWeight="700" fill="#14dcb4" opacity="0.7" letterSpacing="1">PLAN</text>
        <text x="160" y="56" fontSize="7.5" fontWeight="700" fill="#14dcb4" opacity="0.7" letterSpacing="1">COBERTURA</text>
        <text x="306" y="56" fontSize="7.5" fontWeight="700" fill="#14dcb4" opacity="0.7" letterSpacing="1" textAnchor="middle">PRECIO</text>

        {/* Fila 1 — Match (highlighted) */}
        <g>
          <rect x="14" y="64" width="332" height="42" rx="8" fill="#14dcb4" opacity="0.16" stroke="#14dcb4" strokeWidth="1.5" />
          {/* Plan name */}
          <rect x="22" y="74" width="80" height="6" rx="3" fill="#fbf8f3" />
          <rect x="22" y="86" width="50" height="5" rx="2.5" fill="#fbf8f3" opacity="0.5" />
          {/* Coverage bar */}
          <rect x="150" y="79" width="120" height="6" rx="3" fill="#fbf8f3" opacity="0.15" />
          <g style={{ transformOrigin: "150px 82px", animation: "compare-bar-grow 2.2s ease-out infinite" }}>
            <rect x="150" y="79" width="108" height="6" rx="3" fill="#14dcb4" />
          </g>
          <text x="276" y="87" fontSize="9" fontWeight="700" fill="#14dcb4">90%</text>
          {/* Price */}
          <text x="306" y="89" fontSize="10" fontWeight="800" fill="#fbf8f3" textAnchor="middle">UF 3.4</text>
          {/* Check mark */}
          <circle cx="332" cy="85" r="9" fill="#14dcb4" />
          <path
            d="M 327 85 L 331 89 L 338 81"
            stroke="#0f2826"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="20"
            style={{ animation: "compare-check 2.2s ease-out infinite" }}
          />
          {/* Sparkle on match */}
          <path
            d="M 8 70 L 11 76 L 17 79 L 11 82 L 8 88 L 5 82 L -1 79 L 5 76 Z"
            fill="#14dcb4"
            transform="translate(2, 0)"
            style={{ animation: "ia-sparkle 1.6s ease-in-out infinite" }}
          />
        </g>

        {/* Fila 2 — Regular dimmed */}
        <g style={{ animation: "compare-row-highlight 3s ease-in-out -0.5s infinite" }}>
          <rect x="14" y="114" width="332" height="36" rx="8" fill="#fbf8f3" opacity="0.05" />
          <rect x="22" y="124" width="70" height="6" rx="3" fill="#fbf8f3" opacity="0.7" />
          <rect x="22" y="136" width="45" height="5" rx="2.5" fill="#fbf8f3" opacity="0.35" />
          <rect x="150" y="129" width="120" height="6" rx="3" fill="#fbf8f3" opacity="0.12" />
          <g style={{ transformOrigin: "150px 132px", animation: "compare-bar-grow 2.6s ease-out -0.3s infinite" }}>
            <rect x="150" y="129" width="84" height="6" rx="3" fill="#fbf8f3" opacity="0.5" />
          </g>
          <text x="276" y="137" fontSize="9" fontWeight="600" fill="#fbf8f3" opacity="0.55">70%</text>
          <text x="306" y="139" fontSize="9.5" fontWeight="700" fill="#fbf8f3" opacity="0.55" textAnchor="middle">UF 2.8</text>
        </g>

        {/* Fila 3 — Regular dimmed */}
        <g style={{ animation: "compare-row-highlight 3s ease-in-out -1.5s infinite" }}>
          <rect x="14" y="158" width="332" height="36" rx="8" fill="#fbf8f3" opacity="0.05" />
          <rect x="22" y="168" width="86" height="6" rx="3" fill="#fbf8f3" opacity="0.7" />
          <rect x="22" y="180" width="56" height="5" rx="2.5" fill="#fbf8f3" opacity="0.35" />
          <rect x="150" y="173" width="120" height="6" rx="3" fill="#fbf8f3" opacity="0.12" />
          <g style={{ transformOrigin: "150px 176px", animation: "compare-bar-grow 2.4s ease-out -0.8s infinite" }}>
            <rect x="150" y="173" width="66" height="6" rx="3" fill="#fbf8f3" opacity="0.5" />
          </g>
          <text x="276" y="181" fontSize="9" fontWeight="600" fill="#fbf8f3" opacity="0.55">55%</text>
          <text x="306" y="183" fontSize="9.5" fontWeight="700" fill="#fbf8f3" opacity="0.55" textAnchor="middle">UF 1.9</text>
        </g>

        {/* Cursor que recorre las filas */}
        <g style={{ animation: "compare-cursor 4s ease-in-out infinite", transformOrigin: "center" }}>
          <path d="M 0 0 L 0 12 L 4 9 L 7 14 L 9 13 L 6 8 L 11 8 Z" fill="#fbf8f3" transform="translate(348, 78)" />
        </g>
      </svg>

      <div className="absolute bottom-4 left-6 right-6 text-center">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#14dcb4]/85">
          Filtra 2.072 planes en segundos
        </div>
      </div>
    </div>
  );
}

// ── Asesor Visual — silueta humana con auriculares + pulse de llamada + bubble ──
function AsesorVisual() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-[#0f514b] to-[#092e2a] p-6 flex items-center justify-center overflow-hidden">
      <GridBg />

      <svg viewBox="0 0 360 220" className="relative w-full max-w-md drop-shadow-2xl">
        {/* Pulse rings emanando del headset */}
        <g style={{ transformOrigin: "85px 110px" }}>
          <circle cx="85" cy="110" r="32" fill="none" stroke="#14dcb4" strokeWidth="1.8" opacity="0.6" style={{ animation: "asesor-ring 2.4s ease-out infinite", transformOrigin: "85px 110px" }} />
          <circle cx="85" cy="110" r="32" fill="none" stroke="#14dcb4" strokeWidth="1.8" opacity="0.6" style={{ animation: "asesor-ring 2.4s ease-out -0.8s infinite", transformOrigin: "85px 110px" }} />
          <circle cx="85" cy="110" r="32" fill="none" stroke="#14dcb4" strokeWidth="1.8" opacity="0.6" style={{ animation: "asesor-ring 2.4s ease-out -1.6s infinite", transformOrigin: "85px 110px" }} />
        </g>

        {/* Asesor: cabeza + auriculares + cuerpo */}
        <g>
          {/* Cuerpo */}
          <path d="M 55 158 Q 85 138 115 158 L 115 175 L 55 175 Z" fill="#fbf8f3" />
          {/* Cabeza */}
          <circle cx="85" cy="112" r="26" fill="#fbf8f3" />
          {/* Ojos */}
          <circle cx="77" cy="110" r="2.2" fill="#0f514b" />
          <circle cx="93" cy="110" r="2.2" fill="#0f514b" />
          {/* Sonrisa */}
          <path d="M 76 119 Q 85 124 94 119" stroke="#0f514b" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Auriculares (banda) */}
          <path d="M 62 102 Q 85 78 108 102" stroke="#14dcb4" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Auriculares (copas) */}
          <rect x="56" y="100" width="8" height="14" rx="3" fill="#14dcb4" />
          <rect x="106" y="100" width="8" height="14" rx="3" fill="#14dcb4" />
          {/* Microfono */}
          <path d="M 64 110 Q 70 122 76 128" stroke="#14dcb4" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="76" cy="128" r="2.5" fill="#14dcb4" />
        </g>

        {/* Chat bubble del asesor (loop con bubble animation) */}
        <g style={{ animation: "asesor-bubble 4s ease-in-out infinite" }}>
          <rect x="180" y="50" width="160" height="50" rx="14" fill="#fbf8f3" />
          {/* Tail */}
          <path d="M 180 80 L 168 88 L 180 88 Z" fill="#fbf8f3" />
          {/* Kicker */}
          <text x="192" y="68" fontSize="7.5" fontWeight="700" fill="#0f9d8a" letterSpacing="1.2">ASESOR CERTIFICADO</text>
          {/* Message */}
          <text x="192" y="84" fontSize="10" fontWeight="700" fill="#0f514b">&quot;Te llamo en 24 h con</text>
          <text x="192" y="96" fontSize="10" fontWeight="700" fill="#0f514b">3 opciones para ti.&quot;</text>
        </g>

        {/* Typing dots (siempre) */}
        <g>
          <circle cx="186" cy="120" r="2.5" fill="#fbf8f3" opacity="0.5" style={{ animation: "asesor-dot 1.2s ease-in-out infinite" }} />
          <circle cx="196" cy="120" r="2.5" fill="#fbf8f3" opacity="0.5" style={{ animation: "asesor-dot 1.2s ease-in-out -0.4s infinite" }} />
          <circle cx="206" cy="120" r="2.5" fill="#fbf8f3" opacity="0.5" style={{ animation: "asesor-dot 1.2s ease-in-out -0.8s infinite" }} />
        </g>

        {/* Badge "24h" floating */}
        <g style={{ animation: "ia-float 3.2s ease-in-out infinite" }}>
          <circle cx="305" cy="135" r="22" fill="#14dcb4" />
          <text x="305" y="133" fontSize="13" fontWeight="800" fill="#0f2826" textAnchor="middle">24h</text>
          <text x="305" y="146" fontSize="6.5" fontWeight="700" fill="#0f2826" textAnchor="middle" letterSpacing="0.6">RESPUESTA</text>
        </g>

        {/* Checkmark certificado */}
        <g style={{ animation: "ia-float 3.2s ease-in-out -1.2s infinite" }}>
          <circle cx="245" cy="160" r="14" fill="#fbf8f3" />
          <path
            d="M 239 160 L 244 165 L 252 156"
            stroke="#0f9d8a"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <div className="absolute bottom-4 left-6 right-6 text-center">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#14dcb4]/85">
          Asesor humano · sin costo · sin compromiso
        </div>
      </div>
    </div>
  );
}

const VISUALS: Record<string, React.ReactNode> = {
  ia: <IAVisual />,
  comparar: <CompareVisual />,
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
