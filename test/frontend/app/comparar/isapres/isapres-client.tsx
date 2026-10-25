'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Isapre, Zona, PrestadorItem, PlansResponse, Plan } from '@/lib/api';
import { formatCLP, getPlan, getPlanes } from '@/lib/api';
import { buildPlansQuery, COMPARAR_URL_EVENT, isDefaultPlansView, sueldoDesdeURL } from '@/lib/comparar-query';
import { CONTENEDOR_MOTION, FONDO_MOTION, useHojaMotion, useModalMotion } from '@/lib/motion';
import PageHeader from '@/components/comparar/page-header';
import {
  type Beneficiario,
  calcularSeptimoLegal,
  getTotalFactor,
  parseBeneficiarios,
  perfilParaPrecio,
  serializeBeneficiarios,
} from '@/lib/factores';
import { useMeta } from '@/lib/meta-context';
import PlanCard from './plan-card';
import PlanDetailModal from '@/components/comparar/plan-detail-modal';
import Pagination from '@/components/comparar/pagination';
import PerfilBar, { ABRIR_PERFIL_EVENT, type PerfilAplicado } from '@/components/comparar/perfil-bar';
import { BandejaComparar, CompararModal, MAX_COMPARAR } from '@/components/comparar/comparar-planes';
import LeadCaptureForm from '@/components/ui/lead-capture-form';
import ContactOptions from '@/components/ui/contact-options';
import {
  FilterGroup,
  PresupuestoBlock,
  CoverageStepper,
  IsapresFilter,
  ZonasFilter,
  ModalidadFilter,
  ClinicasFilter,
} from '@/components/comparar/sidebar-filters';
import FilterChips, { type Chip } from '@/components/comparar/filter-chips';
import EmptyState from '@/components/comparar/empty-state';

const MODALIDADES = ['Preferente', 'Libre Elección', 'Cerrado'] as const;

// Datos del perfil (barra "Tu perfil"): se recuerdan en este navegador para la próxima visita.
const PERFIL_KEYS = ['ben', 'sueldo_liquido_clp', 'sueldo_imponible_clp', 'ciudad'] as const;
const PERFIL_STORAGE = 'etp_perfil_v1';

function normalizeText(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const iconoGrupo = (d: React.ReactNode) => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

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
  const { ufValueCLP, topeImponibleUF } = useMeta();
  const [isPending, startTransition] = useTransition();

  // ── Estado desde la URL, manejado en cliente ──────────────────────────────
  // NO usamos useSearchParams() a propósito: leerlo durante el render obliga a Next
  // a pre-renderizar el fallback del Suspense en lugar del catálogo, lo que rompería
  // el ISR. Hidratamos el estado desde window TRAS el montaje → el HTML estático
  // contiene la vista por defecto (cacheable en el edge) y el cliente toma el control.
  const [search, setSearch] = useState<URLSearchParams>(() => new URLSearchParams());
  const [data, setData] = useState<PlansResponse>(initialData);
  const [isFetching, setIsFetching] = useState(false);

  // true si la ficha abierta se abrió con pushState (cerrarla = volver atrás).
  const pushedPlanRef = useRef(false);

  useEffect(() => {
    const sync = () => {
      pushedPlanRef.current = false;
      setSearch(new URLSearchParams(window.location.search));
    };
    // Primera carga: si la URL no trae perfil, recuperar el guardado en este navegador.
    const inicial = new URLSearchParams(window.location.search);
    if (!PERFIL_KEYS.some((k) => inicial.get(k))) {
      try {
        const guardado = localStorage.getItem(PERFIL_STORAGE);
        if (guardado) {
          new URLSearchParams(guardado).forEach((v, k) => {
            if (!inicial.get(k)) inicial.set(k, v);
          });
          window.history.replaceState(null, '', `?${inicial.toString()}`);
        }
      } catch {
        // Sin acceso a localStorage (modo privado, bloqueado): seguimos sin perfil.
      }
    }
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener(COMPARAR_URL_EVENT, sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener(COMPARAR_URL_EVENT, sync);
    };
  }, []);

  // Guardar el perfil (edad, cargas, sueldo, ciudad) cada vez que cambia.
  useEffect(() => {
    const sp = new URLSearchParams();
    PERFIL_KEYS.forEach((k) => {
      const v = search.get(k);
      if (v) sp.set(k, v);
    });
    if (search.get('ciudad') && search.get('zona')) sp.set('zona', search.get('zona')!);
    if ([...sp.keys()].length === 0) return;
    try {
      localStorage.setItem(PERFIL_STORAGE, sp.toString());
    } catch {
      // ignorar
    }
  }, [search]);

  const activeIsapres = useMemo(() => initialIsapres.filter((i) => i.plan_count > 0), [initialIsapres]);

  // ── Perfil ────────────────────────────────────────────────────────────────
  const beneficiarios = useMemo(() => parseBeneficiarios(search.get('ben')), [search]);
  // Perfil con el que se calculan TODOS los precios: el del usuario o, si aún no lo
  // ingresa, 1 persona de 30 años. Nunca mostramos el precio base pelado.
  const perfil = useMemo(() => perfilParaPrecio(beneficiarios), [beneficiarios]);
  const perfilPorDefecto = perfil !== beneficiarios;
  const factorPerfil = useMemo(() => getTotalFactor(perfil), [perfil]);
  const cotizanteAge = beneficiarios.find((b) => b.tipo === 'cotizante')?.edad ?? null;

  const sueldo = useMemo(() => sueldoDesdeURL(search), [search]);
  // 7% legal con tope imponible (90 UF en 2026), sobre el imponible (líquido ÷ 0,8 si
  // la persona dio su sueldo líquido).
  const legalBudget = sueldo ? calcularSeptimoLegal(sueldo.imponible, ufValueCLP, topeImponibleUF).montoCLP : 0;
  const budgetCLP = legalBudget > 0 ? legalBudget : null;
  const ciudad = search.get('ciudad');

  // ── Filtros (se aplican al instante) ──────────────────────────────────────
  const lista = (k: string) => search.get(k)?.split(',').filter(Boolean) ?? [];
  const currentIsapres = lista('isapre');
  const currentZonas = lista('zona');
  const currentPrestadorIds = lista('prestador_ids');
  const currentModalidad = search.get('modalidad') ?? '';
  const currentSearch = search.get('search') ?? '';
  const currentCobHosp = search.get('cobertura_hosp_min');
  const currentCobAmb = search.get('cobertura_amb_min');
  const currentPage = parseInt(search.get('page') ?? '1', 10);
  const currentSort = search.get('sort') ?? 'precio_asc';
  const enPresupuesto = ((): 'si' | 'no' | null => {
    const v = search.get('en_presupuesto');
    return budgetCLP && (v === 'si' || v === 'no') ? v : null;
  })();

  const zonaPerfilNombre = ciudad && currentZonas.length === 1
    ? initialZonas.find((z) => String(z.id) === currentZonas[0])?.nombre ?? null
    : null;

  // Rango del slider: el backend lo calcula con el precio familiar exacto del perfil.
  const priceFloor = data.price_min_clp ?? initialData.price_min_clp ?? 50_000;
  const priceCeiling = data.price_max_clp ?? initialData.price_max_clp ?? 500_000;
  const priceMin = parseInt(search.get('precio_min_clp') ?? String(priceFloor), 10);
  const priceMax = parseInt(search.get('precio_max_clp') ?? String(priceCeiling), 10);

  function pushParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(search.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') next.delete(k);
      else next.set(k, v);
    });
    if (!('page' in updates)) next.delete('page');
    setSearch(next); // dispara el fetch en vivo + actualiza la UI al instante
    startTransition(() => {
      // scroll:false → al cambiar filtros NO saltamos la posición de scroll.
      router.push(`?${next.toString()}`, { scroll: false });
    });
  }

  function toggleEnLista(k: string, v: string, extra: Record<string, string | null> = {}) {
    const cur = lista(k);
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    pushParams({ [k]: next.length ? next.join(',') : null, ...extra });
  }

  const toggleIsapre = (slug: string) => toggleEnLista('isapre', slug);
  // Tocar la zona a mano deja de mostrar la ciudad del perfil (ya no corresponde).
  const toggleZona = (id: number) => toggleEnLista('zona', String(id), ciudad ? { ciudad: null } : {});
  const toggleClinica = (id: string) => toggleEnLista('prestador_ids', id, { prestador: null });
  const setModalidad = (v: string) => pushParams({ modalidad: v || null });
  const setCobHosp = (v: number | null) => pushParams({ cobertura_hosp_min: v != null ? String(v) : null });
  const setCobAmb = (v: number | null) => pushParams({ cobertura_amb_min: v != null ? String(v) : null });
  const setEnPresupuesto = (v: 'si' | 'no' | null) =>
    pushParams({ en_presupuesto: v, precio_min_clp: null, precio_max_clp: null });

  // ── Consulta en vivo ──────────────────────────────────────────────────────
  // El efecto depende de la CONSULTA (queryKey), no del objeto URL: abrir/cerrar una
  // ficha (?plan=) cambia la URL pero no la lista, y no debe volver a pedirla.
  const liveDefaultRef = useRef<PlansResponse | null>(null);
  const isDefaultView = isDefaultPlansView(search);
  const plansQuery = useMemo(
    () => buildPlansQuery(search, beneficiarios, { presupuestoClp: budgetCLP }),
    [search, beneficiarios, budgetCLP]
  );
  const queryKey = `${isDefaultView ? 'default' : 'live'}:${JSON.stringify(plansQuery)}`;

  useEffect(() => {
    let cancelled = false;
    const query = plansQuery;

    if (isDefaultView) {
      setData(liveDefaultRef.current ?? initialData);
      setIsFetching(false);
      if (liveDefaultRef.current) return;
      getPlanes(query)
        .then((res) => { if (!cancelled) { liveDefaultRef.current = res; setData(res); } })
        .catch(() => {});
      return () => { cancelled = true; };
    }

    setIsFetching(true);
    const t = setTimeout(() => {
      getPlanes(query)
        .then((res) => { if (!cancelled) setData(res); })
        .catch(() => {})
        .finally(() => { if (!cancelled) setIsFetching(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  // ── Perfil: aplicar / limpiar ─────────────────────────────────────────────
  function aplicarPerfilCompleto(p: PerfilAplicado) {
    const updates: Record<string, string | null> = {
      ben:
        p.edad != null
          ? serializeBeneficiarios([
              { id: `cot-${p.edad}`, edad: p.edad, tipo: 'cotizante' },
              ...p.cargas.map((edad, i) => ({ id: `crg-${i}-${edad}`, edad, tipo: 'carga' as const })),
            ])
          : null,
      sueldo_liquido_clp: p.sueldo?.tipo === 'liquido' ? String(p.sueldo.monto) : null,
      sueldo_imponible_clp: p.sueldo?.tipo === 'bruto' ? String(p.sueldo.monto) : null,
      aplicar_tope_legal: null,
    };
    if (!p.sueldo) updates.en_presupuesto = null;
    if (p.ciudad === null) {
      updates.ciudad = null;
      if (ciudad) updates.zona = null;
    } else if (p.ciudad) {
      updates.ciudad = p.ciudad.nombre;
      updates.zona = String(p.ciudad.zonaId);
    }
    pushedPlanRef.current = false;
    pushParams(updates);
  }

  // Desde la ficha "Ver detalle": solo edad + pareja/hijos (no toca sueldo ni zona).
  function aplicarPerfil(edadTitular: number, edadesCargas: number[]) {
    const next: Beneficiario[] = [
      { id: `cot-${edadTitular}`, edad: edadTitular, tipo: 'cotizante' },
      ...edadesCargas.map((edad, i) => ({ id: `crg-${i}-${edad}`, edad, tipo: 'carga' as const })),
    ];
    // Con la ficha abierta esto suma otra entrada al historial: cerrarla ya no puede ser
    // "volver atrás" (regresaría al perfil anterior), así que se cierra quitando ?plan=.
    pushedPlanRef.current = false;
    pushParams({ ben: serializeBeneficiarios(next) });
  }

  function limpiarPerfil() {
    try {
      localStorage.removeItem(PERFIL_STORAGE);
    } catch {
      // ignorar
    }
    pushParams({
      ben: null,
      sueldo_liquido_clp: null,
      sueldo_imponible_clp: null,
      aplicar_tope_legal: null,
      en_presupuesto: null,
      ciudad: null,
      ...(ciudad ? { zona: null } : {}),
    });
  }

  // "Calcular el mío" (tarjetas): abre/enfoca la barra "Tu perfil".
  const focusPerfil = () => window.dispatchEvent(new Event(ABRIR_PERFIL_EVENT));

  // ── Ficha "Ver detalle" con link propio (?plan=<id>) ─────────────────────
  const planParam = search.get('plan');
  const [fetchedPlan, setFetchedPlan] = useState<Plan | null>(null);
  const detailPlan: Plan | null = planParam
    ? (fetchedPlan?.id === planParam ? fetchedPlan : data.items.find((p) => p.id === planParam) ?? null)
    : null;

  function replacePlanParam(id: string | null) {
    const next = new URLSearchParams(window.location.search);
    if (id) next.set('plan', id);
    else next.delete('plan');
    const qs = next.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
    setSearch(next);
  }

  function openDetail(plan: Plan) {
    setFetchedPlan(plan);
    const next = new URLSearchParams(window.location.search);
    next.set('plan', plan.id);
    window.history.pushState(null, '', `?${next.toString()}`);
    pushedPlanRef.current = true;
    setSearch(next);
  }

  function closeDetail() {
    if (pushedPlanRef.current) {
      pushedPlanRef.current = false;
      window.history.back();
    } else {
      replacePlanParam(null);
    }
  }

  useEffect(() => {
    if (!planParam) return;
    if (fetchedPlan?.id === planParam || data.items.some((p) => p.id === planParam)) return;
    let cancelled = false;
    getPlan(planParam)
      .then((p) => { if (!cancelled) setFetchedPlan(p); })
      .catch(() => { if (!cancelled) replacePlanParam(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planParam]);

  // ── Comparar hasta 3 planes ───────────────────────────────────────────────
  const [comparar, setComparar] = useState<Plan[]>([]);
  const [verComparacion, setVerComparacion] = useState(false);
  function toggleComparar(p: Plan) {
    setComparar((c) =>
      c.some((x) => x.id === p.id) ? c.filter((x) => x.id !== p.id) : c.length >= MAX_COMPARAR ? c : [...c, p]
    );
  }
  const quitarComparar = (id: string) => setComparar((c) => c.filter((x) => x.id !== id));
  const mostrarComparacion = verComparacion && comparar.length >= 2;

  // ── Otros modales ─────────────────────────────────────────────────────────
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hojaFiltrosMotion = useHojaMotion('derecha');
  const modalMotion = useModalMotion();

  function goToPage(page: number, scrollToTop: boolean) {
    pushParams({ page: String(page) });
    if (scrollToTop) {
      document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  const detailOpen = detailPlan != null;
  useEffect(() => {
    if (!selectedPlan && !detailOpen && !mostrarComparacion && !mobileFiltersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [detailOpen, selectedPlan, mostrarComparacion, mobileFiltersOpen]);

  // ── Precio (slider) ───────────────────────────────────────────────────────
  const [localPriceMin, setLocalPriceMin] = useState(priceMin);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);
  useEffect(() => {
    setLocalPriceMin(priceMin);
    setLocalPriceMax(priceMax);
  }, [priceMin, priceMax]);

  function applyPriceRange() {
    pushParams({
      en_presupuesto: null,
      precio_min_clp: localPriceMin > priceFloor ? String(localPriceMin) : null,
      precio_max_clp: localPriceMax < priceCeiling ? String(localPriceMax) : null,
    });
  }

  // ── Buscador: planes por nombre/código, Isapres y clínicas ────────────────
  const [searchText, setSearchText] = useState(currentSearch);
  const [searchOpen, setSearchOpen] = useState(false);
  const [planSuggestions, setPlanSuggestions] = useState<Plan[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Si el usuario borra el input por completo y había una búsqueda activa, la quitamos.
  useEffect(() => {
    if (searchText === '' && currentSearch !== '') pushParams({ search: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  // Sugerencias de PLANES (nombre o código) desde el backend, con debounce.
  useEffect(() => {
    const q = searchText.trim();
    if (q.length < 3) return;
    let cancelled = false;
    const t = setTimeout(() => {
      getPlanes({ search: q, limit: 5, factor_total: plansQuery.factor_total, n_beneficiarios: plansQuery.n_beneficiarios })
        .then((r) => { if (!cancelled) setPlanSuggestions(r.items); })
        .catch(() => {});
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);
  const planesSugeridos = searchText.trim().length >= 3 ? planSuggestions : [];

  useEffect(() => {
    if (!searchOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) setSearchOpen(false);
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

  const clinicSuggestions = useMemo(() => {
    const q = normalizeText(searchText.trim());
    if (!q) return [];
    return initialPrestadores.filter((c) => normalizeText(c.name).includes(q)).slice(0, 5);
  }, [searchText, initialPrestadores]);

  const isapreSuggestions = useMemo(() => {
    const q = normalizeText(searchText.trim());
    if (!q) return [];
    return activeIsapres
      .filter((i) => normalizeText(i.name).includes(q) || normalizeText(i.slug ?? '').includes(q))
      .slice(0, 4);
  }, [searchText, activeIsapres]);

  function selectIsapreFromSearch(slug: string) {
    toggleEnLista('isapre', slug, { search: null });
    setSearchText('');
    setSearchOpen(false);
  }

  function selectClinicFromSearch(id: string) {
    toggleEnLista('prestador_ids', id, { prestador: null, search: null });
    setSearchText('');
    setSearchOpen(false);
  }

  function selectPlanFromSearch(p: Plan) {
    setSearchOpen(false);
    openDetail(p);
  }

  function buscarTexto() {
    const total = isapreSuggestions.length + clinicSuggestions.length + planesSugeridos.length;
    if (total === 1) {
      if (isapreSuggestions.length) return selectIsapreFromSearch(isapreSuggestions[0].slug ?? '');
      if (clinicSuggestions.length) return selectClinicFromSearch(clinicSuggestions[0].id);
      return selectPlanFromSearch(planesSugeridos[0]);
    }
    // Varias coincidencias: filtrar la lista por nombre o código del plan.
    if (searchText.trim()) pushParams({ search: searchText.trim() });
    setSearchOpen(false);
  }

  // ── Limpiar filtros (el perfil se mantiene) ───────────────────────────────
  function clearAll() {
    setSearchText('');
    const next = new URLSearchParams();
    PERFIL_KEYS.forEach((k) => {
      const v = search.get(k);
      if (v) next.set(k, v);
    });
    if (ciudad && search.get('zona')) next.set('zona', search.get('zona')!);
    setSearch(next);
    startTransition(() => {
      router.push(`?${next.toString()}`, { scroll: false });
    });
  }

  const items = data.items;

  // ── Conteos de filtros activos ────────────────────────────────────────────
  const budgetGroupCount = (enPresupuesto ? 1 : 0) + (priceMin > priceFloor ? 1 : 0) + (priceMax < priceCeiling ? 1 : 0);
  const coberturaGroupCount = currentPrestadorIds.length + (currentCobHosp !== null ? 1 : 0) + (currentCobAmb !== null ? 1 : 0);
  const totalActiveCount =
    budgetGroupCount + coberturaGroupCount + currentIsapres.length + (ciudad ? 0 : currentZonas.length) + (currentModalidad ? 1 : 0);

  const clinicasElegidasNombres = currentPrestadorIds
    .map((id) => initialPrestadores.find((c) => c.id === id)?.name)
    .filter((n): n is string => !!n);

  // ── Chips de filtros activos ──────────────────────────────────────────────
  const enClinica = currentPrestadorIds.length > 0 ? ' en tu clínica' : '';
  const chips: Chip[] = [];
  if (enPresupuesto)
    chips.push({
      k: 'presu',
      l: enPresupuesto === 'si' ? 'Solo los que me alcanzan' : 'Solo con pago extra',
      clear: () => setEnPresupuesto(null),
    });
  if (priceMin > priceFloor) chips.push({ k: 'priceMin', l: `Desde ${formatCLP(priceMin)}`, clear: () => pushParams({ precio_min_clp: null }) });
  if (priceMax < priceCeiling) chips.push({ k: 'priceMax', l: `Hasta ${formatCLP(priceMax)}`, clear: () => pushParams({ precio_max_clp: null }) });
  if (currentCobHosp !== null) chips.push({ k: 'covH', l: `Hospitalaria ≥ ${currentCobHosp}%${enClinica}`, clear: () => setCobHosp(null) });
  if (currentCobAmb !== null) chips.push({ k: 'covA', l: `Ambulatoria ≥ ${currentCobAmb}%${enClinica}`, clear: () => setCobAmb(null) });
  currentIsapres.forEach((slug) => {
    const i = initialIsapres.find((x) => x.slug === slug);
    if (i) chips.push({ k: `isa-${slug}`, l: i.name, clear: () => toggleIsapre(slug) });
  });
  currentZonas.forEach((id) => {
    const z = initialZonas.find((x) => String(x.id) === id);
    if (z) chips.push({ k: `zona-${id}`, l: ciudad ? `${ciudad} (zona ${z.nombre})` : z.nombre, clear: () => toggleZona(z.id) });
  });
  if (currentModalidad) chips.push({ k: 'mod', l: `Modalidad: ${currentModalidad}`, clear: () => setModalidad('') });
  currentPrestadorIds.forEach((cid) => {
    const clinica = initialPrestadores.find((c) => c.id === cid);
    chips.push({ k: `clin-${cid}`, l: clinica?.name ?? cid, clear: () => toggleClinica(cid) });
  });
  if (currentSearch)
    chips.push({
      k: 'search',
      l: `"${currentSearch}"`,
      clear: () => {
        setSearchText('');
        pushParams({ search: null });
      },
    });

  // ── Barra lateral ─────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      <FilterGroup
        title="Tu presupuesto"
        activeCount={budgetGroupCount}
        icon={iconoGrupo(<><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /></>)}
        help={
          <>
            Por ley, el <strong className="text-white">7% de tu sueldo</strong> va a salud (con tope de 90 UF imponibles).
            Si el plan cuesta menos, te sobra; si cuesta más, pagas la diferencia. Las barras muestran cuántos planes hay en
            cada rango de precio.
          </>
        }
      >
        <PresupuestoBlock
          histogram={data.price_histogram ?? []}
          floor={priceFloor}
          ceiling={priceCeiling}
          min={localPriceMin}
          max={localPriceMax}
          setMin={setLocalPriceMin}
          setMax={setLocalPriceMax}
          onCommit={applyPriceRange}
          budgetCLP={budgetCLP}
          conteo={data.conteo_presupuesto}
          enPresupuesto={enPresupuesto}
          onEnPresupuesto={setEnPresupuesto}
        />
      </FilterGroup>

      <FilterGroup
        title="Cobertura en tu clínica"
        activeCount={coberturaGroupCount}
        icon={iconoGrupo(<><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9h1" /><path d="M9 13h1" /><path d="M9 17h1" /></>)}
        help={
          <>
            Elige la clínica donde te quieres atender y cuánto quieres que pague la Isapre ahí.
            <ul className="mt-1.5 space-y-0.5">
              <li>80–100%: copago bajo</li>
              <li>60–75%: copago medio</li>
              <li>40–55%: copago alto</li>
            </ul>
          </>
        }
      >
        <ClinicasFilter
          clinicas={initialPrestadores}
          selected={currentPrestadorIds}
          toggle={toggleClinica}
          activeCount={currentPrestadorIds.length}
        />
        <div className="pt-1 space-y-3">
          <p className="text-[11.5px] leading-snug text-[#5a6b6a]">
            {currentPrestadorIds.length > 0
              ? 'Porcentaje mínimo en las clínicas que elegiste:'
              : 'Porcentaje mínimo en cualquier clínica del plan:'}
          </p>
          <CoverageStepper
            label="Hospitalaria (cirugías, partos, días cama)"
            value={currentCobHosp ? parseInt(currentCobHosp, 10) : null}
            onChange={setCobHosp}
          />
          <CoverageStepper
            label="Ambulatoria (consultas y exámenes)"
            value={currentCobAmb ? parseInt(currentCobAmb, 10) : null}
            onChange={setCobAmb}
          />
        </div>
      </FilterGroup>

      <FilterGroup
        title="Isapre"
        activeCount={currentIsapres.length}
        icon={iconoGrupo(<><path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6z" /><path d="M9 12h6M12 9v6" /></>)}
        help={<>Marca una o varias para ver solo sus planes. El número es cuántos planes tiene cada una.</>}
      >
        <IsapresFilter isapres={activeIsapres} selected={currentIsapres} toggle={toggleIsapre} />
      </FilterGroup>

      <FilterGroup
        title="Zona"
        activeCount={ciudad ? 0 : currentZonas.length}
        icon={iconoGrupo(<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>)}
        help={<>Las Isapres venden planes por zona del país. Elige donde te atiendes normalmente; si escribiste tu ciudad en &quot;Tu perfil&quot;, ya está elegida.</>}
      >
        <ZonasFilter zonas={initialZonas} selected={currentZonas} toggle={toggleZona} />
      </FilterGroup>

      <FilterGroup
        title="Modalidad"
        activeCount={currentModalidad ? 1 : 0}
        icon={iconoGrupo(<><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></>)}
      >
        <ModalidadFilter options={MODALIDADES} value={currentModalidad} onChange={setModalidad} />
      </FilterGroup>
    </>
  );

  return (
    <div className="comparador">
      <PageHeader totalShowing={items.length} totalFiltered={data.total} totalGlobal={totalGlobal} />

      {/* Barra "Tu perfil": fija bajo el header. key = perfil de la URL → se reinicia si
          cambia desde otro lado (ficha, "volver al ejemplo", perfil recordado). */}
      <PerfilBar
        key={`${search.get('ben') ?? ''}|${sueldo?.tipo ?? ''}${sueldo?.monto ?? ''}|${ciudad ?? ''}`}
        beneficiarios={beneficiarios}
        perfilPorDefecto={perfilPorDefecto}
        sueldo={sueldo}
        ciudad={ciudad}
        zonaNombre={zonaPerfilNombre}
        budgetCLP={budgetCLP}
        onApply={aplicarPerfilCompleto}
        onClear={limpiarPerfil}
      />

      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-4 sm:py-5 md:py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-4 sm:gap-6 lg:gap-8">
          {/* ─── Barra lateral (escritorio) ─── */}
          <aside
            className="hidden lg:flex flex-col space-y-3 sticky top-[152px] self-start"
            style={{ maxHeight: 'calc(100vh - 164px)' }}
          >
            <div className="flex-1 overflow-y-auto space-y-3 pb-1 pr-0.5">{SidebarContent()}</div>
            {totalActiveCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="pressable shrink-0 w-full px-4 py-3 rounded-2xl border border-[#0f514b]/20 bg-white text-[#0f514b] text-[12.5px] font-bold hover:bg-[#0f514b]/[0.03] inline-flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar filtros ({totalActiveCount})
              </button>
            )}
          </aside>

          {/* ─── Resultados ─── */}
          <div id="resultados" className="space-y-5 scroll-mt-40">
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
                      buscarTexto();
                    }
                  }}
                  enterKeyHint="search"
                  placeholder="Busca un plan, código, Isapre o clínica..."
                  aria-label="Buscar planes, Isapres o clínicas"
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/15 text-[13.5px] text-[#0f514b] placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150"
                />
                {searchText && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchText('');
                      setSearchOpen(false);
                      if (currentSearch) pushParams({ search: null });
                    }}
                    className="pressable absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#5a6b6a]"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {searchOpen && searchText.trim().length > 0 && (
                  <div className="pop-in origin-top absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-[0_16px_40px_-12px_rgba(15,81,75,0.22)] z-50 overflow-hidden max-h-[min(480px,60dvh)] overflow-y-auto overscroll-contain">
                    {isapreSuggestions.length === 0 && clinicSuggestions.length === 0 && planesSugeridos.length === 0 && (
                      <div className="px-3.5 py-3 text-[12.5px] text-[#5a6b6a]">
                        {searchText.trim().length < 3
                          ? 'Escribe al menos 3 letras para buscar planes.'
                          : <>No encontramos planes, Isapres ni clínicas con &quot;<strong className="text-[#0f514b]">{searchText}</strong>&quot;.</>}
                      </div>
                    )}

                    {planesSugeridos.length > 0 && (
                      <>
                        <div className="px-3.5 pt-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a] bg-slate-50/70 border-b border-slate-100">
                          Planes
                        </div>
                        <ul className="py-1">
                          {planesSugeridos.map((p) => (
                            <li key={p.id}>
                              <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectPlanFromSearch(p)}
                                className="tappable-row w-full px-3.5 py-2 flex items-center justify-between gap-3 hover:bg-[#14dcb4]/[0.07] transition-colors text-left"
                              >
                                <span className="min-w-0">
                                  <span className="block text-[13px] font-semibold text-[#0f514b] truncate">{p.name}</span>
                                  <span className="block text-[11px] text-[#5a6b6a]">
                                    {p.isapre_name} · <span className="font-mono">{p.codigo_plan}</span>
                                  </span>
                                </span>
                                <span className="shrink-0 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#0f9d8a]">Ver ficha</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {isapreSuggestions.length > 0 && (
                      <>
                        <div className="px-3.5 pt-2.5 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a] bg-slate-50/70 border-y border-slate-100">
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
                                  className="tappable-row w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#14dcb4]/[0.07] transition-colors text-left"
                                >
                                  <span
                                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-[background-color,border-color] duration-150 ${
                                      isSelected ? 'bg-[#14dcb4] border-[#14dcb4]' : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-[#0f514b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6L9 17l-5-5" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className={`flex-1 text-[13px] ${isSelected ? 'text-[#0f514b] font-semibold' : 'text-[#1e2a2a]'}`}>{i.name}</span>
                                  <span className="text-[10px] font-bold text-[#5a6b6a] tabular-nums bg-[#0f514b]/5 px-1.5 py-0.5 rounded">{i.plan_count}</span>
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
                            const isSelected = currentPrestadorIds.includes(c.id);
                            return (
                              <li key={c.id}>
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => selectClinicFromSearch(c.id)}
                                  className="tappable-row w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-[#14dcb4]/[0.07] transition-colors text-left"
                                >
                                  <span
                                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-[background-color,border-color] duration-150 ${
                                      isSelected ? 'bg-[#14dcb4] border-[#14dcb4]' : 'border-slate-300 bg-white'
                                    }`}
                                  >
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-[#0f514b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 6L9 17l-5-5" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className={`flex-1 text-[13px] leading-snug ${isSelected ? 'text-[#0f514b] font-semibold' : 'text-[#1e2a2a]'}`}>{c.name}</span>
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
                aria-label="Ordenar planes"
                className="px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#14dcb4] focus:outline-none text-[13px] font-semibold text-[#0f514b] bg-white cursor-pointer"
              >
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="cobertura">Mayor cobertura</option>
                <option value="recientes">Más nuevos</option>
              </select>
            </div>

            <FilterChips chips={chips} clearAll={clearAll} />

            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <div className="text-[13px] text-[#5a6b6a] flex items-center gap-2 min-w-0">
                <span>
                  <strong className="text-[#0f514b] tabular-nums">{data.total.toLocaleString('es-CL')}</strong> {data.total === 1 ? 'plan' : 'planes'}
                </span>
                {(isFetching || isPending) && (
                  <span
                    className="inline-block w-3.5 h-3.5 rounded-full border-2 border-[#14dcb4]/30 border-t-[#14dcb4] animate-spin [animation-duration:0.7s] shrink-0"
                    aria-label="Actualizando planes"
                  />
                )}
              </div>
              <Pagination page={currentPage} totalPages={data.total_pages} onChange={(p) => goToPage(p, false)} />
            </div>

            {items.length === 0 ? (
              <EmptyState onClearAll={clearAll} activeFiltersCount={totalActiveCount} />
            ) : (
              <div
                className={`grid grid-cols-1 gap-3.5 transition-opacity ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
                aria-busy={isFetching}
              >
                {items.map((p) => (
                  <PlanCard
                    key={p.id}
                    plan={p}
                    onRequestPlan={setSelectedPlan}
                    onViewDetails={openDetail}
                    budgetCLP={budgetCLP}
                    totalFactor={factorPerfil}
                    numBeneficiarios={perfil.length}
                    perfilPorDefecto={perfilPorDefecto}
                    edadTitular={cotizanteAge}
                    onEditProfile={focusPerfil}
                    comparando={comparar.some((x) => x.id === p.id)}
                    compararLleno={comparar.length >= MAX_COMPARAR}
                    onToggleComparar={toggleComparar}
                  />
                ))}
              </div>
            )}

            {data.total_pages > 1 && (
              <div className="flex justify-center pt-4 pb-16 lg:pb-0">
                <Pagination page={currentPage} totalPages={data.total_pages} onChange={(p) => goToPage(p, true)} />
              </div>
            )}
          </div>
        </div>

        {/* Celular: botón "Filtros" flotante, siempre a mano */}
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="pressable lg:hidden fixed bottom-6 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#0f514b] px-4 py-3 text-[13px] font-bold text-white shadow-[0_14px_30px_-8px_rgba(9,46,42,0.55)] border border-[#14dcb4]/30"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden />
          Filtros
          {totalActiveCount > 0 && (
            <span className="bg-[#14dcb4] text-[#0f514b] text-[10.5px] font-extrabold min-w-5 h-5 px-1 rounded-full grid place-items-center">
              {totalActiveCount}
            </span>
          )}
        </button>

        <BandejaComparar
          planes={comparar}
          onQuitar={quitarComparar}
          onComparar={() => setVerComparacion(true)}
          onVaciar={() => setComparar([])}
        />

        {/* Hoja de filtros (celular) */}
        <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div key="hoja-filtros" {...CONTENEDOR_MOTION} className="fixed inset-0 z-[70] lg:hidden" onClick={() => setMobileFiltersOpen(false)}>
            <motion.div {...FONDO_MOTION} className="absolute inset-0 bg-[#06201d]/55 backdrop-blur-sm" />
            <motion.div
              {...hojaFiltrosMotion}
              role="dialog"
              aria-modal="true"
              aria-label="Filtros"
              className="absolute right-0 top-0 bottom-0 w-[340px] max-w-[90vw] bg-[#fbf8f3] shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0f514b] text-white px-5 py-4 flex items-center justify-between">
                <h2 className="text-[16px] font-bold">Filtros</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Cerrar"
                  className="pressable w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3">{SidebarContent()}</div>
              <div className="border-t border-[#0f514b]/10 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex gap-2">
                <button onClick={clearAll} className="pressable flex-1 py-3 rounded-xl border border-[#0f514b]/15 text-[#0f514b] text-[13px] font-bold">
                  Limpiar
                </button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="pressable flex-1 py-3 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] text-[13px] font-bold inline-flex items-center justify-center gap-1.5"
                >
                  Ver <span className="tabular-nums">{data.total.toLocaleString('es-CL')}</span> planes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>

        <AnimatePresence>
          {detailPlan && (
            <PlanDetailModal
              key={detailPlan.id}
              plan={detailPlan}
              perfil={perfil}
              perfilPorDefecto={perfilPorDefecto}
              beneficiariosUsuario={beneficiarios}
              budgetCLP={budgetCLP}
              onClose={closeDetail}
              onRequestPlan={(p) => {
                closeDetail();
                setSelectedPlan(p);
              }}
              onApplyPerfil={aplicarPerfil}
            />
          )}

          {mostrarComparacion && (
            <CompararModal
              key="comparar"
              planes={comparar}
              totalFactor={factorPerfil}
              numBeneficiarios={perfil.length}
              perfilPorDefecto={perfilPorDefecto}
              budgetCLP={budgetCLP}
              clinicasElegidas={clinicasElegidasNombres}
              onClose={() => setVerComparacion(false)}
              onQuitar={quitarComparar}
              onVerDetalle={(p) => {
                setVerComparacion(false);
                openDetail(p);
              }}
              onSolicitar={(p) => {
                setVerComparacion(false);
                setSelectedPlan(p);
              }}
            />
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
                {...FONDO_MOTION}
                className="fixed inset-0 z-[74] bg-slate-950/50 backdrop-blur-sm px-4 py-6 md:px-6"
                onClick={handleClose}
              >
                <motion.div
                  {...modalMotion}
                  className="mx-auto flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-[32px] border border-white/50 bg-[#f8fafc] shadow-[0_40px_120px_rgba(15,81,75,0.28)]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[linear-gradient(135deg,#0f514b,#16766d)] px-4 py-2.5 text-white md:px-5">
                    <div className="min-w-0 flex items-center gap-2 text-sm font-semibold">
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#14dcb4]">Cotización</span>
                      <span className="text-white/35">|</span>
                      <h3 className="truncate text-sm font-bold md:text-base">{selectedPlan.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/20"
                      aria-label="Cerrar formulario"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="overflow-y-auto overscroll-contain px-4 py-3 md:px-6 md:py-4">
                    {showContactOptions && !showLeadForm && (
                      <div className="space-y-5">
                        <div className="text-center">
                          <h3 className="text-lg font-bold text-[#0f514b] mb-2">Conecta con un Ejecutivo {selectedPlan.isapre_name}</h3>
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
                        contextPlan={{ name: selectedPlan.name, isapreName: selectedPlan.isapre_name }}
                      />
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </section>
    </div>
  );
}
