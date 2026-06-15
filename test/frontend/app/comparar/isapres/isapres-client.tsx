'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Isapre, Zona, PrestadorItem, PlansResponse, Plan } from '@/lib/api';
import { formatCLP, getPlanes } from '@/lib/api';
import { buildPlansQuery, isDefaultPlansView } from '@/lib/comparar-query';
import PageHeader from '@/components/comparar/page-header';
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
  totalGlobal,
}: {
  initialIsapres: Isapre[];
  initialZonas: Zona[];
  initialPrestadores: PrestadorItem[];
  initialData: PlansResponse;
  totalGlobal: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Filtros desde la URL, manejados en cliente ──────────────────────────────
  // NO usamos useSearchParams() a propósito: leerlo durante el render obliga a Next
  // a pre-renderizar el fallback del Suspense en lugar del catálogo, lo que rompería
  // el ISR. Hidratamos el estado desde window TRAS el montaje → el HTML estático
  // contiene la vista por defecto (cacheable en el edge) y el cliente toma el control.
  const [search, setSearch] = useState<URLSearchParams>(() => new URLSearchParams());
  const [data, setData] = useState<PlansResponse>(initialData);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const sync = () => setSearch(new URLSearchParams(window.location.search));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

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

  // Guarda la vista por defecto ya consultada EN VIVO, para no repetir la red al
  // limpiar filtros (volver al default muestra datos frescos al instante).
  const liveDefaultRef = useRef<PlansResponse | null>(null);

  // Filtrado en vivo: cuando cambia la URL (filtros/orden/página/beneficiarios) pedimos
  // los planes al backend desde el navegador.
  useEffect(() => {
    let cancelled = false;

    if (isDefaultPlansView(search)) {
      // Mostramos al instante lo mejor que tengamos: el snapshot pre-renderizado
      // (la "foto") o los datos en vivo si ya los trajimos.
      setData(liveDefaultRef.current ?? initialData);
      setIsFetching(false);
      // Y refrescamos la vista por defecto EN SILENCIO (sin spinner) una sola vez:
      // el usuario ve la foto y, ~1s después, los datos reales del backend sin tocar nada.
      if (liveDefaultRef.current) return;
      getPlanes(buildPlansQuery(search, beneficiarios))
        .then((res) => { if (!cancelled) { liveDefaultRef.current = res; setData(res); } })
        .catch(() => { /* si falla, se queda con la foto */ });
      return () => { cancelled = true; };
    }

    // Vista filtrada: pedimos al backend con indicador de carga visible.
    setIsFetching(true);
    getPlanes(buildPlansQuery(search, beneficiarios))
      .then((res) => { if (!cancelled) setData(res); })
      .catch(() => { /* si el backend falla, conservamos los datos previos */ })
      .finally(() => { if (!cancelled) setIsFetching(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
    setSearch(next); // dispara el fetch en vivo + actualiza la UI al instante
    startTransition(() => {
      router.push(`?${next.toString()}`); // mantiene la URL/historial sincronizados
    });
  }

  const [searchText, setSearchText] = useState(currentSearch);
  const [grossSalaryInput, setGrossSalaryInput] = useState(currentGrossSalary);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ───────── Draft de filtros (batching) ─────────
  // Los checkboxes/radios/segmented del sidebar NO se aplican al instante.
  // Acumulan cambios en `draft` hasta que el usuario presione "Aplicar filtros".
  type DraftState = {
    isapres: string[];
    zonas: string[];
    modalidad: string;
    cobHosp: string | null;
    cobAmb: string | null;
    prestadorIds: string[];
  };

  const urlState = useMemo<DraftState>(() => ({
    isapres: search.get('isapre')?.split(',').filter(Boolean) ?? [],
    zonas: search.get('zona')?.split(',').filter(Boolean) ?? [],
    modalidad: search.get('modalidad') ?? '',
    cobHosp: search.get('cobertura_hosp_min'),
    cobAmb: search.get('cobertura_amb_min'),
    prestadorIds: search.get('prestador_ids')?.split(',').filter(Boolean) ?? [],
  }), [search]);

  const [draft, setDraft] = useState<DraftState>(urlState);

  // Sync draft cuando la URL cambia desde fuera (Apply, ClearAll, navegación, etc.)
  useEffect(() => {
    setDraft(urlState);
  }, [urlState]);

  // Aplicar cambios del draft (con override opcional para acciones explícitas como chip-X o buscador)
  function applyDraft(override?: Partial<DraftState>, extraParams?: Record<string, string | null>) {
    const merged: DraftState = { ...draft, ...override };
    pushParams({
      isapre: merged.isapres.length ? merged.isapres.join(',') : null,
      zona: merged.zonas.length ? merged.zonas.join(',') : null,
      modalidad: merged.modalidad || null,
      cobertura_hosp_min: merged.cobHosp,
      cobertura_amb_min: merged.cobAmb,
      prestador_ids: merged.prestadorIds.length ? merged.prestadorIds.join(',') : null,
      prestador: null,
      ...(extraParams ?? {}),
    });
  }

  function cancelDraft() {
    setDraft(urlState);
  }

  const hasPendingChanges = useMemo(() => {
    const cmpArr = (a: string[], b: string[]) =>
      a.length === b.length && a.slice().sort().every((v, i) => v === b.slice().sort()[i]);
    return (
      !cmpArr(draft.isapres, urlState.isapres) ||
      !cmpArr(draft.zonas, urlState.zonas) ||
      draft.modalidad !== urlState.modalidad ||
      draft.cobHosp !== urlState.cobHosp ||
      draft.cobAmb !== urlState.cobAmb ||
      !cmpArr(draft.prestadorIds, urlState.prestadorIds)
    );
  }, [draft, urlState]);

  const pendingChangesCount = useMemo(() => {
    let count = 0;
    const inDraftNotUrl = (a: string[], b: string[]) => a.filter((x) => !b.includes(x)).length;
    count += inDraftNotUrl(draft.isapres, urlState.isapres) + inDraftNotUrl(urlState.isapres, draft.isapres);
    count += inDraftNotUrl(draft.zonas, urlState.zonas) + inDraftNotUrl(urlState.zonas, draft.zonas);
    count += inDraftNotUrl(draft.prestadorIds, urlState.prestadorIds) + inDraftNotUrl(urlState.prestadorIds, draft.prestadorIds);
    if (draft.modalidad !== urlState.modalidad) count++;
    if (draft.cobHosp !== urlState.cobHosp) count++;
    if (draft.cobAmb !== urlState.cobAmb) count++;
    return count;
  }, [draft, urlState]);

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

  useEffect(() => {
    setGrossSalaryInput(currentGrossSalary);
  }, [currentGrossSalary]);

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

  // Handlers que actualizan SOLO el draft (no la URL).
  function toggleIsapre(slug: string) {
    setDraft((d) => ({
      ...d,
      isapres: d.isapres.includes(slug) ? d.isapres.filter((s) => s !== slug) : [...d.isapres, slug],
    }));
  }

  function toggleZona(id: number) {
    const str = String(id);
    setDraft((d) => ({
      ...d,
      zonas: d.zonas.includes(str) ? d.zonas.filter((s) => s !== str) : [...d.zonas, str],
    }));
  }

  function toggleClinicaDraft(id: string) {
    setDraft((d) => ({
      ...d,
      prestadorIds: d.prestadorIds.includes(id) ? d.prestadorIds.filter((x) => x !== id) : [...d.prestadorIds, id],
    }));
  }

  function setDraftModalidad(v: string) {
    setDraft((d) => ({ ...d, modalidad: v }));
  }

  function setDraftCobHosp(v: number | null) {
    setDraft((d) => ({ ...d, cobHosp: v != null ? String(v) : null }));
  }

  function setDraftCobAmb(v: number | null) {
    setDraft((d) => ({ ...d, cobAmb: v != null ? String(v) : null }));
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
    // El 7% es un MARCADOR visual: las cards muestran "Pagas $X extra sobre tu 7%".
    // No setear precio_max_clp para que el backend muestre TODOS los planes y el chip
    // "Hasta $X" no aparezca duplicado con el chip "Mi 7%".
    pushParams({
      sueldo_imponible_clp: grossSalaryInput,
      aplicar_tope_legal: 'true',
      precio_min_clp: null,
      precio_max_clp: null,
    });
  }

  function clearLegalBudgetFilter() {
    pushParams({
      sueldo_imponible_clp: null,
      aplicar_tope_legal: null,
      precio_max_clp: null,
    });
  }

  // Click en clínica del buscador principal: aplica de inmediato (incluyendo el draft pendiente)
  function selectClinicFromSearch(id: string) {
    const newIds = draft.prestadorIds.includes(id)
      ? draft.prestadorIds.filter((x) => x !== id)
      : [...draft.prestadorIds, id];
    applyDraft({ prestadorIds: newIds }, { search: null });
    setSearchText('');
    setSearchOpen(false);
  }

  const clinicSuggestions = useMemo(() => {
    const q = normalizeText(searchText.trim());
    if (!q) return [];
    return initialPrestadores
      .filter((c) => normalizeText(c.name).includes(q))
      .slice(0, 5);
  }, [searchText, initialPrestadores]);

  const isapreSuggestions = useMemo(() => {
    const q = normalizeText(searchText.trim());
    if (!q) return [];
    return activeIsapres
      .filter((i) => normalizeText(i.name).includes(q) || normalizeText(i.slug ?? '').includes(q))
      .slice(0, 4);
  }, [searchText, activeIsapres]);

  function selectIsapreFromSearch(slug: string) {
    const newIsapres = draft.isapres.includes(slug)
      ? draft.isapres.filter((s) => s !== slug)
      : [...draft.isapres, slug];
    applyDraft({ isapres: newIsapres }, { search: null });
    setSearchText('');
    setSearchOpen(false);
  }

  function clearAll() {
    setSearchText('');
    setGrossSalaryInput('');
    setLocalPriceMin(priceFloor);
    setLocalPriceMax(priceCeiling);
    setDraft({ isapres: [], zonas: [], modalidad: '', cobHosp: null, cobAmb: null, prestadorIds: [] });
    setSearch(new URLSearchParams());
    startTransition(() => {
      router.push('?');
    });
  }

  // Beneficiarios = 1 cotizante (el usuario, su edad) + N cargas. Sin cotizante no hay cargas.
  const cotizante = beneficiarios.find((b) => b.tipo === 'cotizante') ?? null;
  const cargas = beneficiarios.filter((b) => b.tipo === 'carga');
  const cotizanteAge = cotizante?.edad ?? null;

  function setCotizanteAge(edad: number | null) {
    if (edad == null) {
      // Sin cotizante: limpiar todo (cargas no tienen sentido sin cotizante)
      pushParams({ ben: null });
      return;
    }
    const next: Beneficiario[] = [
      { id: `cot-${edad}`, edad, tipo: 'cotizante' },
      ...cargas,
    ];
    pushParams({ ben: serializeBeneficiarios(next) });
  }

  function addCarga(edad: number) {
    if (!cotizante) return; // no se puede agregar carga sin cotizante
    const next: Beneficiario[] = [
      cotizante,
      ...cargas,
      { id: `crg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, edad, tipo: 'carga' },
    ];
    pushParams({ ben: serializeBeneficiarios(next) });
  }

  function removeCarga(id: string) {
    if (!cotizante) return;
    const nextCargas = cargas.filter((c) => c.id !== id);
    const next = [cotizante, ...nextCargas];
    pushParams({ ben: serializeBeneficiarios(next) });
  }

  function clearBeneficiarios() {
    pushParams({ ben: null });
  }

  const items = data.items;

  // ── Group active counts ────────────────────────────────────────────
  const budgetGroupCount =
    (currentLegalBudgetActive ? 1 : 0) +
    (priceMin > priceFloor ? 1 : 0) +
    (priceMax < priceCeiling ? 1 : 0);

  // FilterGroup headers muestran el conteo del DRAFT (lo que el usuario tiene seleccionado),
  // no de la URL. Así el badge se actualiza en vivo al marcar checkboxes.
  const coverageGroupCount =
    (draft.cobHosp !== null ? 1 : 0) +
    (draft.cobAmb !== null ? 1 : 0);

  const isapresGroupCount = draft.isapres.length;

  const prefsGroupCount =
    draft.zonas.length +
    (draft.modalidad ? 1 : 0);

  const clinicasGroupCount = draft.prestadorIds.length;

  const totalActiveCount = budgetGroupCount + coverageGroupCount + isapresGroupCount + prefsGroupCount + clinicasGroupCount;

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
        clear: () => applyDraft({ cobHosp: null }),
      });
    if (currentCobAmb !== null)
      arr.push({
        k: 'covA',
        l: `Ambulatoria ≥ ${currentCobAmb}%`,
        clear: () => applyDraft({ cobAmb: null }),
      });
    currentIsapres.forEach((slug) => {
      const i = initialIsapres.find((x) => x.slug === slug);
      if (i)
        arr.push({
          k: `isa-${slug}`,
          l: i.name,
          clear: () => applyDraft({ isapres: draft.isapres.filter((s) => s !== slug) }),
        });
    });
    currentZonas.forEach((id) => {
      const z = initialZonas.find((x) => String(x.id) === id);
      if (z)
        arr.push({
          k: `zona-${id}`,
          l: z.nombre,
          clear: () => applyDraft({ zonas: draft.zonas.filter((s) => s !== String(z.id)) }),
        });
    });
    if (currentModalidad)
      arr.push({
        k: 'mod',
        l: `Modalidad: ${currentModalidad}`,
        clear: () => applyDraft({ modalidad: '' }),
      });
    urlState.prestadorIds.forEach((cid) => {
      const clinica = initialPrestadores.find((c) => c.id === cid);
      arr.push({
        k: `clin-${cid}`,
        l: clinica?.name ?? cid,
        clear: () => applyDraft({ prestadorIds: draft.prestadorIds.filter((x) => x !== cid) }),
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
    urlState.prestadorIds.join(','),
    draft,
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
          cotizanteAge={cotizanteAge}
          cargas={cargas}
          totalFactor={totalFactor}
          onSetCotizanteAge={setCotizanteAge}
          onAddCarga={addCarga}
          onRemoveCarga={removeCarga}
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
          value={draft.cobHosp ? parseInt(draft.cobHosp, 10) : null}
          onChange={setDraftCobHosp}
        />
        <CoverageStepper
          label="Ambulatoria mínima"
          value={draft.cobAmb ? parseInt(draft.cobAmb, 10) : null}
          onChange={setDraftCobAmb}
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
          selected={draft.prestadorIds}
          toggle={toggleClinicaDraft}
          activeCount={clinicasGroupCount}
        />
      </FilterGroup>

      <FilterGroup
        title="Isapres"
        defaultOpen={false}
        activeCount={isapresGroupCount}
        icon={
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z" />
            <path d="M9 12h6M12 9v6" />
          </svg>
        }
      >
        <IsapresFilter isapres={activeIsapres} selected={draft.isapres} toggle={toggleIsapre} />
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
        <ZonasFilter zonas={initialZonas} selected={draft.zonas} toggle={toggleZona} />
        <ModalidadFilter
          options={MODALIDADES}
          value={draft.modalidad}
          onChange={setDraftModalidad}
        />
      </FilterGroup>
    </>
  );

  return (
    <>
      <PageHeader
        totalShowing={items.length}
        totalFiltered={data.total}
        totalGlobal={totalGlobal}
      />

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-4 sm:py-5 md:py-6">

      <div className="grid lg:grid-cols-[300px_1fr] gap-4 sm:gap-6 lg:gap-8">
        {/* ─── Desktop sidebar ─── */}
        <aside
          className="hidden lg:flex flex-col space-y-3 sticky top-[80px] self-start"
          style={{ maxHeight: 'calc(100vh - 92px)' }}
        >
          <div className="flex-1 overflow-y-auto space-y-3 pb-1">
            {SidebarContent()}
            {totalActiveCount > 0 && (
              <button
                onClick={clearAll}
                className="w-full px-4 py-2.5 rounded-xl border border-[#0f514b]/15 text-[#0f514b] text-[12px] font-bold hover:bg-[#0f514b]/[0.03] transition-colors"
              >
                Limpiar todos los filtros ({totalActiveCount})
              </button>
            )}
          </div>

          {/* Footer sticky con Aplicar / Cancelar */}
          {hasPendingChanges && (
            <div className="shrink-0 rounded-2xl border-2 border-[#14dcb4]/40 bg-white p-2.5 shadow-[0_10px_24px_-10px_rgba(15,81,75,0.25)] flex items-center gap-2">
              <button
                type="button"
                onClick={cancelDraft}
                className="px-3 py-2.5 rounded-xl border border-[#0f514b]/15 text-[#0f514b] text-[11.5px] font-bold hover:bg-[#0f514b]/[0.03] transition-colors"
                title="Descartar cambios pendientes"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => applyDraft()}
                className="flex-1 px-3 py-2.5 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] text-[12.5px] font-bold shadow-[0_8px_18px_rgba(20,220,180,0.35)] hover:-translate-y-px transition-all inline-flex items-center justify-center gap-1.5"
              >
                Aplicar filtros
                <span className="bg-[#0f2826]/15 text-[#0f2826] text-[10px] font-extrabold px-1.5 py-0.5 rounded tabular-nums">
                  {pendingChangesCount}
                </span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
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
                    // Si hay exactamente 1 sugerencia, selecciónala. Sino, cierra dropdown.
                    if (isapreSuggestions.length === 1 && clinicSuggestions.length === 0) {
                      selectIsapreFromSearch(isapreSuggestions[0].slug ?? '');
                    } else if (clinicSuggestions.length === 1 && isapreSuggestions.length === 0) {
                      selectClinicFromSearch(clinicSuggestions[0].id);
                    } else {
                      setSearchOpen(false);
                    }
                  }
                }}
                placeholder="Busca por isapre o clínica..."
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
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-[0_16px_40px_-12px_rgba(15,81,75,0.22)] z-50 overflow-hidden max-h-[480px] overflow-y-auto">
                  {isapreSuggestions.length === 0 && clinicSuggestions.length === 0 && (
                    <div className="px-3.5 py-3 text-[12.5px] text-[#5a6b6a]">
                      No encontramos isapres ni clínicas con &quot;<strong className="text-[#0f514b]">{searchText}</strong>&quot;.
                    </div>
                  )}

                  {isapreSuggestions.length > 0 && (
                    <>
                      <div className="px-3.5 pt-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a] bg-slate-50/70 border-b border-slate-100">
                        Isapres
                      </div>
                      <ul className="py-1">
                        {isapreSuggestions.map((i) => {
                          const slug = i.slug ?? '';
                          const isSelected = currentIsapres.includes(slug);
                          return (
                            <li key={i.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectIsapreFromSearch(slug)}
                                className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#14dcb4]/[0.07] transition-colors text-left"
                              >
                                <span
                                  className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                    isSelected ? 'bg-[#14dcb4] border-[#14dcb4]' : 'border-slate-300 bg-white'
                                  }`}
                                >
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-[#0f514b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  )}
                                </span>
                                <span className={`flex-1 text-[13px] ${isSelected ? 'text-[#0f514b] font-semibold' : 'text-[#1e2a2a]'}`}>
                                  {i.name}
                                </span>
                                <span className="text-[10px] font-bold text-[#5a6b6a] tabular-nums bg-[#0f514b]/5 px-1.5 py-0.5 rounded">
                                  {i.plan_count}
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
                  )}

                  {clinicSuggestions.length > 0 && (
                    <>
                      <div className="px-3.5 pt-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a] bg-slate-50/70 border-y border-slate-100">
                        Clínicas y hospitales
                      </div>
                      <ul className="py-1">
                        {clinicSuggestions.map((c) => {
                          const isSelected = draft.prestadorIds.includes(c.id);
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
                                    <svg className="w-3 h-3 text-[#0f514b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  )}
                                </span>
                                <span className={`flex-1 text-[13px] leading-snug ${isSelected ? 'text-[#0f514b] font-semibold' : 'text-[#1e2a2a]'}`}>
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
                  )}
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

          <div className="text-[13px] text-[#5a6b6a] flex items-center gap-2">
            <span>
              Mostrando <strong className="text-[#0f514b]">{items.length}</strong>{' '}
              {items.length === 1 ? 'plan' : 'planes'}
              {data.total !== items.length && (
                <>
                  {' '}de <strong className="text-[#0f514b]">{data.total.toLocaleString('es-CL')}</strong>{' '}
                  que coinciden con tus filtros
                </>
              )}
              {data.total_pages > 1 && (
                <span className="ml-2 text-[#5a6b6a]/70">
                  · Página {data.page} de {data.total_pages}
                </span>
              )}
            </span>
            {(isFetching || isPending) && (
              <span
                className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#14dcb4]/30 border-t-[#14dcb4] animate-spin shrink-0"
                aria-label="Actualizando planes"
              />
            )}
          </div>

          {items.length === 0 ? (
            <EmptyState onClearAll={clearAll} activeFiltersCount={totalActiveCount} />
          ) : (
            <div
              className={`grid grid-cols-1 xl:grid-cols-2 gap-4 transition-opacity ${
                isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'
              }`}
              aria-busy={isFetching}
            >
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

          {data.total_pages > 1 && (
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
                {currentPage} / {data.total_pages}
              </span>
              <button
                type="button"
                disabled={currentPage >= data.total_pages}
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
                onClick={() => {
                  if (hasPendingChanges) applyDraft();
                  setMobileFiltersOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] text-[13px] font-bold inline-flex items-center justify-center gap-1.5"
              >
                {hasPendingChanges ? (
                  <>
                    Aplicar
                    <span className="bg-[#0f2826]/15 text-[#0f2826] text-[10px] font-extrabold px-1.5 py-0.5 rounded tabular-nums">
                      {pendingChangesCount}
                    </span>
                  </>
                ) : (
                  <>Ver {data.total} planes</>
                )}
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
    </>
  );
}
