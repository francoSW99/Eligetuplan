'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, RefreshCw, X } from 'lucide-react';
import type { Isapre, Zona, PlansResponse, Plan } from '@/lib/api';
import { formatCLP } from '@/lib/api';
import PlanCard from './plan-card';
import LeadCaptureForm from '@/components/ui/lead-capture-form';
import ContactOptions from '@/components/ui/contact-options';
import MobileFilterSheet from '@/components/ui/mobile-filter-sheet';

const MODALIDADES = ['Preferente', 'Libre Elección', 'Cerrado'] as const;
const COBERTURA_STEPS = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const UF_VALUE_CLP = 39987;

function formatRangeUF(clp: number): string {
  const uf = clp / UF_VALUE_CLP;
  return `UF ${uf.toLocaleString('es-CL', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function sanitizeCurrencyInput(value: string): string {
  return value.replace(/\D/g, '');
}

function formatSalaryCLP(rawDigits: string): string {
  if (!rawDigits) return '';
  const n = parseInt(rawDigits, 10);
  if (isNaN(n)) return '';
  return '$' + n.toLocaleString('es-CL');
}

function FilterSection({
  title,
  onReset,
  children,
  accent = 'blue',
}: {
  title: string;
  onReset?: () => void;
  children: React.ReactNode;
  accent?: 'blue' | 'teal';
}) {
  const header =
    accent === 'blue' ? 'bg-[#0f514b] text-white' : 'bg-[#0f514b] text-white';
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={`${header} px-4 py-3 flex items-center justify-between`}>
        <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-white/80 hover:text-white"
            title="Limpiar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CoberturaFilter({
  title,
  selected,
  onSelect,
  onClear,
  prestadores,
  prestador,
  onPrestador,
}: {
  title: string;
  selected: number | null;
  onSelect: (pct: number | null) => void;
  onClear: () => void;
  prestadores: string[];
  prestador: string;
  onPrestador: (p: string) => void;
}) {
  return (
    <FilterSection title={title} accent="blue" onReset={onClear}>
      <select
        value={prestador}
        onChange={(e) => onPrestador(e.target.value)}
        className="w-full px-3 py-2 mb-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40"
      >
        <option value="">Todos los Prestadores</option>
        {prestadores.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-4 gap-2">
        {COBERTURA_STEPS.map((pct) => {
          const active = selected === pct;
          return (
            <button
              key={pct}
              type="button"
              onClick={() => onSelect(active ? null : pct)}
              className={`text-xs font-semibold py-1.5 rounded-md border transition-all ${
                active
                  ? 'bg-[#0f514b] text-white border-[#0f514b]'
                  : 'border-dashed border-slate-300 text-slate-600 hover:border-[#14dcb4] hover:text-[#0f514b]'
              }`}
            >
              {pct}%
            </button>
          );
        })}
      </div>
    </FilterSection>
  );
}

export default function IsapresClient({
  initialIsapres,
  initialZonas,
  initialPrestadores,
  initialData,
}: {
  initialIsapres: Isapre[];
  initialZonas: Zona[];
  initialPrestadores: string[];
  initialData: PlansResponse;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [, startTransition] = useTransition();

  const activeIsapres = useMemo(
    () => initialIsapres.filter((i) => i.plan_count > 0),
    [initialIsapres]
  );

  const priceFloor = initialData.price_min_clp ?? 0;
  const priceCeiling = initialData.price_max_clp ?? 500000;

  const currentIsapres = search.get('isapre')?.split(',').filter(Boolean) ?? [];
  const currentZonas = search.get('zona')?.split(',').filter(Boolean) ?? [];
  const currentModalidad = search.get('modalidad') ?? '';
  const currentSearch = search.get('search') ?? '';
  const currentPrestadorHosp = search.get('prestador_hosp') ?? '';
  const currentPrestadorAmb = search.get('prestador_amb') ?? '';
  const currentPrestador = search.get('prestador') ?? '';
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
  const [clinicaSearch, setClinicaSearch] = useState(currentPrestador);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPdfPlan, setSelectedPdfPlan] = useState<Plan | null>(null);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const grossSalary = grossSalaryInput ? parseInt(grossSalaryInput, 10) : 0;
  const legalBudget = grossSalary > 0 ? Math.floor(grossSalary * 0.07) : 0;

  useEffect(() => {
    if (searchText === currentSearch) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ search: searchText || null });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  useEffect(() => {
    setGrossSalaryInput(currentGrossSalary);
  }, [currentGrossSalary]);

  useEffect(() => {
    setClinicaSearch(currentPrestador);
  }, [currentPrestador]);

  useEffect(() => {
    if (!selectedPlan && !selectedPdfPlan) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPdfPlan, selectedPlan]);

  function toggleIsapre(slug: string) {
    const set = new Set(currentIsapres);
    set.has(slug) ? set.delete(slug) : set.add(slug);
    pushParams({ isapre: set.size ? Array.from(set).join(',') : null });
  }

  function toggleZona(id: number) {
    const set = new Set(currentZonas);
    const str = String(id);
    set.has(str) ? set.delete(str) : set.add(str);
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
      precio_min_clp:
        localPriceMin > priceFloor ? String(localPriceMin) : null,
      precio_max_clp:
        localPriceMax < priceCeiling ? String(localPriceMax) : null,
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

  // Prestador: el backend tiene un solo filtro `prestador`. Combinamos:
  // si el usuario elige hospitalario Y ambulatorio, usamos el último elegido.
  function applyPrestador(kind: 'hosp' | 'amb', value: string) {
    pushParams({
      [kind === 'hosp' ? 'prestador_hosp' : 'prestador_amb']: value || null,
      prestador: value || null,
    });
  }

  const items = initialData.items;
  const totalGlobal = initialIsapres.reduce((sum, i) => sum + i.plan_count, 0);

  const activeFilterCount = [
    currentIsapres.length > 0,
    currentZonas.length > 0,
    currentModalidad !== '',
    currentCobHosp !== null,
    currentCobAmb !== null,
    currentPrestador !== '',
    currentLegalBudgetActive,
    localPriceMin > priceFloor || localPriceMax < priceCeiling,
  ].filter(Boolean).length;

  const sidebarContent = (
    <>
          <FilterSection
            title="Filtro por 7% legal"
            accent="blue"
            onReset={clearLegalBudgetFilter}
          >
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Sueldo bruto imponible
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatSalaryCLP(grossSalaryInput)}
                  onChange={(e) => setGrossSalaryInput(sanitizeCurrencyInput(e.target.value))}
                  placeholder="$ Ej: 950.000"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4]"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Ingresa tu sueldo imponible y calculamos el 7% disponible para cotizar tu plan.
                </p>
              </div>

              <div className="rounded-2xl border border-[#14dcb4]/20 bg-[#14dcb4]/8 px-4 py-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0f514b]/70">
                  7% disponible
                </div>
                <div className="mt-1 text-lg font-extrabold text-[#0f514b]">
                  {legalBudget ? formatCLP(legalBudget) : 'Ingresa tu sueldo'}
                </div>
                {legalBudget > 0 && (
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    Se mostraran planes con costo igual o menor a {formatCLP(Math.min(legalBudget, priceCeiling))}.
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!legalBudget}
                onClick={applyLegalBudgetFilter}
                className="w-full rounded-xl bg-[linear-gradient(135deg,#14dcb4,#0f9d8a)] px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(20,220,180,0.24)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currentLegalBudgetActive ? 'Actualizar filtro por mi 7%' : 'Filtrar por mi 7%'}
              </button>

              {currentLegalBudgetActive && legalBudget > 0 && (
                <div className="rounded-xl border border-[#14dcb4]/30 bg-[#14dcb4]/5 px-3 py-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0f514b]/60">
                    Con tu 7% puedes optar a
                  </div>
                  <div className="mt-0.5 text-2xl font-extrabold text-[#0f514b]">
                    {initialData.total.toLocaleString('es-CL')} planes
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    hasta {formatCLP(Math.min(legalBudget, priceCeiling))}
                  </div>
                </div>
              )}
            </div>
          </FilterSection>

          {/* Rango de precio */}
          <FilterSection
            title="Rango de precio"
            accent="blue"
            onReset={() =>
              pushParams({
                sueldo_imponible_clp: null,
                aplicar_tope_legal: null,
                precio_min_clp: null,
                precio_max_clp: null,
              })
            }
          >
            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Desde
                  </div>
                  <div className="text-base font-extrabold leading-none text-slate-900">
                    {formatCLP(localPriceMin)}
                  </div>
                  <div className="mt-1 inline-flex rounded-md bg-[#14dcb4]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0f514b]">
                    {formatRangeUF(localPriceMin)}
                  </div>
                </div>
                <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center shadow-sm">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Hasta
                  </div>
                  <div className="text-base font-extrabold leading-none text-slate-900">
                    {formatCLP(localPriceMax)}
                  </div>
                  <div className="mt-1 inline-flex rounded-md bg-[#14dcb4]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0f514b]">
                    {formatRangeUF(localPriceMax)}
                  </div>
                </div>
              </div>

              <div className="relative mt-4 px-2 py-3">
                <div className="absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#14dcb4]/20" />
                <div
                  className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#0f514b]"
                  style={{
                    left: `calc(${((localPriceMin - priceFloor) / Math.max(priceCeiling - priceFloor, 1)) * 100}% + 0.5rem)`,
                    right: `calc(${100 - ((localPriceMax - priceFloor) / Math.max(priceCeiling - priceFloor, 1)) * 100}% + 0.5rem)`,
                  }}
                />
                <input
                  type="range"
                  min={priceFloor}
                  max={priceCeiling}
                  step={1000}
                  value={localPriceMin}
                  onChange={(e) =>
                    setLocalPriceMin(Math.min(+e.target.value, localPriceMax - 1000))
                  }
                  onMouseUp={applyPriceRange}
                  onTouchEnd={applyPriceRange}
                  className="price-range-input"
                  aria-label="Precio mínimo"
                />
                <input
                  type="range"
                  min={priceFloor}
                  max={priceCeiling}
                  step={1000}
                  value={localPriceMax}
                  onChange={(e) =>
                    setLocalPriceMax(Math.max(+e.target.value, localPriceMin + 1000))
                  }
                  onMouseUp={applyPriceRange}
                  onTouchEnd={applyPriceRange}
                  className="price-range-input"
                  aria-label="Precio máximo"
                />
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Minimo: {formatCLP(priceFloor)}</span>
                <span>Maximo: {formatCLP(priceCeiling)}</span>
              </div>

              <div className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Rango seleccionado
                </div>
                <div className="mt-1 text-sm font-bold text-[#0f514b]">
                  {formatCLP(localPriceMin)} a {formatCLP(localPriceMax)}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-full bg-[linear-gradient(135deg,#14dcb4,#0f9d8a)] text-white text-xs font-bold text-center py-1.5">
              {initialData.total.toLocaleString('es-CL')} / {totalGlobal.toLocaleString('es-CL')} planes
            </div>
          </FilterSection>

          {/* Cobertura Hospitalaria */}
          <CoberturaFilter
            title="Cobertura Hospitalaria"
            selected={currentCobHosp ? parseInt(currentCobHosp, 10) : null}
            onSelect={(pct) =>
              pushParams({ cobertura_hosp_min: pct ? String(pct) : null })
            }
            onClear={() =>
              pushParams({
                cobertura_hosp_min: null,
                prestador_hosp: null,
                prestador: currentPrestadorAmb || null,
              })
            }
            prestadores={initialPrestadores}
            prestador={currentPrestadorHosp}
            onPrestador={(p) => applyPrestador('hosp', p)}
          />

          {/* Cobertura Ambulatoria */}
          <CoberturaFilter
            title="Cobertura Ambulatoria"
            selected={currentCobAmb ? parseInt(currentCobAmb, 10) : null}
            onSelect={(pct) =>
              pushParams({ cobertura_amb_min: pct ? String(pct) : null })
            }
            onClear={() =>
              pushParams({
                cobertura_amb_min: null,
                prestador_amb: null,
                prestador: currentPrestadorHosp || null,
              })
            }
            prestadores={initialPrestadores}
            prestador={currentPrestadorAmb}
            onPrestador={(p) => applyPrestador('amb', p)}
          />

          {/* Isapres */}
          <FilterSection
            title="Isapres"
            accent="blue"
            onReset={() => pushParams({ isapre: null })}
          >
            <ul className="space-y-2">
              {activeIsapres.map((i) => {
                const checked =
                  currentIsapres.length === 0 ||
                  currentIsapres.includes(i.slug ?? '');
                return (
                  <li key={i.id} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleIsapre(i.slug ?? '')}
                        className="w-4 h-4 rounded border-slate-300 accent-[#14dcb4]"
                      />
                      <span className="text-sm text-slate-700 truncate">
                        {i.name}
                      </span>
                      {i.ges_isapre_uf != null && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          [{i.ges_isapre_uf.toFixed(3)}]
                        </span>
                      )}
                    </label>
                    <span className="text-xs font-bold text-[#0f514b] bg-[#14dcb4]/10 px-2 py-0.5 rounded-md">
                      {i.plan_count}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-semibold">
                TOTAL PLANES:{' '}
                <span className="text-slate-800">
                  {initialData.total.toLocaleString('es-CL')}
                </span>
              </span>
            </div>
          </FilterSection>

          {/* Zonas */}
          <FilterSection
            title="Zonas"
            accent="blue"
            onReset={() => pushParams({ zona: null })}
          >
            <ul className="space-y-2">
              {initialZonas.map((z) => {
                const checked =
                  currentZonas.length === 0 || currentZonas.includes(String(z.id));
                return (
                  <li key={z.id} className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleZona(z.id)}
                        className="w-4 h-4 rounded border-slate-300 accent-[#14dcb4]"
                      />
                      <span className="text-sm text-slate-700">{z.nombre}</span>
                    </label>
                    <span className="text-xs font-bold text-[#0f514b] bg-[#14dcb4]/10 px-2 py-0.5 rounded-md">
                      {z.plan_count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </FilterSection>

          {/* Modalidad */}
          <FilterSection
            title="Modalidad"
            accent="blue"
            onReset={() => pushParams({ modalidad: null })}
          >
            <div className="space-y-2">
              {MODALIDADES.map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modalidad"
                    checked={currentModalidad === m}
                    onChange={() => pushParams({ modalidad: m })}
                    className="w-4 h-4 accent-[#14dcb4]"
                  />
                  <span className="text-sm text-slate-700">{m}</span>
                </label>
              ))}
            </div>
          </FilterSection>

          {/* Clínica Preferida */}
          <FilterSection
            title="Clínica Preferida"
            accent="blue"
            onReset={() => {
              setClinicaSearch('');
              pushParams({ prestador: null, prestador_hosp: null, prestador_amb: null });
            }}
          >
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                list="clinicas-list"
                value={clinicaSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setClinicaSearch(v);
                  if (initialPrestadores.includes(v)) {
                    pushParams({ prestador: v, prestador_hosp: null, prestador_amb: null });
                  } else if (!v) {
                    pushParams({ prestador: null, prestador_hosp: null, prestador_amb: null });
                  }
                }}
                placeholder="Buscar clínica..."
                className="w-full pl-10 pr-8 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4]/60 bg-white text-slate-800 placeholder:text-slate-400"
              />
              {clinicaSearch && (
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => {
                    setClinicaSearch('');
                    pushParams({ prestador: null, prestador_hosp: null, prestador_amb: null });
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white rounded-full p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <datalist id="clinicas-list">
                {initialPrestadores.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Selecciona tu clínica de preferencia para ver solo los planes que la cubren.
            </p>
          </FilterSection>
    </>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-24 lg:pb-10 md:pt-4">
      <MobileFilterSheet activeFilterCount={activeFilterCount}>
        {sidebarContent}
      </MobileFilterSheet>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* ─── Desktop Sidebar ─── */}
        <aside className="hidden lg:block space-y-4">
          {sidebarContent}
        </aside>

        {/* ─── Resultados ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <h1 className="sr-only">Compara planes de isapre</h1>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/50"
              />
            </div>
            <select
              value={currentSort}
              onChange={(e) => pushParams({ sort: e.target.value })}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/50"
            >
              <option value="precio_asc">Precio: menor a mayor</option>
              <option value="precio_desc">Precio: mayor a menor</option>
              <option value="name_asc">Nombre: A-Z</option>
            </select>
          </div>

          <div className="text-sm text-slate-600">
            Mostrando {items.length} de{' '}
            <strong>{initialData.total.toLocaleString('es-CL')}</strong> planes
            {initialData.total_pages > 1 && (
              <span className="ml-2 text-slate-400">
                · Página {initialData.page} de {initialData.total_pages}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-slate-500">
                No hay planes que coincidan con los filtros. Intenta ampliar tu búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {items.map((p) => (
                <PlanCard
                  key={p.id}
                  plan={p}
                  onRequestPlan={setSelectedPlan}
                  onViewDetails={setSelectedPdfPlan}
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
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#14dcb4] hover:text-[#14dcb4]"
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>
              <span className="text-sm text-slate-600">
                {currentPage} / {initialData.total_pages}
              </span>
              <button
                type="button"
                disabled={currentPage >= initialData.total_pages}
                onClick={() => pushParams({ page: String(currentPage + 1) })}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#14dcb4] hover:text-[#14dcb4]"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

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
                        <h3 className="text-lg font-bold text-[#0f514b] mb-2">Conecta con un Ejecutivo {selectedPlan.isapre_name}</h3>
                        <p className="text-sm text-slate-500">Elige tu forma preferida de contacto</p>
                      </div>
                      <ContactOptions
                        isConsalud={isConsalud}
                        planName={selectedPlan.name}
                        isapreName={selectedPlan.isapre_name}
                        onChooseForm={() => { setShowContactOptions(false); setShowLeadForm(true); }}
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
