'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Isapre, Zona, PrestadorItem, PlansResponse, Plan } from '@/lib/api';
import { formatCLP } from '@/lib/api';
import {
  type Beneficiario,
  getTotalFactor,
  parseBeneficiarios,
  serializeBeneficiarios,
} from '@/lib/factores';
import PlanCard from './plan-card';
import LeadCaptureForm from '@/components/ui/lead-capture-form';
import ContactOptions from '@/components/ui/contact-options';
import {
  FilterGroup,
  SevenPercentBlock,
  PriceRange,
  CoverageStepper,
  IsapresFilter,
  ZonasFilter,
  ModalidadFilter,
  ClinicasFilter,
} from '@/components/comparar/sidebar-filters';
import BeneficiariosBlock from '@/components/comparar/beneficiarios-block';
import FilterChips, { type Chip } from '@/components/comparar/filter-chips';
import EmptyState from '@/components/comparar/empty-state';

const MODALIDADES = ['Preferente', 'Libre Elección', 'Cerrado'] as const;

function normalizeText(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function IsapresClient({
  initialIsapres,
  initialZonas,
  initialPrestadores,
  initialData,
}: {
  initialIsapres: Isapre[];
  initialZonas: Zona[];
  initialPrestadores: PrestadorItem[];
  initialData: PlansResponse;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [, startTransition] = useTransition();

  const activeIsapres = useMemo(
    () => initialIsapres.filter((i) => i.plan_count > 0),
    [initialIsapres]
  );

  const baseFloor = initialData.price_min_clp ?? 50_000;
  const baseCeiling = initialData.price_max_clp ?? 500_000;

  const beneficiarios = useMemo(
    () => parseBeneficiarios(search.get('ben')),
    [search]
  );
  const totalFactor = useMemo(() => getTotalFactor(beneficiarios), [beneficiarios]);

  // Floor/ceiling user-facing: aplica fórmula tu7 (base × sumaF + gesAvg × N)
  // GES promedio aprox: 0.7 UF ≈ 28k CLP. Es una aproximación; cada plan tiene su GES exacto.
  const GES_AVG_CLP = 28_000;
  const N = beneficiarios.length;
  const priceFloor = N > 0
    ? Math.round(baseFloor * totalFactor + GES_AVG_CLP * N)
    : baseFloor;
  const priceCeiling = N > 0
    ? Math.round(baseCeiling * totalFactor + GES_AVG_CLP * N)
    : baseCeiling;

  const currentIsapres = search.get('isapre')?.split(',').filter(Boolean) ?? [];
  const currentZonas = search.get('zona')?.split(',').filter(Boolean) ?? [];
  const currentModalidad = search.get('modalidad') ?? '';
  const currentSearch = search.get('search') ?? '';
  const currentCobHosp = search.get('cobertura_hosp_min');
  const currentCobAmb = search.get('cobertura_amb_min');
  const currentPage = parseInt(search.get('page') ?? '1', 10);
  const currentSort = search.get('sort') ?? 'precio_asc';
  const priceMin = parseInt(search.get('precio_min_clp') ?? String(priceFloor), 10);
  const priceMax = parseInt(search.get('precio_max_clp') ?? String(priceCeiling), 10);
  const currentGrossSalary = search.get('sueldo_imponible_clp') ?? '';
  const currentLegalBudgetActive = search.get('aplicar_tope_legal') === 'true';

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(search.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    });
    if (!('page' in updates)) next.delete('page');
    startTransition(() => {
      router.push(`?${next.toString()}`);
    });
  }

  const [searchText, setSearchText] = useState(currentSearch);
  const [grossSalaryInput, setGrossSalaryInput] = useState(currentGrossSalary);
  const [selectedClinicas, setSelectedClinicas] = useState<string[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPdfPlan, setSelectedPdfPlan] = useState<Plan | null>(null);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const grossSalary = grossSalaryInput ? parseInt(grossSalaryInput, 10) : 0;
  const legalBudget = grossSalary > 0 ? Math.floor(grossSalary * 0.07) : 0;
  const budgetCLP = currentLegalBudgetActive && legalBudget > 0 ? legalBudget : null;

  // El push de `search` a la URL ya NO es automático: requiere Enter o click en una sugerencia.
  // Si el usuario borra el input por completo y había un search activo, lo limpiamos.
  useEffect(() => {
    if (searchText === '' && currentSearch !== '') {
      pushParams({ search: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  function submitPlanSearch() {
    const q = searchText.trim();
    pushParams({ search: q || null });
    setSearchOpen(false);
  }

  useEffect(() => {
    setGrossSalaryInput(currentGrossSalary);
  }, [currentGrossSalary]);

  useEffect(() => {
    const ids = search.get('prestador_ids');
    if (ids) {
      setSelectedClinicas(ids.split(',').filter(Boolean));
    } else {
      setSelectedClinicas([]);
    }
  }, [search]);

  useEffect(() => {
    if (!selectedPlan && !selectedPdfPlan) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPdfPlan, selectedPlan]);

  // Cerrar dropdown del buscador al hacer click afuera o pulsar Escape
  useEffect(() => {
    if (!searchOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSearchOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [searchOpen]);

  function toggleIsapre(slug: string) {
    const set = new Set(currentIsapres);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    pushParams({ isapre: set.size ? Array.from(set).join(',') : null });
  }

  function toggleZona(id: number) {
    const set = new Set(currentZonas);
    const str = String(id);
    if (set.has(str)) set.delete(str);
    else set.add(str);
    pushParams({ zona: set.size ? Array.from(set).join(',') : null });
  }

  const [localPriceMin, setLocalPriceMin] = useState(priceMin);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);
  useEffect(() => {
    setLocalPriceMin(priceMin);
    setLocalPriceMax(priceMax);
  }, [priceMin, priceMax]);

  function applyPriceRange() {
    pushParams({
      sueldo_imponible_clp: null,
      aplicar_tope_legal: null,
      precio_min_clp: localPriceMin > priceFloor ? String(localPriceMin) : null,
      precio_max_clp: localPriceMax < priceCeiling ? String(localPriceMax) : null,
    });
  }

  function applyLegalBudgetFilter() {
    if (!legalBudget) return;
    const cappedBudget = Math.min(Math.max(legalBudget, priceFloor), priceCeiling);
    pushParams({
      sueldo_imponible_clp: grossSalaryInput,
      aplicar_tope_legal: 'true',
      precio_min_clp: null,
      precio_max_clp: String(cappedBudget),
    });
  }

  function clearLegalBudgetFilter() {
    pushParams({
      sueldo_imponible_clp: null,
      aplicar_tope_legal: null,
      precio_max_clp: null,
    });
  }

  function toggleClinica(id: string) {
    setSelectedClinicas((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      pushParams({ prestador_ids: next.length ? next.join(',') : null, prestador: null });
      return next;
    });
  }

  // Selección de clínica desde el dropdown del buscador principal
  function selectClinicFromSearch(id: string) {
    setSelectedClinicas((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      pushParams({
        prestador_ids: next.length ? next.join(',') : null,
        prestador: null,
        search: null,
      });
      return next;
    });
    setSearchText('');
    setSearchOpen(false);
  }

  const clinicSuggestions = useMemo(() => {
    const q = normalizeText(searchText.trim());
    if (!q) return [];
    return initialPrestadores
      .filter((c) => normalizeText(c.name).includes(q))
      .slice(0, 6);
  }, [searchText, initialPrestadores]);

  function clearAll() {
    setSearchText('');
    setGrossSalaryInput('');
    setSelectedClinicas([]);
    setLocalPriceMin(priceFloor);
    setLocalPriceMax(priceCeiling);
    startTransition(() => {
      router.push('?');
    });
  }

  function addBeneficiario(b: Omit<Beneficiario, 'id'>) {
    const next: Beneficiario[] = [
      ...beneficiarios,
      { ...b, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
    ];
    pushParams({ ben: serializeBeneficiarios(next) });
  }

  function removeBeneficiario(id: string) {
    const next = beneficiarios.filter((b) => b.id !== id);
    pushParams({ ben: next.length ? serializeBeneficiarios(next) : null });
  }

  function clearBeneficiarios() {
    pushParams({ ben: null });
  }

  const items = initialData.items;
  const totalGlobal = initialIsapres.reduce((sum, i) => sum + i.plan_count, 0);

  // ── Group active counts ────────────────────────────────────────────
  const budgetGroupCount =
    (currentLegalBudgetActive ? 1 : 0) +
    (priceMin > priceFloor ? 1 : 0) +
    (priceMax < priceCeiling ? 1 : 0);

  const coverageGroupCount =
    (currentCobHosp !== null ? 1 : 0) +
    (currentCobAmb !== null ? 1 : 0);

  const prefsGroupCount =
    currentIsapres.length +
    currentZonas.length +
    (currentModalidad ? 1 : 0);

  const clinicasGroupCount = selectedClinicas.length;

  const totalActiveCount = budgetGroupCount + coverageGroupCount + prefsGroupCount + clinicasGroupCount;

  // ── Active filter chips ────────────────────────────────────────────
  const chips = useMemo<Chip[]>(() => {
    const arr: Chip[] = [];
    if (currentLegalBudgetActive && legalBudget > 0)
      arr.push({
        k: 'budget',
        l: `Mi 7% (≤ ${formatCLP(legalBudget)})`,
        clear: clearLegalBudgetFilter,
      });
    if (priceMin > priceFloor)
      arr.push({
        k: 'priceMin',
        l: `Desde ${formatCLP(priceMin)}`,
        clear: () => pushParams({ precio_min_clp: null }),
      });
    if (priceMax < priceCeiling)
      arr.push({
        k: 'priceMax',
        l: `Hasta ${formatCLP(priceMax)}`,
        clear: () => pushParams({ precio_max_clp: null }),
      });
    if (currentCobHosp !== null)
      arr.push({
        k: 'covH',
        l: `Hospitalaria ≥ ${currentCobHosp}%`,
        clear: () => pushParams({ cobertura_hosp_min: null }),
      });
    if (currentCobAmb !== null)
      arr.push({
        k: 'covA',
        l: `Ambulatoria ≥ ${currentCobAmb}%`,
        clear: () => pushParams({ cobertura_amb_min: null }),
      });
    currentIsapres.forEach((slug) => {
      const i = initialIsapres.find((x) => x.slug === slug);
      if (i)
        arr.push({
          k: `isa-${slug}`,
          l: i.name,
          clear: () => toggleIsapre(slug),
        });
    });
    currentZonas.forEach((id) => {
      const z = initialZonas.find((x) => String(x.id) === id);
      if (z)
        arr.push({
          k: `zona-${id}`,
          l: z.nombre,
          clear: () => toggleZona(z.id),
        });
    });
    if (currentModalidad)
      arr.push({
        k: 'mod',
        l: `Modalidad: ${currentModalidad}`,
        clear: () => pushParams({ modalidad: null }),
      });
    selectedClinicas.forEach((cid) => {
      const clinica = initialPrestadores.find((c) => c.id === cid);
      arr.push({
        k: `clin-${cid}`,
        l: clinica?.name ?? cid,
        clear: () => toggleClinica(cid),
      });
    });
    if (currentSearch)
      arr.push({
        k: 'search',
        l: `"${currentSearch}"`,
        clear: () => {
          setSearchText('');
          pushParams({ search: null });
        },
      });
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentLegalBudgetActive,
    legalBudget,
    priceMin,
    priceMax,
    priceFloor,
    priceCeiling,
    currentCobHosp,
    currentCobAmb,
    currentIsapres.join(','),
    currentZonas.join(','),
    currentModalidad,
    selectedClinicas.join(','),
    currentSearch,
    initialIsapres,
    initialZonas,
    initialPrestadores,
  ]);

  // ── Sidebar content ────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <FilterGroup
        title="Beneficiarios"
        defaultOpen={true}
        activeCount={beneficiarios.length}
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        }
      >
        <BeneficiariosBlock
          beneficiarios={beneficiarios}
          onAdd={addBeneficiario}
          onRemove={removeBeneficiario}
          onClear={clearBeneficiarios}
        />
      </FilterGroup>

      <FilterGroup
        title="Tu presupuesto"
        defaultOpen={true}
        activeCount={budgetGroupCount}
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        }
      >
        <SevenPercentBlock
          salaryInput={grossSalaryInput}
          setSalaryInput={setGrossSalaryInput}
          applyBudget={applyLegalBudgetFilter}
          clearBudget={clearLegalBudgetFilter}
          active={currentLegalBudgetActive}
          total={initialData.total}
        />
        <div className="pt-3 border-t border-[#0f514b]/8">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a] mb-2.5">
            O ajusta manualmente
          </div>
          <PriceRange
            min={localPriceMin}
            max={localPriceMax}
            floor={priceFloor}
            ceiling={priceCeiling}
            setMin={setLocalPriceMin}
            setMax={setLocalPriceMax}
            onCommit={applyPriceRange}
          />
        </div>
      </FilterGroup>

      <FilterGroup
        title="Tu cobertura"
        defaultOpen={false}
        activeCount={coverageGroupCount}
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
          </svg>
        }
      >
        <CoverageStepper
          label="Hospitalaria mínima"
          value={currentCobHosp ? parseInt(currentCobHosp, 10) : null}
          onChange={(v) => pushParams({ cobertura_hosp_min: v ? String(v) : null })}
        />
        <CoverageStepper
          label="Ambulatoria mínima"
          value={currentCobAmb ? parseInt(currentCobAmb, 10) : null}
          onChange={(v) => pushParams({ cobertura_amb_min: v ? String(v) : null })}
        />
      </FilterGroup>

      <FilterGroup
        title="Clínicas y hospitales"
        defaultOpen={false}
        activeCount={clinicasGroupCount}
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9h1" /><path d="M9 13h1" /><path d="M9 17h1" /><path d="M14 13h1" /><path d="M14 17h1" />
          </svg>
        }
      >
        <ClinicasFilter
          clinicas={initialPrestadores}
          selected={selectedClinicas}
          toggle={toggleClinica}
          activeCount={clinicasGroupCount}
        />
      </FilterGroup>

      <FilterGroup
        title="Tus preferencias"
        defaultOpen={false}
        activeCount={prefsGroupCount}
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        }
      >
        <IsapresFilter isapres={activeIsapres} selected={currentIsapres} toggle={toggleIsapre} />
        <ZonasFilter zonas={initialZonas} selected={currentZonas} toggle={toggleZona} />
        <ModalidadFilter
          options={MODALIDADES}
          value={currentModalidad}
          onChange={(v) => pushParams({ modalidad: v || null })}
        />
      </FilterGroup>
    </>
  );

  return (
    <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-4 sm:py-5 md:py-6">
      <h1 className="sr-only">Compara planes de isapre</h1>

      <div className="grid lg:grid-cols-[300px_1fr] gap-4 sm:gap-6 lg:gap-8">
        {/* ─── Desktop sidebar ─── */}
        <aside
          className="hidden lg:block space-y-3 sticky top-[80px] self-start"
          style={{ maxHeight: 'calc(100vh - 92px)', overflowY: 'auto' }}
        >
          {SidebarContent()}
          {totalActiveCount > 0 && (
            <button
              onClick={clearAll}
              className="w-full px-4 py-2.5 rounded-xl border border-[#0f514b]/15 text-[#0f514b] text-[12px] font-bold hover:bg-[#0f514b]/[0.03] transition-colors"
            >
              Limpiar todos los filtros ({totalActiveCount})
            </button>
          )}
        </aside>

        {/* ─── Results ─── */}
        <div className="space-y-5">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-[#0f514b]/10 p-3.5 flex flex-col sm:flex-row gap-3">
            <div ref={searchContainerRef} className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b6a] pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  if (!searchOpen) setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitPlanSearch();
                  }
                }}
                placeholder="Buscar por clínica, plan o código..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/15 text-[13.5px] text-[#0f514b] placeholder:text-slate-400 transition-all"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchText('');
                    setSearchOpen(false);
                    if (currentSearch) pushParams({ search: null });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#5a6b6a] transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {searchOpen && searchText.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-[0_16px_40px_-12px_rgba(15,81,75,0.22)] z-50 overflow-hidden">
                  {clinicSuggestions.length > 0 ? (
                    <>
                      <div className="px-3.5 pt-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a] bg-slate-50/70 border-b border-slate-100">
                        Clínicas y hospitales
                      </div>
                      <ul className="py-1">
                        {clinicSuggestions.map((c) => {
                          const isSelected = selectedClinicas.includes(c.id);
                          return (
                            <li key={c.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectClinicFromSearch(c.id)}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#14dcb4]/[0.07] transition-colors text-left"
                              >
                                <span
                                  className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-[#14dcb4] border-[#14dcb4]' : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-[#0f514b]"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  )}
                                </span>
                                <span
                                  className={`flex-1 truncate text-[13px] ${
                                    isSelected ? 'text-[#0f514b] font-semibold' : 'text-[#1e2a2a]'
                                  }`}
                                >
                                  {c.name}
                                </span>
                                {isSelected && (
                                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0f9d8a]">
                                    Activa
                                  </span>
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <div className="px-3.5 py-3 text-[12.5px] text-[#5a6b6a]">
                      No encontramos clínicas con &quot;<strong className="text-[#0f514b]">{searchText}</strong>&quot;.
                    </div>
                  )}
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={submitPlanSearch}
                    className="w-full border-t border-slate-100 px-3.5 py-2.5 bg-slate-50/60 hover:bg-[#14dcb4]/[0.08] text-[12px] text-[#0f514b] flex items-center gap-2 transition-colors text-left"
                  >
                    <Search className="w-3.5 h-3.5 shrink-0 text-[#0f9d8a]" />
                    <span className="truncate">
                      Buscar planes con &quot;<strong>{searchText}</strong>&quot; en nombre o código
                    </span>
                    <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a6b6a] border border-slate-200 rounded px-1.5 py-0.5 bg-white">
                      Enter
                    </span>
                  </button>
                </div>
              )}
            </div>
            <select
              value={currentSort}
              onChange={(e) => pushParams({ sort: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#14dcb4] focus:outline-none text-[13px] font-semibold text-[#0f514b] bg-white cursor-pointer"
            >
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="cobertura">Mayor cobertura</option>
              <option value="name_asc">Nombre A-Z</option>
            </select>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f514b] text-white text-[13px] font-bold"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="6" y1="12" x2="18" y2="12" />
                <line x1="9" y1="18" x2="15" y2="18" />
              </svg>
              Filtros
              {totalActiveCount > 0 && (
                <span className="bg-[#14dcb4] text-[#0f514b] text-[10px] font-extrabold w-5 h-5 rounded-full grid place-items-center">
                  {totalActiveCount}
                </span>
              )}
            </button>
          </div>

          <FilterChips chips={chips} clearAll={clearAll} />

          <div className="text-[13px] text-[#5a6b6a]">
            Mostrando <strong className="text-[#0f514b]">{items.length}</strong>{' '}
            {items.length === 1 ? 'plan' : 'planes'}
            {initialData.total !== items.length && (
              <>
                {' '}de <strong className="text-[#0f514b]">{initialData.total.toLocaleString('es-CL')}</strong>{' '}
                que coinciden con tus filtros
              </>
            )}
            {initialData.total_pages > 1 && (
              <span className="ml-2 text-[#5a6b6a]/70">
                · Página {initialData.page} de {initialData.total_pages}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState onClearAll={clearAll} activeFiltersCount={totalActiveCount} />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {items.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  onRequestPlan={setSelectedPlan}
                  onViewDetails={setSelectedPdfPlan}
                  budgetCLP={budgetCLP}
                  totalFactor={totalFactor}
                  numBeneficiarios={beneficiarios.length}
                />
              ))}
            </div>
          )}

          {initialData.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => pushParams({ page: String(currentPage - 1) })}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#0f514b] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#14dcb4] hover:text-[#0f9d8a]"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-sm text-[#5a6b6a]">
                {currentPage} / {initialData.total_pages}
              </span>
              <button
                type="button"
                disabled={currentPage >= initialData.total_pages}
                onClick={() => pushParams({ page: String(currentPage + 1) })}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-[#0f514b] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#14dcb4] hover:text-[#0f9d8a]"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div className="absolute inset-0 bg-[#06201d]/55 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 bottom-0 w-[340px] max-w-[90vw] bg-[#fbf8f3] shadow-2xl flex flex-col"
            style={{ animation: 'slide-in-right 0.3s cubic-bezier(.2,.8,.2,1)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0f514b] text-white px-5 py-4 flex items-center justify-between">
              <h2 className="text-[16px] font-bold">Filtros</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Cerrar"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {SidebarContent()}
            </div>
            <div className="border-t border-[#0f514b]/10 p-4 flex gap-2">
              <button
                onClick={clearAll}
                className="flex-1 py-3 rounded-xl border border-[#0f514b]/15 text-[#0f514b] text-[13px] font-bold"
              >
                Limpiar
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f514b] text-[13px] font-bold"
              >
                Ver {initialData.total} planes
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedPdfPlan && selectedPdfPlan.pdf_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[72] bg-slate-950/55 backdrop-blur-sm px-4 py-4 md:px-6"
            onClick={() => setSelectedPdfPlan(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              className="mx-auto flex h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-white/40 bg-[#f8fafc] shadow-[0_40px_120px_rgba(15,81,75,0.28)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[linear-gradient(135deg,#0f514b,#16766d)] px-4 py-2.5 text-white md:px-5">
                <div className="min-w-0 flex items-center gap-2 text-sm font-semibold">
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#14dcb4]">
                    PDF
                  </span>
                  <span className="text-white/35">|</span>
                  <h3 className="truncate text-sm font-bold md:text-base">{selectedPdfPlan.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedPdfPlan.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
                  >
                    Abrir aparte
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedPdfPlan(null)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Cerrar PDF"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-200/60 p-2 md:p-3">
                <iframe
                  src={selectedPdfPlan.pdf_url}
                  title={`PDF del plan ${selectedPdfPlan.name}`}
                  className="h-full w-full rounded-2xl border border-slate-200 bg-white"
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {selectedPlan && (() => {
          const isConsalud = selectedPlan.isapre_slug === 'consalud';
          const handleClose = () => {
            setSelectedPlan(null);
            setShowContactOptions(false);
            setShowLeadForm(false);
          };
          if (!showContactOptions && !showLeadForm) {
            if (isConsalud) {
              setShowContactOptions(true);
            } else {
              setShowLeadForm(true);
            }
            return null;
          }
          return (
            <motion.div
              key="plan-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm px-4 py-6 md:px-6"
              onClick={handleClose}
            >
              <motion.div
                initial={{ opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.98 }}
                transition={{ duration: 0.22 }}
                className="mx-auto flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-white/50 bg-[#f8fafc] shadow-[0_40px_120px_rgba(15,81,75,0.28)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[linear-gradient(135deg,#0f514b,#16766d)] px-4 py-2.5 text-white md:px-5">
                  <div className="min-w-0 flex items-center gap-2 text-sm font-semibold">
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#14dcb4]">
                      Cotización
                    </span>
                    <span className="text-white/35">|</span>
                    <h3 className="truncate text-sm font-bold md:text-base">{selectedPlan.name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20"
                    aria-label="Cerrar formulario"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="overflow-y-auto px-4 py-3 md:px-6 md:py-4">
                  {showContactOptions && !showLeadForm && (
                    <div className="space-y-5">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-[#0f514b] mb-2">
                          Conecta con un Ejecutivo {selectedPlan.isapre_name}
                        </h3>
                        <p className="text-sm text-[#5a6b6a]">Elige tu forma preferida de contacto</p>
                      </div>
                      <ContactOptions
                        isConsalud={isConsalud}
                        planName={selectedPlan.name}
                        isapreName={selectedPlan.isapre_name}
                        onChooseForm={() => {
                          setShowContactOptions(false);
                          setShowLeadForm(true);
                        }}
                      />
                    </div>
                  )}
                  {showLeadForm && (
                    <LeadCaptureForm
                      compact
                      showHeader={false}
                      onClose={handleClose}
                      contextPlan={{
                        name: selectedPlan.name,
                        isapreName: selectedPlan.isapre_name,
                      }}
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </section>
  );
}
