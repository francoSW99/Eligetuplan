// ============================================================
// HEADER & PAGE HEADER for the comparar page
// Reuses the SAME header pattern as the new home, with sticky-on-scroll behavior.
// ============================================================

const { useState: hUseState, useEffect: hUseEffect } = React;

function SiteHeaderNew({ tweaks = {} }) {
  const D = window.SITE_DATA;
  const [scrolled, setScrolled] = hUseState(false);
  const [mobileOpen, setMobileOpen] = hUseState(false);

  hUseEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // On comparar page we always want SOLID header from the start (no hero behind it)
  const bg = 'bg-teal/95 backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(9,46,42,0.4)]';

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all ${bg} border-b border-mint/15`}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex h-[64px] items-center justify-between gap-6">
          <a href="../new-home/Home EligeTuPlan v2.html" className="shrink-0 flex items-center gap-3 group" aria-label="EligeTuPlan inicio">
            <img src={D.brand.logo} alt="EligeTuPlan" className="h-9 w-auto drop-shadow-[0_8px_22px_rgba(20,220,180,0.22)]" />
          </a>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
            {D.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`relative px-4 py-2 text-[14.5px] font-semibold transition-colors group ${item.active ? 'text-white' : 'text-white/70 hover:text-white'}`}
              >
                {item.label}
                <span className={`absolute left-4 right-4 -bottom-0.5 h-[2px] bg-mint transition-transform ${item.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 lg:gap-3">
            <a
              href={`tel:${D.brand.phoneClean}`}
              className="hidden xl:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-white/80 hover:text-white hover:bg-white/8 transition-colors no-underline"
            >
              <svg className="w-4 h-4 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {D.brand.phone}
            </a>

            <a
              href={`${D.brand.whatsappBase}?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud.`}
              target="_blank" rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-colors no-underline"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </a>

            <a
              href="../new-home/Home EligeTuPlan v2.html#calc"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-teal bg-mint hover:bg-mint-bright shadow-mint-glow transition-all hover:-translate-y-0.5 no-underline whitespace-nowrap"
            >
              Calcular mi 7%
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl text-white/85 hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Page header: compact strip — breadcrumb + title + live counter inline
//    Original was ~280px tall, generating empty space before users see plans.
//    Now ~95px tall: everything sits on a single row that still feels designed.
function PageHeader({ totalShowing, totalFiltered, totalGlobal, lastUpdate }) {
  return (
    <section className="relative bg-gradient-to-br from-teal to-teal-deep text-white pt-[80px] pb-5 overflow-hidden">
      {/* Subtle decorative blob — kept small */}
      <div
        className="absolute -top-20 -right-10 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,220,180,.14) 0%, transparent 60%)' }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-mint" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">

          {/* Left: breadcrumb + title inline */}
          <div className="min-w-0">
            <nav className="text-[11px] text-white/55 mb-1.5 flex items-center gap-1.5 font-medium" aria-label="Breadcrumb">
              <a href="../new-home/Home EligeTuPlan v2.html" className="hover:text-mint transition-colors no-underline">Inicio</a>
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M9 6l6 6-6 6"/></svg>
              <span className="text-white/85">Comparar planes</span>
            </nav>
            <h1 className="text-[20px] md:text-[24px] font-extrabold tracking-[-0.02em] leading-[1.15] text-balance">
              Compara los <span className="text-mint serif font-medium italic">{totalGlobal.toLocaleString('es-CL')}</span> planes vigentes del mercado.
            </h1>
          </div>

          {/* Right: live counter pill */}
          <div className="shrink-0 flex items-center gap-3 self-stretch md:self-auto">
            <div className="flex-1 md:flex-none flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/8 backdrop-blur-md border border-mint/20">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[22px] font-extrabold text-white tabular-nums leading-none">{totalShowing}</span>
                  <span className="text-[12px] text-white/45 tabular-nums">/ {totalFiltered.toLocaleString('es-CL')}</span>
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-mint/85 mt-0.5">Planes filtrados</div>
              </div>
              <div className="hidden md:block w-px h-7 bg-white/15" />
              <div className="hidden md:block text-[10px] text-white/55 leading-tight">
                <div className="font-mono text-mint/80 mb-0.5">LIVE</div>
                <div>al {lastUpdate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.SiteHeaderNew = SiteHeaderNew;
window.PageHeader = PageHeader;
