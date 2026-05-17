// ============================================================
// PLAN CARD — redesigned with brand colors (no orange!), better hierarchy
// + Lead modal + PDF modal + Empty state
// ============================================================

const { useState: pcUseState } = React;

function PlanCard({ plan, onRequestPlan, onViewDetails, budgetCLP }) {
  const [expanded, setExpanded] = pcUseState(false);
  const fits = !budgetCLP || plan.priceCLP <= budgetCLP;
  const isapreLogo = window.SITE_DATA.isapres.find(i => i.slug === plan.isapreSlug)?.logo;

  // Flag config
  const flags = {
    'top-value':     { label: '★ Mejor valor',     bg: 'bg-mint text-teal' },
    'best-coverage': { label: '☂ Mejor cobertura', bg: 'bg-teal text-mint' },
    'cheapest':      { label: '💰 Más económico',  bg: 'bg-paper text-teal border border-teal/15' },
  };
  const flag = plan.flag ? flags[plan.flag] : null;

  return (
    <article className={`relative bg-white rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(15,81,75,0.18)] ${
      fits ? 'border-teal/10 hover:border-mint/40' : 'border-slate-200/60 opacity-75'
    }`}>
      {/* Flag */}
      {flag && (
        <div className={`absolute -top-2.5 left-5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-[0.12em] uppercase ${flag.bg} shadow-sm z-10`}>
          {flag.label}
        </div>
      )}
      {!fits && budgetCLP && (
        <div className="absolute -top-2.5 right-5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-[0.12em] uppercase bg-amber-100 text-amber-800 border border-amber-200 shadow-sm z-10">
          Fuera de tu 7%
        </div>
      )}

      <div className="p-5 md:p-6 flex flex-col gap-4 h-full">
        {/* Header: logo + name + price */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-10 w-28 mb-2.5 flex items-center">
              <img src={isapreLogo} alt={plan.isapreName} className="max-h-9 max-w-full object-contain object-left" />
            </div>
            <h3 className="font-bold text-[14px] text-teal uppercase leading-tight mb-1 tracking-tight">{plan.name}</h3>
            <div className="flex items-center gap-2">
              {plan.codigo && (
                <span className="text-[10.5px] text-ink-soft font-mono">{plan.codigo}</span>
              )}
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md bg-mint/12 text-mint-text">
                {plan.modalidad}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-soft mb-0.5">Precio base</div>
            <div className="text-[22px] font-extrabold text-teal leading-none tabular-nums tracking-tight">
              UF {window.cFormatUF(plan.basePlanUF)}
            </div>
            <div className="text-[12px] text-ink-soft mt-1 tabular-nums">
              {window.cFormatCLP(plan.priceCLP)} <span className="text-ink-soft/65">/mes</span>
            </div>
          </div>
        </div>

        {/* Coverage blocks (mint, not orange) */}
        <div className="grid grid-cols-2 gap-2.5">
          <CoverageBlock title="Hospitalaria" data={plan.hospitalaria} expanded={expanded} />
          <CoverageBlock title="Ambulatoria"  data={plan.ambulatoria}  expanded={expanded} />
        </div>

        {/* Show/hide clinics toggle */}
        {(plan.hospitalaria.clinicas.length > 2 || plan.ambulatoria.clinicas.length > 2) && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="self-start inline-flex items-center gap-1 text-[12px] font-semibold text-mint-text hover:underline"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6"/></svg>
            {expanded ? 'Ocultar clínicas' : 'Ver todas las clínicas'}
          </button>
        )}

        {/* CTAs */}
        <div className="mt-auto pt-4 border-t border-teal/8 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onRequestPlan(plan)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-mint to-[#0f9d8a] text-teal font-bold text-[12.5px] shadow-[0_8px_18px_rgba(20,220,180,0.3)] hover:-translate-y-0.5 transition-all uppercase tracking-[0.08em]"
          >
            Solicitar plan
          </button>
          <button
            type="button"
            onClick={() => onViewDetails(plan)}
            className="px-4 py-2.5 rounded-xl border border-teal/15 text-teal font-bold text-[12.5px] hover:bg-teal/[0.03] hover:border-teal/30 transition-all uppercase tracking-[0.08em] flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Ver PDF
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Coverage block (mint barras + semaforo when very low) ──────────────
function CoverageBlock({ title, data, expanded }) {
  // Color semaphore: red <60, amber 60-79, mint >=80
  const color = data.pct < 60 ? '#c8401a' : data.pct < 80 ? '#d97706' : '#14dcb4';
  const bgColor = data.pct < 60 ? 'rgba(200,64,26,0.10)' : data.pct < 80 ? 'rgba(217,119,6,0.10)' : 'rgba(20,220,180,0.10)';
  const showClinics = expanded ? data.clinicas : data.clinicas.slice(0, 2);
  return (
    <div className="rounded-xl border border-teal/8 bg-paper/60 p-3.5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft">{title}</span>
        <span className="text-[15px] font-extrabold tabular-nums" style={{ color }}>{data.pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: bgColor }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${data.pct}%`, background: color }} />
      </div>
      <div className="flex flex-wrap gap-1">
        {showClinics.map(c => (
          <span key={c} className="inline-block text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-teal/8 text-ink-soft font-medium">{c}</span>
        ))}
        {!expanded && data.clinicas.length > 2 && (
          <span className="inline-block text-[10.5px] px-2 py-0.5 rounded-md text-mint-text font-bold">
            +{data.clinicas.length - 2}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Empty state with escape hatches ─────────────────────────────────────
function EmptyState({ onClearAll, activeFiltersCount }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-teal/15 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-mint/12 text-mint-text flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </div>
      <h3 className="text-[22px] md:text-[26px] font-extrabold text-teal tracking-tight mb-3">
        No encontramos planes con esos filtros.
      </h3>
      <p className="text-[15px] text-ink-soft leading-relaxed mb-7 max-w-md mx-auto">
        Tienes <strong className="text-teal">{activeFiltersCount} filtros activos</strong>. Prueba relajando alguno o pídele a un asesor que te encuentre alternativas similares.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button" onClick={onClearAll}
          className="px-6 py-3 rounded-xl bg-gradient-to-br from-mint to-[#0f9d8a] text-teal font-bold text-[14px] shadow-[0_8px_20px_rgba(20,220,180,0.3)] hover:-translate-y-0.5 transition-all"
        >
          Limpiar todos los filtros
        </button>
        <a
          href={`${window.SITE_DATA.brand.whatsappBase}?text=Hola%2C%20busco%20alternativas%20de%20planes%20de%20salud`}
          target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-[14px] hover:-translate-y-0.5 transition-all no-underline inline-flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
          </svg>
          Pedir alternativas por WhatsApp
        </a>
      </div>
    </div>
  );
}

// ── Lead modal (PROPER validation — fixes audit findings) ─────────────
function LeadModal({ plan, onClose }) {
  const [form, setForm] = pcUseState({ nombre: '', rut: '', correo: '', telefono: '' });
  const [errors, setErrors] = pcUseState({});
  const [submitting, setSubmitting] = pcUseState(false);
  const [sent, setSent] = pcUseState(false);

  // RUT validation (módulo 11)
  function validateRut(rut) {
    const clean = rut.replace(/[.\-]/g, '').toUpperCase();
    if (clean.length < 8) return false;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    if (!/^\d+$/.test(body)) return false;
    let sum = 0, mul = 2;
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * mul;
      mul = mul === 7 ? 2 : mul + 1;
    }
    const calc = 11 - (sum % 11);
    const expected = calc === 11 ? '0' : calc === 10 ? 'K' : String(calc);
    return dv === expected;
  }

  function validatePhone(phone) {
    const clean = phone.replace(/\s/g, '');
    return /^(\+?56)?9\d{8}$/.test(clean);
  }

  function validate() {
    const e = {};
    if (form.nombre.trim().length < 3)  e.nombre = 'Ingresa tu nombre completo.';
    if (!validateRut(form.rut))          e.rut = 'RUT inválido. Ej: 12.345.678-9';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = 'Correo inválido.';
    if (!validatePhone(form.telefono))   e.telefono = 'Teléfono inválido. Debe ser +56 9 XXXX XXXX';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSent(true); }, 800);
  }

  return (
    <div className="fixed inset-0 z-[80] bg-teal-deeper/55 backdrop-blur-sm flex items-center justify-center px-4 py-8" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_40px_80px_-20px_rgba(9,46,42,0.5)] overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-teal to-teal-deep px-6 py-4 flex items-center justify-between gap-3 text-white">
          <div className="min-w-0">
            <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-mint mb-0.5">Solicitar plan</div>
            <h3 className="text-[15px] font-bold truncate">{plan.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        </div>

        {sent ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-mint/15 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-mint-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 className="text-[20px] font-extrabold text-teal mb-2">¡Datos recibidos!</h3>
            <p className="text-[14px] text-ink-soft leading-relaxed mb-6">Un asesor certificado te contactará en menos de 24 horas con la cotización detallada.</p>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-teal text-white font-bold text-[13px] hover:-translate-y-0.5 transition-all">Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-3 overflow-y-auto">
            <Field label="Nombre completo" error={errors.nombre}>
              <input type="text" value={form.nombre} onChange={(e) => setForm({...form, nombre: e.target.value})} placeholder="Juan Pérez González" />
            </Field>
            <Field label="RUT" error={errors.rut} hint="Validación módulo 11 oficial">
              <input type="text" value={form.rut} onChange={(e) => setForm({...form, rut: e.target.value})} placeholder="12.345.678-9" />
            </Field>
            <Field label="Correo electrónico" error={errors.correo}>
              <input type="email" value={form.correo} onChange={(e) => setForm({...form, correo: e.target.value})} placeholder="tu@email.cl" />
            </Field>
            <Field label="Teléfono" error={errors.telefono} hint="Formato chileno: +56 9 XXXX XXXX">
              <input type="tel" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} placeholder="+56 9 8765 4321" />
            </Field>

            {/* Legal consent — fixes audit finding */}
            <label className="flex items-start gap-2.5 mt-2 p-3 rounded-xl bg-mint/[0.05] border border-mint/20 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 accent-mint" />
              <span className="text-[11.5px] text-ink-soft leading-relaxed">
                Autorizo el tratamiento de mis datos personales para cotización y contacto, según la{' '}
                <a href="#" className="text-mint-text font-bold underline-offset-2 hover:underline">Política de Privacidad</a> (Ley 21.719).
              </span>
            </label>

            <button
              type="submit" disabled={submitting}
              className="w-full mt-3 px-5 py-3 rounded-xl bg-gradient-to-br from-mint to-[#0f9d8a] text-teal font-bold text-[14px] shadow-[0_10px_22px_rgba(20,220,180,0.36)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {submitting ? 'Enviando…' : 'Enviar y recibir cotización'}
            </button>
            <p className="text-[10.5px] text-center text-ink-soft pt-1">
              ✓ 100% gratis · ✓ Sin compromiso · ✓ Respuesta en 24h
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-soft mb-1.5 block">{label}</label>
      {React.cloneElement(children, {
        className: `w-full px-3.5 py-2.5 rounded-xl border-2 focus:outline-none focus:ring-4 text-[14px] transition-all ${
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-mint focus:ring-mint/15'
        }`,
      })}
      {error ? (
        <p className="text-[11px] text-red-600 mt-1 font-semibold">{error}</p>
      ) : hint ? (
        <p className="text-[10.5px] text-ink-soft mt-1">{hint}</p>
      ) : null}
    </div>
  );
}

// ── PDF modal ──────────────────────────────────────────────────────────
function PDFModal({ plan, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] bg-teal-deeper/60 backdrop-blur-sm flex items-center justify-center px-4 py-4" onClick={onClose}>
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-br from-teal to-teal-deep px-5 py-3 flex items-center justify-between gap-3 text-white">
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-mint">PDF</span>
            <span className="text-white/30">|</span>
            <h3 className="text-[14px] font-bold truncate">{plan.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        </div>
        <div className="flex-1 bg-slate-100 grid place-items-center p-6">
          <div className="bg-white rounded-2xl p-10 max-w-md text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-mint/12 text-mint-text grid place-items-center mx-auto mb-4">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3 className="text-[18px] font-bold text-teal mb-2">Vista previa del plan</h3>
            <p className="text-[13px] text-ink-soft mb-1">Aquí se cargaría el PDF oficial del plan.</p>
            <p className="text-[12px] text-ink-soft/70 mb-5"><strong className="text-teal">{plan.codigo}</strong> · {plan.isapreName}</p>
            <a href="#" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white font-bold text-[13px] hover:-translate-y-0.5 transition-all no-underline">
              Abrir PDF en pestaña aparte
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

window.PlanCard = PlanCard;
window.EmptyState = EmptyState;
window.LeadModal = LeadModal;
window.PDFModal = PDFModal;
