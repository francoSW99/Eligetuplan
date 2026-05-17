// ============================================================
// SECTIONS PART 1 — Live data strip · 3 caminos · Cómo funciona
// ============================================================

// ── Live data strip (right under hero) ──────────────────────────────────
function LiveDataStrip() {
  const D = window.SITE_DATA;
  const items = [
    { v: D.stats.plansTotal.toLocaleString('es-CL'), l: 'Planes vigentes' },
    { v: D.stats.isapres,    l: 'Isapres comparadas' },
    { v: D.stats.regiones,   l: 'Regiones cubiertas' },
    { v: `$${D.stats.ufValueCLP.toLocaleString('es-CL')}`, l: 'UF de hoy' },
  ];
  return (
    <section className="relative bg-cream border-y border-teal/10">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4">
          {items.map((it, i) => (
            <div
              key={it.l}
              className={`flex items-baseline gap-3 md:gap-4 px-3 md:px-5 ${
                i > 0 ? 'md:border-l border-teal/10' : ''
              }`}
            >
              <span className="text-[26px] md:text-[28px] font-extrabold text-teal tabular-nums tracking-tight leading-none">
                {it.v}
              </span>
              <span className="text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                {it.l}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-teal/8 flex flex-wrap items-center justify-between gap-2 text-[12px] text-ink-soft">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            <span>Datos oficiales · Superintendencia de Salud · actualizado al <strong className="text-teal font-semibold">{D.stats.lastUpdate}</strong></span>
          </div>
          <a href="https://www.superdesalud.gob.cl/" target="_blank" rel="noopener noreferrer" className="text-teal font-semibold hover:text-mint-text transition-colors no-underline">
            Verificar fuente →
          </a>
        </div>
      </div>
    </section>
  );
}

// ── 3 caminos — interactive expand-on-hover/scroll, dark teal section ──
// Default state: 3 clean cards in a row, no images, lots of breathing room.
// On hover (desktop) OR when card centers in viewport (mobile/touch):
//   · active card scales up + lifts shadow
//   · contextual visual reveals (slides up from the bottom of the card)
//   · sibling cards dim and slightly shrink
function PathsSection() {
  const D = window.SITE_DATA;
  const [activeId, setActiveId] = React.useState(null);
  const cardRefs = React.useRef({});

  // Mobile: IntersectionObserver triggers active when card is centered in viewport
  React.useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (!isTouch) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry with highest intersection ratio
        let best = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        }
        if (best) {
          const id = best.target.getAttribute('data-path-id');
          setActiveId(id);
        }
      },
      { threshold: [0.55, 0.7, 0.85], rootMargin: '-20% 0% -20% 0%' }
    );

    Object.values(cardRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Card visual content per id
  const visuals = {
    ia:        <IAVisual />,
    comparar:  <ComparePreviewVisual />,
    asesor:    <AsesorVisual />,
  };

  return (
    <section
      id="ia"
      className="relative overflow-hidden text-white py-14 md:py-20"
    >
      {/* TEAL brand background — recovers brand color the user noted was fading */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-deep via-teal to-teal-deep" />
      {/* Subtle decorative blobs */}
      <div
        className="absolute -top-[10%] -right-[5%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,220,180,.16) 0%, transparent 60%)' }}
      />
      <div
        className="absolute -bottom-[20%] -left-[10%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,220,180,.10) 0%, transparent 60%)' }}
      />
      {/* Top accent line (mint, ties to brand) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-mint" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="max-w-2xl mb-9 md:mb-12">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-mint mb-3">
            · 3 caminos · 1 plan ideal ·
          </div>
          <h2 className="text-[clamp(32px,4.4vw,48px)] font-extrabold text-white tracking-[-0.025em] leading-[1.03] mb-4 text-balance">
            Elige la forma que mejor te <span className="serif italic font-medium text-mint">acomoda</span>.
          </h2>
          <p className="text-[16px] text-white/65 leading-relaxed max-w-xl">
            Tres rutas para llegar al mismo lugar: tu plan ideal. Pasa el cursor sobre cada una para ver de qué se trata.
          </p>
        </header>

        {/* Cards row — equal width by default; active card flexes wider */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {D.paths.map((p) => {
            const isActive = activeId === p.id;
            const isDimmed = activeId !== null && !isActive;

            return (
              <a
                key={p.id}
                href={p.href}
                data-path-id={p.id}
                ref={(el) => { cardRefs.current[p.id] = el; }}
                onMouseEnter={() => setActiveId(p.id)}
                onMouseLeave={() => setActiveId(null)}
                onFocus={() => setActiveId(p.id)}
                onBlur={() => setActiveId(null)}
                className={`
                  relative group overflow-hidden rounded-[22px] no-underline
                  transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]
                  flex flex-col
                  ${isActive
                    ? 'min-h-[420px] md:min-h-[460px] scale-[1.02] z-10 bg-gradient-to-br from-white via-white to-mint/8 text-teal shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] ring-1 ring-mint/40'
                    : isDimmed
                    ? 'min-h-[230px] md:min-h-[280px] bg-white/[0.06] text-white border border-white/10 opacity-65 scale-[0.985] backdrop-blur-sm'
                    : 'min-h-[230px] md:min-h-[280px] bg-white/[0.08] text-white border border-mint/20 hover:border-mint/40 backdrop-blur-sm'}
                `}
              >
                {/* Primary ribbon for IA */}
                {p.primary && (
                  <div className="absolute top-5 right-5 z-20">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase transition-colors ${
                      isActive ? 'bg-mint text-[#0f2826]' : 'bg-mint/15 text-mint border border-mint/30'
                    }`}>
                      ★ {p.kicker}
                    </div>
                  </div>
                )}

                {/* Card content */}
                <div className="relative z-10 p-6 md:p-7 flex flex-col h-full">
                  {!p.primary && (
                    <div className={`text-[10.5px] font-bold tracking-[0.22em] uppercase mb-3 transition-colors ${
                      isActive ? 'text-mint-text' : 'text-mint/85'
                    }`}>
                      · {p.kicker} ·
                    </div>
                  )}

                  <h3 className={`font-extrabold tracking-[-0.018em] leading-[1.08] transition-all ${
                    p.primary
                      ? (isActive ? 'text-[26px] md:text-[30px] mt-8' : 'text-[22px] md:text-[24px] mt-8')
                      : (isActive ? 'text-[24px] md:text-[26px]' : 'text-[20px] md:text-[22px]')
                  } ${isActive ? 'text-teal' : 'text-white'}`}>
                    {p.title}
                  </h3>

                  <p className={`mt-2.5 text-[14px] leading-relaxed transition-colors ${
                    isActive ? 'text-ink-soft' : 'text-white/65'
                  }`}>
                    {p.desc}
                  </p>

                  {/* Visual reveal area — only renders when active for cheap idle state */}
                  <div
                    className={`relative mt-4 rounded-2xl overflow-hidden transition-all duration-500 ${
                      isActive ? 'flex-1 min-h-[180px] opacity-100' : 'flex-1 min-h-0 opacity-0'
                    }`}
                  >
                    {isActive && visuals[p.id]}
                  </div>

                  {/* CTA */}
                  <div className={`mt-4 inline-flex items-center gap-2.5 text-[13.5px] font-bold transition-colors ${
                    isActive ? 'text-teal' : 'text-white'
                  }`}>
                    {p.cta}
                    <span className={`inline-grid place-items-center w-7 h-7 rounded-full transition-all ${
                      isActive ? 'bg-mint text-[#0f2826] translate-x-1' : 'bg-mint/20 text-mint group-hover:bg-mint/30'
                    }`}>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Hint */}
        <div className="mt-6 hidden md:flex items-center justify-center gap-2 text-[12px] text-white/45">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11V5l-4 4v6l4 4M15 11V5l4 4v6l-4 4M9 11h6"/></svg>
          Pasa el cursor sobre cada card para ver una previsualización
        </div>
      </div>
    </section>
  );
}

// ── Visual content for each path card on hover/scroll ─────────────────

// 1) AI Visual — abstract illustration of intelligence helping a user decide
//    Built in SVG so it scales perfectly + matches brand colors
function IAVisual() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-teal to-teal-deep p-6 flex items-center justify-center overflow-hidden">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.08]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }} />

      <svg viewBox="0 0 360 220" className="relative w-full max-w-md drop-shadow-2xl">
        {/* User node (left) */}
        <g className="animate-[ia-pulse_3s_ease-in-out_infinite]">
          <circle cx="55" cy="110" r="32" fill="#fbf8f3" />
          <circle cx="55" cy="100" r="11" fill="#0f514b" />
          <path d="M 35 130 Q 55 117 75 130 L 75 142 L 35 142 Z" fill="#0f514b" />
        </g>

        {/* Connection lines with animated dashes */}
        <g stroke="#14dcb4" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="4 6">
          <path d="M 90 90  Q 160 60 220 80" className="animate-[ia-dash_1.8s_linear_infinite]" />
          <path d="M 90 110 Q 160 110 220 110" className="animate-[ia-dash_2.2s_linear_infinite]" />
          <path d="M 90 130 Q 160 160 220 140" className="animate-[ia-dash_2s_linear_infinite]" />
        </g>

        {/* AI Core (right) — hexagonal robot brain */}
        <g>
          <polygon points="270,40 320,70 320,150 270,180 220,150 220,70" fill="#14dcb4" opacity="0.15"/>
          <polygon points="278,55 312,75 312,145 278,165 244,145 244,75" fill="#14dcb4" />
          {/* Brain "eyes" */}
          <rect x="263" y="95" width="10" height="14" rx="2" fill="#0f2826" />
          <rect x="283" y="95" width="10" height="14" rx="2" fill="#0f2826" />
          {/* "Mouth" / interface */}
          <rect x="263" y="120" width="30" height="3" rx="1.5" fill="#0f2826" opacity="0.6" />
          <rect x="266" y="128" width="24" height="2" rx="1" fill="#0f2826" opacity="0.4" />
          {/* Sparkle */}
          <path d="M 310 50 L 313 56 L 319 59 L 313 62 L 310 68 L 307 62 L 301 59 L 307 56 Z" fill="#fbf8f3" className="animate-[ia-sparkle_1.6s_ease-in-out_infinite]"/>
        </g>

        {/* Decision badges floating */}
        <g className="animate-[ia-float_3s_ease-in-out_infinite]">
          <rect x="110" y="35" width="80" height="22" rx="11" fill="#fbf8f3" stroke="#14dcb4" strokeWidth="1.5" />
          <text x="150" y="50" fontSize="10" fontWeight="700" fill="#0f514b" textAnchor="middle">Cobertura ★</text>
        </g>
        <g className="animate-[ia-float_3s_ease-in-out_infinite_-1s]">
          <rect x="125" y="165" width="80" height="22" rx="11" fill="#fbf8f3" stroke="#14dcb4" strokeWidth="1.5" />
          <text x="165" y="180" fontSize="10" fontWeight="700" fill="#0f514b" textAnchor="middle">Ahorro $</text>
        </g>
      </svg>

      {/* Caption */}
      <div className="absolute bottom-4 left-6 right-6 text-center">
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-mint/85">
          IA analiza tu perfil en tiempo real
        </div>
      </div>

      <style>{`
        @keyframes ia-pulse  { 0%,100% { transform: scale(1) } 50% { transform: scale(1.04) } }
        @keyframes ia-dash   { to { stroke-dashoffset: -20 } }
        @keyframes ia-sparkle{ 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes ia-float  { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
      `}</style>
    </div>
  );
}

// 2) Compare Preview — screenshot of the actual comparison page
function ComparePreviewVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden bg-paper rounded-2xl">
      <img
        src="images/comparar-preview.png"
        alt="Vista del comparador de planes"
        className="absolute inset-0 w-full h-full object-cover object-top"
        style={{ objectPosition: '50% 0%' }}
      />
      {/* Subtle gradient overlay at bottom for caption legibility */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent pointer-events-none" />
      {/* Floating pill */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-teal/15 text-[10px] font-bold tracking-[0.14em] uppercase text-teal shadow-sm">
        Vista real del comparador
      </div>
      <div className="absolute bottom-3 left-3 right-3 text-center">
        <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-teal">
          Filtros · precio · cobertura · clínicas
        </div>
      </div>
    </div>
  );
}

// 3) Asesor Visual — human advisor scene
function AsesorVisual() {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      <img
        src="images/familia.jpeg"
        alt="Familia consultando con un asesor"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Teal overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-teal/85 via-teal/35 to-transparent" />

      {/* "Chat bubble" floating element to suggest conversation */}
      <div className="absolute top-4 right-4 max-w-[180px] bg-white rounded-2xl rounded-tr-sm px-3 py-2 shadow-lg">
        <div className="text-[10px] font-bold tracking-[0.14em] uppercase text-mint-text mb-0.5">Asesor certificado</div>
        <div className="text-[11px] font-semibold text-teal leading-snug">"Te llamo en 24 h con 3 opciones"</div>
      </div>

      {/* WhatsApp pill at bottom */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#25D366] text-white text-[11px] font-bold shadow-md">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
          </svg>
          O por WhatsApp al instante
        </div>
      </div>
    </div>
  );
}

// ── Cómo funciona — 3 pasos (formato horizontal compacto, un toque más grande) ──
function HowItWorksSection() {
  const D = window.SITE_DATA;
  return (
    <section className="bg-cream py-14 md:py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,81,75,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,81,75,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="max-w-xl mb-11 md:mb-14">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-mint-text mb-3">
            · El proceso ·
          </div>
          <h2 className="text-[clamp(28px,3.8vw,40px)] font-extrabold text-teal tracking-[-0.02em] leading-[1.05] mb-3">
            Diseñado para no perder tu tiempo.
          </h2>
          <p className="text-[15.5px] md:text-[16px] text-ink-soft leading-relaxed">
            Tres pasos. Cero llamadas no solicitadas. Datos transparentes en cada momento.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-7 md:gap-9">
          {D.steps.map((s, i) => (
            <div key={s.n} className="relative">
              {/* Connector line on desktop */}
              {i < D.steps.length - 1 && (
                <div className="hidden md:block absolute top-[36px] left-[92px] right-[-32px] h-[2px]">
                  <div className="h-full" style={{ background: 'repeating-linear-gradient(90deg, rgba(15,81,75,0.18) 0 6px, transparent 6px 12px)' }} />
                </div>
              )}

              <div className="relative flex items-start gap-5">
                <div className="shrink-0 w-[72px] h-[72px] rounded-2xl bg-teal text-mint flex items-center justify-center font-extrabold text-[26px] tracking-tight shadow-[0_12px_28px_-8px_rgba(15,81,75,0.45)]">
                  {s.n}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-[19px] md:text-[20px] font-bold text-teal mb-2 leading-snug">{s.t}</h3>
                  <p className="text-[14.5px] text-ink-soft leading-relaxed">{s.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-11 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-teal/10 text-[13px] text-teal font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          Tiempo promedio: <strong>4 minutos</strong> desde el inicio hasta el plan firmado
        </div>
      </div>
    </section>
  );
}

window.LiveDataStrip = LiveDataStrip;
window.PathsSection = PathsSection;
window.HowItWorksSection = HowItWorksSection;
