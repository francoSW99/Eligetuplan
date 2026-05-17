// ============================================================
// HERO — La calculadora del 7% es el corazón.
// 3 variantes: split (default) / centered / editorial
// ============================================================

const { useState, useMemo, useEffect, useRef } = React;

// ── Calculadora 7% — componente compartido por las 3 variantes ──────────
function SevenPercentCalculator({ variant = 'card', onSubmit }) {
  const D = window.SITE_DATA;
  const [salary, setSalary] = useState(1200000); // default $1.200.000
  const [focused, setFocused] = useState(false);

  const sevenPct = Math.floor(salary * 0.07);
  const inUF = sevenPct / D.stats.ufValueCLP;

  // Mapping plausible: total = 1854. La cantidad de planes asequibles crece con presupuesto.
  // Simulación basada en el rango real (planes desde UF ~0.7 hasta UF ~30)
  const plansAvailable = useMemo(() => {
    if (sevenPct < 25000) return 14;
    if (sevenPct < 45000) return 87;
    if (sevenPct < 70000) return 264;
    if (sevenPct < 95000) return 521;
    if (sevenPct < 130000) return 842;
    if (sevenPct < 170000) return 1147;
    if (sevenPct < 220000) return 1452;
    if (sevenPct < 300000) return 1689;
    return 1854;
  }, [sevenPct]);

  const presets = [
    { label: '$700K', value: 700000 },
    { label: '$1M',   value: 1000000 },
    { label: '$1,5M', value: 1500000 },
    { label: '$2M',   value: 2000000 },
    { label: '$3M+',  value: 3000000 },
  ];

  const isCard = variant === 'card';

  return (
    <div
      className={
        isCard
          ? 'relative rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(9,46,42,0.55)] border border-white/40 overflow-hidden'
          : 'relative rounded-3xl bg-white/96 backdrop-blur-xl border border-white/40 shadow-[0_30px_80px_-20px_rgba(9,46,42,0.55)]'
      }
    >
      {/* Floating ribbon */}
      <div className="absolute top-5 right-5 z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint/10 border border-mint/30 text-[10px] font-bold tracking-[0.14em] uppercase text-teal">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          En vivo
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-teal/55 mb-1.5">
          · Calculadora del 7% legal ·
        </div>
        <h3 className="text-[22px] sm:text-[24px] font-bold text-teal leading-[1.1] tracking-tight">
          ¿Cuánto puedes destinar a tu plan?
        </h3>
        <p className="text-[13px] text-ink-soft mt-1.5 leading-relaxed">
          La ley reserva el 7% de tu sueldo bruto para salud. Ingrésalo y vemos cuántos planes te calzan.
        </p>

        {/* Input */}
        <label className="block mt-5">
          <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-ink-soft mb-2 block">
            Tu sueldo bruto imponible
          </span>
          <div className={`relative flex items-center rounded-2xl border-2 transition-all ${focused ? 'border-mint shadow-[0_0_0_4px_rgba(20,220,180,0.12)]' : 'border-slate-200'}`}>
            <span className="absolute left-4 text-[18px] font-bold text-teal/55 pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={salary ? salary.toLocaleString('es-CL') : ''}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setSalary(raw ? Math.min(parseInt(raw, 10), 99999999) : 0);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="950.000"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-[20px] font-bold text-teal bg-transparent focus:outline-none placeholder:text-slate-300"
              aria-label="Sueldo bruto imponible"
            />
          </div>
        </label>

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {presets.map((p) => {
            const active = salary === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setSalary(p.value)}
                className={`text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-all border ${
                  active
                    ? 'bg-teal text-white border-teal'
                    : 'bg-white text-ink-soft border-slate-200 hover:border-mint hover:text-teal'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Result */}
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-teal to-teal-deep text-white p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-mint/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-mint/85 mb-1.5">
              · Tu 7% disponible ·
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] sm:text-[42px] font-extrabold tracking-tight tabular-nums leading-none">
                ${sevenPct.toLocaleString('es-CL')}
              </span>
              <span className="text-[13px] font-medium text-white/55">/mes</span>
            </div>
            <div className="mt-1 text-[12.5px] text-white/65 tabular-nums">
              ≈ <strong className="text-mint font-semibold">UF {inUF.toFixed(2)}</strong> al mes · UF $39.987
            </div>

            <div className="mt-4 pt-4 border-t border-white/12 flex items-baseline justify-between">
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-white/55">
                  Planes a tu alcance
                </div>
                <div className="text-[26px] font-extrabold text-mint tabular-nums leading-tight">
                  {plansAvailable.toLocaleString('es-CL')}{' '}
                  <span className="text-[13px] font-medium text-white/45">de 1.854</span>
                </div>
              </div>
              <div className="hidden sm:block w-[80px]">
                <div className="text-right text-[11px] font-semibold text-white/55 mb-1.5">
                  {Math.round((plansAvailable / 1854) * 100)}%
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mint to-mint-bright rounded-full transition-all duration-500"
                    style={{ width: `${(plansAvailable / 1854) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={() => onSubmit?.({ salary, sevenPct })}
          className="mt-4 w-full px-5 py-4 rounded-2xl bg-gradient-to-br from-mint to-[#0f9d8a] text-[#0f2826] font-bold text-[15px] shadow-[0_14px_30px_rgba(20,220,180,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
        >
          Ver mis {plansAvailable.toLocaleString('es-CL')} planes disponibles
          <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6"/>
          </svg>
        </button>

        {/* Secondary link */}
        <a
          href="/comparar/isapres"
          className="block text-center mt-3 text-[12.5px] font-semibold text-ink-soft hover:text-teal transition-colors no-underline"
        >
          Prefiero ver el catálogo completo →
        </a>
      </div>
    </div>
  );
}

// ── Background decorativo del hero ──────────────────────────────────────
// Rotating slideshow with strong teal overlay so left-side white text + calculator
// card both stay highly legible. Grid pattern kept *very* subtle on top for texture.
const HERO_SLIDES = [
  'images/familia.jpeg',
  'images/kine.jpeg',
  'images/cirugia.jpg',
];
const SLIDE_DURATION_MS = 4200;

function HeroBackground({ tone = 'split' }) {
  // tone:
  //   'split'     → left-heavy gradient (image visible on right where calculator sits — but calculator is white card so it sits ON TOP of overlay anyway)
  //   'centered'  → vignette-style, image visible at edges
  //   'editorial' → already has its own image treatment, this only adds the dark teal base

  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setActive((v) => (v + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(id);
  }, []);

  const overlay =
    tone === 'centered'
      ? 'radial-gradient(ellipse at center, rgba(15,81,75,.55) 0%, rgba(15,81,75,.85) 60%, rgba(6,32,29,.95) 100%)'
      : tone === 'editorial'
      ? 'linear-gradient(110deg, rgba(15,81,75,.92) 0%, rgba(15,81,75,.72) 50%, rgba(9,46,42,.55) 100%)'
      // split: a bit lighter on the right so the image breathes behind the calculator card edges
      : 'linear-gradient(105deg, rgba(15,81,75,.94) 0%, rgba(15,81,75,.80) 45%, rgba(15,81,75,.55) 75%, rgba(9,46,42,.65) 100%)';

  return (
    <>
      {/* Slideshow — rotating photographic backgrounds */}
      <div className="absolute inset-0 overflow-hidden">
        {HERO_SLIDES.map((img, i) => (
          <div
            key={img}
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: '50% 35%',  // bias toward upper-middle so faces/subjects stay visible
              opacity: i === active ? 1 : 0,
              transform: i === active ? 'scale(1.08)' : 'scale(1.02)',
              transition: 'opacity 0.9s ease-in-out, transform 5s linear',
              willChange: 'opacity, transform',
            }}
          />
        ))}
      </div>

      {/* Teal brand overlay — directional so the photo breathes on one side */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: overlay }} />

      {/* Bottom fade into next section */}
      <div
        className="absolute inset-x-0 bottom-0 h-[180px] pointer-events-none"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(9,46,42,.95) 100%)' }}
      />

      {/* Subtle grain texture (instead of grid) for premium feel */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(20,220,180,.4) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(20,220,180,.3) 0%, transparent 45%)',
        }}
      />

      {/* Top scrim under transparent header — keeps header chrome readable */}
      <div className="absolute inset-x-0 top-0 h-[140px] bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

      {/* Slide indicators (bottom-left, away from calculator) */}
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
                background: i === active ? 'rgba(20,220,180,1)' : 'rgba(255,255,255,0.25)',
              }}
            />
            {/* Progress fill when active */}
            {i === active && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
                style={{
                  height: 2,
                  width: 0,
                  background: 'rgba(255,255,255,0.95)',
                  animation: `heroProg ${SLIDE_DURATION_MS}ms linear forwards`,
                }}
              />
            )}
          </button>
        ))}
        <style>{`@keyframes heroProg { from { width: 0 } to { width: 44px } }`}</style>
      </div>
    </>
  );
}

// ── VARIANT A — Split: text left, calculator right ──────────────────────
function HeroVariantSplit({ tweaks }) {
  const D = window.SITE_DATA;
  return (
    <section id="top" className="relative overflow-hidden text-white pt-[120px] pb-20 lg:pt-[160px] lg:pb-28">
      <HeroBackground tone="split" />
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-16 items-center">

          {/* LEFT — copy */}
          <div className="max-w-[620px]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/12 border border-mint/30 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-mint">
                Comparador 100% gratuito · 1.854 planes
              </span>
            </div>

            <h1 className="font-extrabold tracking-[-0.025em] leading-[0.98] text-[clamp(40px,5.8vw,72px)] mb-6">
              ¿Cuánto <span className="text-mint serif font-medium italic">deberías</span> pagar por tu plan de salud?
            </h1>

            <p className="text-[17px] lg:text-[18px] text-white/72 leading-relaxed max-w-[540px] mb-8">
              La ley te reserva el <strong className="text-white font-semibold">7% de tu sueldo bruto</strong> para salud. Ingrésalo aquí y te mostramos cuántos planes vigentes están realmente a tu alcance — sin formularios, sin cuentas, sin promesas raras.
            </p>

            {/* Trust signals */}
            <div className="space-y-2.5">
              {[
                { icon: 'shield', t: 'Datos oficiales de la Superintendencia de Salud', s: `actualizado al ${D.stats.lastUpdate}` },
                { icon: 'eye',    t: 'Sin pedir email para ver tus resultados', s: 'preview transparente antes de cualquier formulario' },
                { icon: 'no',     t: 'Sin costo y sin spam', s: 'cobramos comisión legal directo de las Isapres' },
              ].map((row) => (
                <div key={row.t} className="flex items-start gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-mint/12 border border-mint/25 flex items-center justify-center mt-0.5">
                    <svg className="w-3.5 h-3.5 text-mint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      {row.icon === 'shield' && <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/>}
                      {row.icon === 'eye'    && <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                      {row.icon === 'no'     && <><circle cx="12" cy="12" r="9"/><path d="M5 5l14 14"/></>}
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

          {/* RIGHT — calculator */}
          <div id="calc" className="lg:max-w-[460px] lg:ml-auto w-full">
            <SevenPercentCalculator variant="card" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── VARIANT B — Centered editorial ──────────────────────────────────────
function HeroVariantCentered({ tweaks }) {
  const D = window.SITE_DATA;
  return (
    <section id="top" className="relative overflow-hidden text-white pt-[140px] pb-24 lg:pt-[180px]">
      <HeroBackground tone="centered" />
      <div className="relative mx-auto max-w-[920px] px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/12 border border-mint/30 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-mint">
            Comparador 100% gratuito · 1.854 planes
          </span>
        </div>

        <h1 className="font-extrabold tracking-[-0.028em] leading-[0.95] text-[clamp(44px,7.2vw,92px)] mb-7 text-balance">
          Encuentra el plan que <span className="text-mint serif font-medium italic">realmente</span><br className="hidden sm:inline"/> te conviene.
        </h1>

        <p className="text-[18px] lg:text-[20px] text-white/72 leading-[1.5] max-w-[640px] mx-auto mb-10">
          Ingresa tu sueldo bruto. Te decimos exactamente cuántos planes están a tu alcance, según el 7% legal y los datos de la Superintendencia.
        </p>

        <div id="calc" className="max-w-[540px] mx-auto text-left">
          <SevenPercentCalculator variant="card" />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[12.5px] text-white/55 font-medium">
          <span>✓ 100% gratuito</span>
          <span className="text-white/15">·</span>
          <span>✓ Sin pedir tu email para ver resultados</span>
          <span className="text-white/15">·</span>
          <span>✓ Datos oficiales SuperSalud</span>
        </div>
      </div>
    </section>
  );
}

// ── VARIANT C — Editorial with image ────────────────────────────────────
function HeroVariantEditorial({ tweaks }) {
  return (
    <section id="top" className="relative overflow-hidden text-white pt-[120px] pb-20 lg:pt-[140px] lg:pb-24">
      <HeroBackground tone="editorial" />

      {/* Right-side image with mask */}
      <div className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:block pointer-events-none">
        <img
          src="images/familia.jpeg"
          alt=""
          className="w-full h-full object-cover"
          style={{
            maskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,.65) 30%, rgba(0,0,0,.85) 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,.65) 30%, rgba(0,0,0,.85) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, rgba(15,81,75,.85) 0%, rgba(15,81,75,.55) 35%, rgba(9,46,42,.7) 100%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10 grid lg:grid-cols-[1.05fr_1fr] gap-12 items-center">
        <div className="max-w-[600px]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/12 border border-mint/30 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-mint">
              Compara con tu 7% legal
            </span>
          </div>

          <h1 className="font-extrabold tracking-[-0.025em] leading-[1.0] text-[clamp(40px,5.5vw,68px)] mb-6">
            Tu familia merece el plan que <span className="text-mint serif font-medium italic">sí</span> puedes pagar.
          </h1>

          <p className="text-[17px] text-white/72 leading-relaxed mb-7">
            Comparamos los 1.854 planes vigentes contra tu 7% legal. Sin email previo, sin formularios eternos — solo el dato que necesitas para decidir.
          </p>

          <div id="calc">
            <SevenPercentCalculator variant="card" />
          </div>
        </div>

        <div /> {/* Empty for grid balance — image is absolute */}
      </div>
    </section>
  );
}

// ── Exported wrapper ────────────────────────────────────────────────────
function Hero({ tweaks }) {
  const v = tweaks.heroVariant || 'split';
  if (v === 'centered')   return <HeroVariantCentered tweaks={tweaks} />;
  if (v === 'editorial')  return <HeroVariantEditorial tweaks={tweaks} />;
  return <HeroVariantSplit tweaks={tweaks} />;
}

window.Hero = Hero;
window.SevenPercentCalculator = SevenPercentCalculator;
