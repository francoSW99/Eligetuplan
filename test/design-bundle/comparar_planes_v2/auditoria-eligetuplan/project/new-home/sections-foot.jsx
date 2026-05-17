// ============================================================
// SECTIONS PART 2 — Isapres · FAQ · Final CTA · Footer
// ============================================================

const { useState: useState2 } = React;

// ── Isapres section — dynamic infinite marquee (like the original site)
//    Sits right under LiveDataStrip, BEFORE the "3 caminos" section.
//    Pause on hover; logos at full color (no opacity-70 — that was an audit finding).
function IsapresSection() {
  const D = window.SITE_DATA;
  // Duplicate the list so the marquee loops seamlessly
  const marquee = [...D.isapres, ...D.isapres];
  return (
    <section id="isapres" className="bg-paper py-12 md:py-14 relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-mint" aria-hidden />

      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="text-center mb-7 md:mb-9">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-mint-text mb-2.5">
            · Las 7 Isapres del mercado ·
          </div>
          <h2 className="text-[22px] md:text-[28px] font-extrabold text-teal tracking-[-0.018em] leading-[1.15] text-balance">
            Comparamos a todas. <span className="serif italic text-mint-text font-medium">Sin excepciones.</span>
          </h2>
          <p className="mt-2 text-[13.5px] md:text-[14px] text-ink-soft">
            Datos oficiales en tiempo real desde la Superintendencia de Salud.
          </p>
        </header>
      </div>

      {/* Marquee — full-width, breaks the container */}
      <div className="group relative">
        {/* Edge fades — paper color so logos disappear smoothly at margins */}
        <div className="absolute inset-y-0 left-0 w-24 md:w-40 z-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, #fbf8f3 0%, transparent 100%)' }} />
        <div className="absolute inset-y-0 right-0 w-24 md:w-40 z-10 pointer-events-none" style={{ background: 'linear-gradient(-90deg, #fbf8f3 0%, transparent 100%)' }} />

        <div className="flex w-max animate-[isapre-scroll_28s_linear_infinite] group-hover:[animation-play-state:paused]">
          {marquee.map((i, idx) => (
            <a
              key={`${i.slug}-${idx}`}
              href={`/comparar/isapres?isapre=${i.slug}`}
              className="shrink-0 px-6 md:px-10 py-2 flex items-center justify-center transition-transform hover:scale-[1.08]"
              title={`${i.name} · ${i.planCount} planes`}
              aria-label={`${i.name}, ${i.planCount} planes`}
            >
              <img
                src={i.logo}
                alt={i.name}
                className="h-[54px] md:h-[64px] w-auto object-contain"
                draggable="false"
              />
            </a>
          ))}
        </div>

        <style>{`
          @keyframes isapre-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @media (prefers-reduced-motion: reduce) {
            .group .animate-\\[isapre-scroll_28s_linear_infinite\\] {
              animation: none !important;
              justify-content: center;
              flex-wrap: wrap;
              gap: 24px;
            }
          }
        `}</style>
      </div>

      <div className="mx-auto max-w-[1280px] px-6 lg:px-10 mt-7 md:mt-9 text-center">
        <a
          href="/comparar/isapres"
          className="inline-flex items-center gap-2 text-[13.5px] font-bold text-teal hover:text-mint-text transition-colors no-underline"
        >
          Ver las 1.854 planes del catálogo completo
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </section>
  );
}

// ── Trust band — Superintendencia, prensa, números ──────────────────────
function TrustBand() {
  const D = window.SITE_DATA;
  return (
    <section className="bg-teal py-14 md:py-16 relative overflow-hidden text-white">
      <div className="absolute -top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(20,220,180,.12) 0%, transparent 60%)' }} />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 items-center">
          {/* Left — claim */}
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-mint mb-3">· Confianza verificable ·</div>
            <h2 className="text-[26px] md:text-[32px] font-extrabold tracking-[-0.02em] leading-[1.1] max-w-[16ch]">
              Auditados por <span className="serif italic text-mint font-medium">la fuente oficial</span>.
            </h2>
          </div>

          {/* Divider */}
          <div className="hidden md:block h-24 w-px bg-white/15" />

          {/* Right — facts */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="text-[36px] font-extrabold text-mint leading-none tabular-nums">1.854</div>
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/55 mt-1.5">planes verificados</div>
            </div>
            <div>
              <div className="text-[36px] font-extrabold text-mint leading-none tabular-nums">24 h</div>
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/55 mt-1.5">tiempo de respuesta</div>
            </div>
            <div>
              <div className="text-[36px] font-extrabold text-mint leading-none tabular-nums">100%</div>
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/55 mt-1.5">gratis · sin compromiso</div>
            </div>
            <div>
              <div className="text-[36px] font-extrabold text-mint leading-none tabular-nums">0</div>
              <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/55 mt-1.5">spam · llamadas no solicitadas</div>
            </div>
          </div>
        </div>

        {/* Source attribution */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-white/55">
          <span>Fuente: <a href="https://www.superdesalud.gob.cl/" target="_blank" rel="noopener noreferrer" className="text-mint font-semibold hover:underline no-underline">Superintendencia de Salud</a> · <a href="https://www.isapresdechile.cl/" target="_blank" rel="noopener noreferrer" className="text-mint font-semibold hover:underline no-underline">AICH</a> · Actualizado al {D.stats.lastUpdate}</span>
          <span className="font-mono text-[10.5px] tracking-wider text-white/35">UF · CLP · OFICIAL · LIVE</span>
        </div>
      </div>
    </section>
  );
}

// ── FAQ accordion ───────────────────────────────────────────────────────
function FAQSection() {
  const D = window.SITE_DATA;
  const [openIdx, setOpenIdx] = useState2(0); // primero abierto

  return (
    <section id="faq" className="bg-paper py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
          <header className="lg:sticky lg:top-32 self-start">
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-mint-text mb-3">
              · Preguntas frecuentes ·
            </div>
            <h2 className="text-[clamp(28px,4vw,44px)] font-extrabold text-teal tracking-[-0.02em] leading-[1.05] mb-4 text-balance">
              Lo que <span className="serif italic font-medium text-mint-text">todos</span> nos preguntan.
            </h2>
            <p className="text-[15px] text-ink-soft leading-relaxed mb-6">
              Si hay algo que no quedó claro, un asesor responde por WhatsApp en menos de un minuto.
            </p>
            <a
              href="https://wa.me/56968319807?text=Hola%2C%20tengo%20una%20pregunta."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal text-white text-[13.5px] font-bold no-underline hover:-translate-y-0.5 transition-transform"
            >
              <svg className="w-4 h-4 text-mint" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
              Preguntar por WhatsApp
            </a>
          </header>

          <div className="space-y-3">
            {D.faqs.map((f, i) => {
              const open = openIdx === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all ${open ? 'bg-white border-mint/30 shadow-[0_18px_36px_-18px_rgba(15,81,75,0.2)]' : 'bg-white border-teal/8 hover:border-teal/20'}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? -1 : i)}
                    className="w-full flex items-start justify-between gap-5 text-left p-6"
                    aria-expanded={open}
                  >
                    <span className="flex items-start gap-4">
                      <span className="shrink-0 mt-0.5 font-mono text-[11px] font-semibold text-mint-text tracking-wider">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-bold text-teal text-[16px] leading-snug pr-4">{f.q}</span>
                    </span>
                    <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${open ? 'bg-mint border-mint text-teal' : 'border-teal/15 text-teal'}`}>
                      <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-45' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </span>
                  </button>
                  {open && (
                    <div className="px-6 pb-6 -mt-1 pl-[60px] pr-16 text-[15px] text-ink-soft leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ───────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section id="asesor" className="bg-paper px-6 lg:px-10 pb-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-[32px] grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-12 items-center px-8 py-12 md:px-14 md:py-16 bg-gradient-to-br from-teal to-teal-deep border border-mint/15 shadow-[0_30px_80px_-20px_rgba(15,81,75,0.45)]">
          <div className="absolute -top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(20,220,180,.2) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

          <div className="relative text-white">
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-mint mb-3">
              · Listo para empezar ·
            </div>
            <h2 className="text-[clamp(28px,3.8vw,42px)] font-extrabold tracking-[-0.022em] leading-[1.05] mb-4 text-balance">
              Tu plan ideal está a <span className="serif italic font-medium text-mint">90 segundos</span> de distancia.
            </h2>
            <p className="text-[15px] md:text-[16px] text-white/72 leading-relaxed max-w-[480px]">
              Sin formularios eternos, sin llamadas no solicitadas. Solo el plan correcto al precio justo — el que tu 7% puede pagar.
            </p>
          </div>

          <div className="relative flex flex-col gap-3">
            <a
              href="#calc"
              className="px-7 py-4 rounded-2xl bg-gradient-to-br from-mint to-[#0f9d8a] text-[#0f2826] font-bold text-[15px] shadow-[0_14px_30px_rgba(20,220,180,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 no-underline"
            >
              Calcular mi 7% legal
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
            <a
              href="https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud."
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-white/8 border border-white/18 text-white font-semibold text-[14px] hover:bg-white/12 transition-colors flex items-center justify-center gap-2 no-underline backdrop-blur-md"
            >
              <svg className="w-4 h-4 text-mint" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
              Prefiero hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────
function SiteFooter() {
  const D = window.SITE_DATA;
  const cols = [
    { t: 'Comparador', items: [
      { l: 'Comparar 1.854 planes', h: '/comparar/isapres' },
      { l: 'Plan ideal con IA',     h: '/tu-mejor-plan' },
      { l: 'Cotiza con asesor',     h: '/buscar' },
      { l: 'Cómo funciona',         h: '/como-funciona' },
      { l: 'Preguntas frecuentes',  h: '/faq' },
    ]},
    { t: 'Isapres', items: D.isapres.map(i => ({ l: i.name, h: `/comparar/isapres?isapre=${i.slug}` })) },
    { t: 'Fuentes oficiales', items: [
      { l: 'Superintendencia de Salud', h: 'https://www.superdesalud.gob.cl/', ext: true },
      { l: 'Isapres de Chile (AICH)',   h: 'https://www.isapresdechile.cl/',  ext: true },
      { l: 'Ministerio de Salud',       h: 'https://www.minsal.cl/',          ext: true },
      { l: 'FONASA',                    h: 'https://www.fonasa.cl/',          ext: true },
    ]},
  ];

  return (
    <footer className="bg-teal-deepest text-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10 pt-16 pb-10">
        <div className="grid md:grid-cols-[1.4fr_repeat(3,1fr)] gap-10 md:gap-12">
          <div>
            <img src={D.brand.logo} alt="EligeTuPlan" className="h-9 mb-5" />
            <p className="text-[13.5px] text-white/55 leading-relaxed max-w-[320px] mb-6">
              La única plataforma 100% gratuita para comparar, cotizar y solicitar planes de salud de todas las Isapres de Chile.
            </p>
            <div className="space-y-2">
              <a href={`tel:${D.brand.phoneClean}`} className="flex items-center gap-2.5 text-[13.5px] text-white/75 hover:text-white transition-colors no-underline">
                <svg className="w-4 h-4 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {D.brand.phone}
              </a>
              <a href={`mailto:${D.brand.email}`} className="flex items-center gap-2.5 text-[13.5px] text-white/75 hover:text-white transition-colors no-underline">
                <svg className="w-4 h-4 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>
                {D.brand.email}
              </a>
              <div className="flex items-center gap-2.5 text-[13.5px] text-white/55">
                <svg className="w-4 h-4 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.66 16.66L13.41 20.9a2 2 0 0 1-2.83 0L6.34 16.66A8 8 0 1 1 17.66 16.66z"/><circle cx="12" cy="12" r="3"/></svg>
                Santiago, Chile
              </div>
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.t}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-mint mb-5">{c.t}</h4>
              <ul className="space-y-2.5">
                {c.items.map((it) => (
                  <li key={it.l}>
                    <a
                      href={it.h}
                      target={it.ext ? '_blank' : undefined}
                      rel={it.ext ? 'noopener noreferrer' : undefined}
                      className="text-[13px] text-white/55 hover:text-white transition-colors no-underline"
                    >
                      {it.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-white/45">
          <span>© 2026 EligeTuPlan · Todos los derechos reservados</span>
          <div className="flex items-center gap-5">
            <a href="/privacidad" className="hover:text-white/80 transition-colors no-underline">Política de privacidad</a>
            <a href="/terminos" className="hover:text-white/80 transition-colors no-underline">Términos y condiciones</a>
          </div>
        </div>

        <p className="mt-5 text-[11px] text-white/30 leading-relaxed max-w-[820px]">
          Este sitio es solo para información general y orientación sobre planes de Isapre. Toda la información está destinada a guiar al usuario. Ante cualquier duda, verificar desde el sitio oficial correspondiente. Cumple con la Ley 19.628 sobre Protección de la Vida Privada y la Ley 21.719 sobre Tratamiento de Datos Personales.
        </p>
      </div>
    </footer>
  );
}

// ── WhatsApp FAB (with auto-dim after 5s) ───────────────────────────────
function WhatsAppFAB() {
  const [active, setActive] = useState2(true);
  React.useEffect(() => {
    const t = setTimeout(() => setActive(false), 5500);
    return () => clearTimeout(t);
  }, []);
  return (
    <a
      href="https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-40 group"
    >
      {active && <span className="absolute inset-0 rounded-full bg-[#25D366] animate-[wsp-ping_1.6s_ease-out_infinite]" />}
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_4px_24px_rgba(37,211,102,0.5)] transition-transform hover:scale-110">
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
        </svg>
      </span>
    </a>
  );
}

window.IsapresSection = IsapresSection;
window.TrustBand = TrustBand;
window.FAQSection = FAQSection;
window.FinalCTA = FinalCTA;
window.SiteFooter = SiteFooter;
window.WhatsAppFAB = WhatsAppFAB;
