// ============================================================
// SIDEBAR with 3 collapsible filter groups + Mobile filter sheet
// Solves audit findings:
//   · 8 vertical sections → 3 collapsible groups
//   · checkbox semantics (0 selected = none checked, not all)
//   · 7% calculator promoted to top group
// ============================================================

const { useState: sUseState, useEffect: sUseEffect } = React;

function formatCLP(n) {
  return '$' + Math.round(n).toLocaleString('es-CL');
}
function formatUF(n) {
  return n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Collapsible group ───────────────────────────────────────────────────
function FilterGroup({ title, kicker, defaultOpen = true, activeCount = 0, children }) {
  const [open, setOpen] = sUseState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-teal/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 group hover:bg-mint/[0.03] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            activeCount > 0 ? 'bg-mint text-teal' : 'bg-teal/5 text-teal'
          }`}>
            {kicker}
          </div>
          <div>
            <div className="text-[14px] font-bold text-teal leading-tight">{title}</div>
            {activeCount > 0 && (
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-mint-text mt-0.5">
                {activeCount} {activeCount === 1 ? 'filtro activo' : 'filtros activos'}
              </div>
            )}
          </div>
        </div>
        <svg className={`w-4 h-4 text-ink-soft transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-teal/8">
          <div className="space-y-4">{children}</div>
        </div>
      )}
    </div>
  );
}

// ── 7% legal calculator inside sidebar (compact) ────────────────────────
function SevenPercentBlock({ salaryInput, setSalaryInput, applyBudget, clearBudget, active, total }) {
  const D = window.SITE_DATA;
  const salary = salaryInput ? parseInt(salaryInput, 10) : 0;
  const sevenPct = salary > 0 ? Math.floor(salary * 0.07) : 0;
  const uf = sevenPct / D.stats.ufValueCLP;

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-ink-soft leading-relaxed">
        Ingresa tu sueldo bruto y filtramos solo los planes que tu <strong className="text-teal font-bold">7% legal</strong> puede pagar.
      </p>

      <div>
        <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-soft mb-1.5 block">
          Sueldo bruto imponible
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-bold text-teal/55 pointer-events-none">$</span>
          <input
            type="text" inputMode="numeric"
            value={salaryInput ? parseInt(salaryInput, 10).toLocaleString('es-CL') : ''}
            onChange={(e) => setSalaryInput(e.target.value.replace(/\D/g, ''))}
            placeholder="950.000"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-mint focus:outline-none focus:ring-4 focus:ring-mint/15 text-[15px] font-bold text-teal placeholder:text-slate-300 transition-all"
          />
        </div>
      </div>

      {sevenPct > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-teal to-teal-deep p-3.5 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-mint/15 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-mint/85 mb-1">
              Tu 7% disponible
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-extrabold tabular-nums leading-none">{formatCLP(sevenPct)}</span>
              <span className="text-[11px] text-white/55">/mes</span>
            </div>
            <div className="text-[11px] text-white/65 mt-0.5 tabular-nums">
              ≈ <strong className="text-mint">UF {formatUF(uf)}</strong>
            </div>
          </div>
        </div>
      )}

      <button
        type="button" disabled={!sevenPct}
        onClick={applyBudget}
        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-br from-mint to-[#0f9d8a] text-teal font-bold text-[13px] shadow-[0_8px_20px_rgba(20,220,180,0.3)] disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all"
      >
        {active ? 'Actualizar filtro 7%' : 'Filtrar por mi 7%'}
      </button>

      {active && (
        <div className="rounded-xl border border-mint/30 bg-mint/8 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal/70 mb-0.5">Con tu 7% puedes optar a</div>
          <div className="text-[22px] font-extrabold text-teal tabular-nums leading-none">{total.toLocaleString('es-CL')}</div>
          <div className="text-[10.5px] text-ink-soft mt-1">planes vigentes</div>
          <button
            type="button"
            onClick={clearBudget}
            className="mt-2 text-[11px] font-semibold text-mint-text hover:underline"
          >
            Quitar filtro
          </button>
        </div>
      )}
    </div>
  );
}

// ── Price range (dual handle, mint-colored) ────────────────────────────
function PriceRange({ min, max, floor, ceiling, setMin, setMax }) {
  const minPct = ((min - floor) / Math.max(ceiling - floor, 1)) * 100;
  const maxPct = ((max - floor) / Math.max(ceiling - floor, 1)) * 100;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-teal/10 bg-paper px-3 py-2 text-center">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-soft mb-0.5">Desde</div>
          <div className="text-[14px] font-extrabold text-teal tabular-nums leading-none">{formatCLP(min)}</div>
        </div>
        <div className="rounded-xl border border-teal/10 bg-paper px-3 py-2 text-center">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-soft mb-0.5">Hasta</div>
          <div className="text-[14px] font-extrabold text-teal tabular-nums leading-none">{formatCLP(max)}</div>
        </div>
      </div>

      <div className="relative py-3 px-1">
        <div className="absolute left-1 right-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-mint/15" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-mint to-mint-text"
          style={{ left: `calc(${minPct}% + 4px)`, right: `calc(${100 - maxPct}% + 4px)` }}
        />
        <input
          type="range" min={floor} max={ceiling} step={1000}
          value={min} onChange={(e) => setMin(Math.min(+e.target.value, max - 1000))}
          className="price-range-input" aria-label="Precio mínimo"
        />
        <input
          type="range" min={floor} max={ceiling} step={1000}
          value={max} onChange={(e) => setMax(Math.max(+e.target.value, min + 1000))}
          className="price-range-input" aria-label="Precio máximo"
        />
      </div>
      <div className="flex justify-between text-[10.5px] font-semibold text-ink-soft tabular-nums">
        <span>Min: {formatCLP(floor)}</span>
        <span>Max: {formatCLP(ceiling)}</span>
      </div>
    </div>
  );
}

// ── Coverage stepper (1 slider with marks, friendlier than 13 buttons) ──
function CoverageStepper({ label, value, onChange }) {
  const marks = [50, 60, 70, 80, 90, 100];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] font-bold text-teal">{label}</span>
        <span className="text-[14px] font-extrabold text-teal tabular-nums">{value ? `≥ ${value}%` : 'Cualquiera'}</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`text-[11px] font-bold py-1.5 px-2.5 rounded-md border transition-all ${
            value === null
              ? 'bg-teal text-white border-teal'
              : 'border-slate-200 text-ink-soft hover:border-mint hover:text-teal'
          }`}
        >
          Todos
        </button>
        {marks.map(pct => (
          <button
            key={pct}
            type="button"
            onClick={() => onChange(pct)}
            className={`text-[11px] font-bold py-1.5 flex-1 min-w-[44px] rounded-md border transition-all ${
              value === pct
                ? 'bg-teal text-white border-teal'
                : 'border-slate-200 text-ink-soft hover:border-mint hover:text-teal'
            }`}
          >
            {pct}%
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Isapres checkboxes (NEW SEMANTICS: 0 selected = none checked) ───────
function IsapresFilter({ selected, toggle, planCounts }) {
  const D = window.SITE_DATA;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] font-bold text-teal">Isapres</span>
        {selected.length === 0 ? (
          <span className="text-[10.5px] text-ink-soft italic">Todas mostradas</span>
        ) : (
          <span className="text-[11px] font-bold text-mint-text">{selected.length} {selected.length === 1 ? 'sel.' : 'sels.'}</span>
        )}
      </div>
      <ul className="space-y-1.5">
        {D.isapres.map(i => {
          const checked = selected.includes(i.slug);
          const count = planCounts[i.slug] ?? i.planCount;
          return (
            <li key={i.slug}>
              <label className="flex items-center justify-between gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-mint/[0.05] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    checked ? 'bg-mint border-mint' : 'border-slate-300 bg-white'
                  }`}>
                    {checked && (
                      <svg className="w-3 h-3 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                    )}
                  </span>
                  <input
                    type="checkbox" checked={checked} onChange={() => toggle(i.slug)}
                    className="sr-only"
                  />
                  <span className={`text-[13px] truncate transition-colors ${checked ? 'text-teal font-semibold' : 'text-ink'}`}>
                    {i.name}
                  </span>
                </div>
                <span className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                  checked ? 'bg-mint/15 text-mint-text' : 'bg-teal/5 text-ink-soft'
                }`}>
                  {count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Modalidad radios ────────────────────────────────────────────────────
function ModalidadFilter({ value, onChange }) {
  const D = window.SITE_DATA;
  return (
    <div>
      <div className="text-[12px] font-bold text-teal mb-2">Modalidad</div>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button" onClick={() => onChange(null)}
          className={`text-[11.5px] font-semibold py-2 rounded-lg border transition-all ${
            !value ? 'bg-teal text-white border-teal' : 'border-slate-200 text-ink-soft hover:border-mint hover:text-teal'
          }`}
        >Todas</button>
        {D.modalidades.map(m => (
          <button
            key={m} type="button" onClick={() => onChange(m)}
            className={`text-[11.5px] font-semibold py-2 rounded-lg border transition-all ${
              value === m ? 'bg-teal text-white border-teal' : 'border-slate-200 text-ink-soft hover:border-mint hover:text-teal'
            }`}
          >{m}</button>
        ))}
      </div>
    </div>
  );
}

// ── Clínica search ──────────────────────────────────────────────────────
function ClinicaSearch({ value, onChange }) {
  const D = window.SITE_DATA;
  return (
    <div>
      <div className="text-[12px] font-bold text-teal mb-2">Clínica preferida</div>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <input
          type="text" list="clinicas-list" value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar clínica..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-mint focus:outline-none focus:ring-4 focus:ring-mint/15 text-[13px] text-teal placeholder:text-slate-400 transition-all"
        />
        {value && (
          <button
            type="button" onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-ink-soft transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M6 18L18 6"/></svg>
          </button>
        )}
        <datalist id="clinicas-list">
          {D.prestadores.map(p => <option key={p} value={p} />)}
        </datalist>
      </div>
    </div>
  );
}

window.FilterGroup = FilterGroup;
window.SevenPercentBlock = SevenPercentBlock;
window.PriceRange = PriceRange;
window.CoverageStepper = CoverageStepper;
window.IsapresFilter = IsapresFilter;
window.ModalidadFilter = ModalidadFilter;
window.ClinicaSearch = ClinicaSearch;
window.cFormatCLP = formatCLP;
window.cFormatUF = formatUF;
