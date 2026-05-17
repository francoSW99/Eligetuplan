// ============================================================
// MAIN APP — Comparar planes page
// ============================================================

const { useState: aUseState, useMemo: aUseMemo } = React;

function App() {
  const D = window.SITE_DATA;

  // ── Filter state
  const [salaryInput, setSalaryInput]   = aUseState('');
  const [budgetActive, setBudgetActive] = aUseState(false);
  const [priceMin, setPriceMin]         = aUseState(50000);
  const [priceMax, setPriceMax]         = aUseState(500000);
  const [coverageHosp, setCoverageHosp] = aUseState(null);
  const [coverageAmb,  setCoverageAmb]  = aUseState(null);
  const [isapres, setIsapres]           = aUseState([]);  // empty = "all"
  const [modalidad, setModalidad]       = aUseState(null);
  const [clinica, setClinica]           = aUseState('');
  const [searchText, setSearchText]     = aUseState('');
  const [sort, setSort]                 = aUseState('precio_asc');

  // Modals
  const [requestedPlan, setRequestedPlan] = aUseState(null);
  const [pdfPlan, setPdfPlan]             = aUseState(null);

  const budgetCLP = aUseMemo(() => {
    if (!budgetActive || !salaryInput) return null;
    return Math.floor(parseInt(salaryInput, 10) * 0.07);
  }, [budgetActive, salaryInput]);

  // ── Apply filters
  const filtered = aUseMemo(() => {
    return D.plans.filter(p => {
      if (budgetCLP && p.priceCLP > budgetCLP) return false;
      if (p.priceCLP < priceMin || p.priceCLP > priceMax) return false;
      if (coverageHosp !== null && p.hospitalaria.pct < coverageHosp) return false;
      if (coverageAmb !== null && p.ambulatoria.pct < coverageAmb) return false;
      if (isapres.length > 0 && !isapres.includes(p.isapreSlug)) return false;
      if (modalidad && p.modalidad !== modalidad) return false;
      if (clinica) {
        const all = [...p.hospitalaria.clinicas, ...p.ambulatoria.clinicas].map(x => x.toLowerCase());
        if (!all.some(c => c.includes(clinica.toLowerCase()))) return false;
      }
      if (searchText) {
        const q = searchText.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !(p.codigo || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [budgetCLP, priceMin, priceMax, coverageHosp, coverageAmb, isapres, modalidad, clinica, searchText, D.plans]);

  // ── Sort
  const sorted = aUseMemo(() => {
    const copy = [...filtered];
    if (sort === 'precio_asc')  copy.sort((a,b) => a.priceCLP - b.priceCLP);
    if (sort === 'precio_desc') copy.sort((a,b) => b.priceCLP - a.priceCLP);
    if (sort === 'nombre')      copy.sort((a,b) => a.name.localeCompare(b.name));
    if (sort === 'cobertura')   copy.sort((a,b) => (b.hospitalaria.pct + b.ambulatoria.pct) - (a.hospitalaria.pct + a.ambulatoria.pct));
    return copy;
  }, [filtered, sort]);

  // ── Plan counts per Isapre (post-filter)
  const isapreCounts = aUseMemo(() => {
    const counts = {};
    D.isapres.forEach(i => { counts[i.slug] = 0; });
    filtered.forEach(p => { counts[p.isapreSlug] = (counts[p.isapreSlug] || 0) + 1; });
    return counts;
  }, [filtered, D.isapres]);

  // ── Filter chips (active filters)
  const activeChips = aUseMemo(() => {
    const chips = [];
    if (budgetActive) chips.push({ k: 'budget', l: `Mi 7% (≤ ${window.cFormatCLP(budgetCLP)})`, clear: () => setBudgetActive(false) });
    if (priceMin > 50000)  chips.push({ k: 'priceMin', l: `Desde ${window.cFormatCLP(priceMin)}`, clear: () => setPriceMin(50000) });
    if (priceMax < 500000) chips.push({ k: 'priceMax', l: `Hasta ${window.cFormatCLP(priceMax)}`, clear: () => setPriceMax(500000) });
    if (coverageHosp !== null) chips.push({ k: 'covH', l: `Hospitalaria ≥ ${coverageHosp}%`, clear: () => setCoverageHosp(null) });
    if (coverageAmb !== null) chips.push({ k: 'covA', l: `Ambulatoria ≥ ${coverageAmb}%`, clear: () => setCoverageAmb(null) });
    isapres.forEach(slug => {
      const i = D.isapres.find(x => x.slug === slug);
      if (i) chips.push({ k: `isa-${slug}`, l: i.name, clear: () => setIsapres(prev => prev.filter(s => s !== slug)) });
    });
    if (modalidad) chips.push({ k: 'mod', l: `Modalidad: ${modalidad}`, clear: () => setModalidad(null) });
    if (clinica) chips.push({ k: 'clin', l: `Clínica: ${clinica}`, clear: () => setClinica('') });
    if (searchText) chips.push({ k: 'search', l: `"${searchText}"`, clear: () => setSearchText('') });
    return chips;
  }, [budgetActive, budgetCLP, priceMin, priceMax, coverageHosp, coverageAmb, isapres, modalidad, clinica, searchText, D.isapres]);

  function clearAll() {
    setSalaryInput(''); setBudgetActive(false);
    setPriceMin(50000); setPriceMax(500000);
    setCoverageHosp(null); setCoverageAmb(null);
    setIsapres([]); setModalidad(null); setClinica(''); setSearchText('');
  }

  function toggleIsapre(slug) {
    setIsapres(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
  }

  // ── Filter group active counts
  const budgetGroupCount   = (budgetActive ? 1 : 0) + (priceMin > 50000 ? 1 : 0) + (priceMax < 500000 ? 1 : 0);
  const coverageGroupCount = (coverageHosp !== null ? 1 : 0) + (coverageAmb !== null ? 1 : 0) + (clinica ? 1 : 0);
  const prefsGroupCount    = isapres.length + (modalidad ? 1 : 0);

  // ── Sidebar content (used both in desktop and mobile sheet)
  const SidebarContent = () => (
    <>
      <window.FilterGroup
        title="Tu presupuesto"
        kicker={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
        defaultOpen={true}
        activeCount={budgetGroupCount}
      >
        <window.SevenPercentBlock
          salaryInput={salaryInput} setSalaryInput={setSalaryInput}
          applyBudget={() => setBudgetActive(true)}
          clearBudget={() => setBudgetActive(false)}
          active={budgetActive}
          total={filtered.length}
        />
        <div className="pt-3 border-t border-teal/8">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft mb-2.5">O ajusta manualmente</div>
          <window.PriceRange
            min={priceMin} max={priceMax} floor={50000} ceiling={500000}
            setMin={setPriceMin} setMax={setPriceMax}
          />
        </div>
      </window.FilterGroup>

      <window.FilterGroup
        title="Tu cobertura"
        kicker={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>}
        defaultOpen={false}
        activeCount={coverageGroupCount}
      >
        <window.CoverageStepper label="Hospitalaria mínima" value={coverageHosp} onChange={setCoverageHosp} />
        <window.CoverageStepper label="Ambulatoria mínima" value={coverageAmb} onChange={setCoverageAmb} />
        <window.ClinicaSearch value={clinica} onChange={setClinica} />
      </window.FilterGroup>

      <window.FilterGroup
        title="Tus preferencias"
        kicker={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        defaultOpen={false}
        activeCount={prefsGroupCount}
      >
        <window.IsapresFilter selected={isapres} toggle={toggleIsapre} planCounts={isapreCounts} />
        <window.ModalidadFilter value={modalidad} onChange={setModalidad} />
      </window.FilterGroup>
    </>
  );

  // ── Mobile sheet state
  const [mobileFiltersOpen, setMobileFiltersOpen] = aUseState(false);

  return (
    <div className="bg-paper min-h-screen">
      <window.SiteHeaderNew />

      <window.PageHeader
        totalShowing={sorted.length}
        totalFiltered={filtered.length}
        totalGlobal={D.stats.plansTotal}
        lastUpdate={D.stats.lastUpdate}
      />

      <main className="max-w-[1280px] mx-auto px-6 lg:px-10 py-5 md:py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block space-y-3 sticky top-[80px] self-start" style={{ maxHeight: 'calc(100vh - 92px)', overflowY: 'auto' }}>
            <SidebarContent />
            {activeChips.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full px-4 py-2.5 rounded-xl border border-teal/15 text-teal text-[12px] font-bold hover:bg-teal/[0.03] transition-colors"
              >
                Limpiar todos los filtros ({activeChips.length})
              </button>
            )}
          </aside>

          {/* ── Results ── */}
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-teal/10 p-3.5 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                <input
                  type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar por nombre o código de plan..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-mint focus:outline-none focus:ring-4 focus:ring-mint/15 text-[13.5px] text-teal placeholder:text-slate-400 transition-all"
                />
              </div>
              <select
                value={sort} onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-mint focus:outline-none text-[13px] font-semibold text-teal bg-white cursor-pointer"
              >
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="cobertura">Mayor cobertura</option>
                <option value="nombre">Nombre A-Z</option>
              </select>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-[13px] font-bold"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                Filtros
                {activeChips.length > 0 && (
                  <span className="bg-mint text-teal text-[10px] font-extrabold w-5 h-5 rounded-full grid place-items-center">{activeChips.length}</span>
                )}
              </button>
            </div>

            {/* Active filter chips */}
            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Filtros activos:</span>
                {activeChips.map(c => (
                  <button
                    key={c.k}
                    onClick={c.clear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint/12 border border-mint/30 text-[12px] font-semibold text-teal hover:bg-mint/20 transition-colors"
                  >
                    {c.l}
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>
                  </button>
                ))}
                <button onClick={clearAll} className="text-[11.5px] font-bold text-mint-text hover:underline ml-1">
                  Limpiar todo
                </button>
              </div>
            )}

            {/* Result count */}
            <div className="text-[13px] text-ink-soft">
              Mostrando <strong className="text-teal">{sorted.length}</strong> {sorted.length === 1 ? 'plan' : 'planes'}
              {sorted.length !== D.plans.length && (
                <> de <strong className="text-teal">{D.plans.length}</strong> que coinciden con tus filtros</>
              )}
            </div>

            {/* Grid */}
            {sorted.length === 0 ? (
              <window.EmptyState onClearAll={clearAll} activeFiltersCount={activeChips.length} />
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {sorted.map(p => (
                  <window.PlanCard
                    key={p.id}
                    plan={p}
                    onRequestPlan={setRequestedPlan}
                    onViewDetails={setPdfPlan}
                    budgetCLP={budgetCLP}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
          <div className="absolute inset-0 bg-teal-deeper/55 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-[340px] max-w-[90vw] bg-paper shadow-2xl flex flex-col animate-[slide-in-right_0.3s_cubic-bezier(.2,.8,.2,1)]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-teal text-white px-5 py-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold">Filtros</h2>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Cerrar" className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M6 18L18 6"/></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <SidebarContent />
            </div>
            <div className="border-t border-teal/10 p-4 flex gap-2">
              <button onClick={clearAll} className="flex-1 py-3 rounded-xl border border-teal/15 text-teal text-[13px] font-bold">Limpiar</button>
              <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 py-3 rounded-xl bg-gradient-to-br from-mint to-[#0f9d8a] text-teal text-[13px] font-bold">Ver {sorted.length} planes</button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {requestedPlan && <window.LeadModal plan={requestedPlan} onClose={() => setRequestedPlan(null)} />}
      {pdfPlan && <window.PDFModal plan={pdfPlan} onClose={() => setPdfPlan(null)} />}

      {/* WhatsApp FAB (auto-dim) */}
      <WhatsAppFAB />
    </div>
  );
}

function WhatsAppFAB() {
  const [active, setActive] = aUseState(true);
  React.useEffect(() => {
    const t = setTimeout(() => setActive(false), 5500);
    return () => clearTimeout(t);
  }, []);
  return (
    <a
      href="https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud."
      target="_blank" rel="noopener noreferrer"
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

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
