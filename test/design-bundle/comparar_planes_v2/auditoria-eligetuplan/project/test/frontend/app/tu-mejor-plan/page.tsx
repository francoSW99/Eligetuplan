'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Users, Check, Zap, MapPin, Mail, Plus, X, TrendingDown, TrendingUp, Shield, Heart, Sparkles, Search, ChevronDown, Loader2 } from 'lucide-react';
import LeadCaptureForm from '@/components/ui/lead-capture-form';
import type { LeadContextPlan } from '@/components/ui/lead-capture-form';
import ContactOptions from '@/components/ui/contact-options';

type Carga = { sexo: string; edad: string };
type PlanOption = {
  id: string;
  name: string;
  price_uf: number;
  hospital_coverage: number | null;
  ambulatory_coverage: number | null;
  modalidad: string | null;
};
type ScoreBreakdown = {
  affordability: number;
  coverage: number;
  value: number;
  extras: number;
  weights: { afford: number; coverage: number; value: number; extras: number };
};
type MatchResult = {
  id: string;
  name: string;
  isapre_name: string;
  isapre_slug: string | null;
  logo_url: string;
  price_uf: number;
  base_plan_uf: number | null;
  ges_isapre_uf: number | null;
  modalidad: string | null;
  match_score: number;
  hospital_coverage: number;
  ambulatory_coverage: number;
  savings_uf: number | null;
  savings_clp: number | null;
  savings_pct: number | null;
  coverage_diff_hosp_pp: number | null;
  coverage_diff_amb_pp: number | null;
  market_percentile_value: number | null;
  market_percentile_coverage: number | null;
  market_percentile_price: number | null;
  market_total_plans: number | null;
  score_breakdown: ScoreBreakdown | null;
  reason_tag: string | null;
};
type Preference = 'savings' | 'balanced' | 'coverage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const UF_CLP = 39987;

const ISAPRE_SLUGS: Record<string, string> = {
  banmedica: 'Banmédica',
  consalud: 'Consalud',
  cruzblanca: 'Cruz Blanca',
  nuevamasvida: 'Nueva Más Vida',
  colmena: 'Colmena Golden Cross',
  vidatres: 'Vida Tres',
  esencial: 'Esencial',
  fonasa: 'Fonasa',
};

const ISAPRE_LOGOS: Record<string, string> = {
  banmedica: '/logos/banmedica-logo.png',
  consalud: '/logos/logo_consalud.png',
  cruzblanca: '/logos/logo_cruzblanca.png',
  nuevamasvida: '/logos/Logo-NMV.png',
  colmena: '/logos/logos-col.png',
  vidatres: '/logos/vida-tres.png',
  esencial: '/logos/mamag.png',
  fonasa: '/logos/mamag.png',
};

function parseIncomeValue(value: string) {
  return Number(value.replace(/[^\d]/g, ''));
}

function formatIncomeInput(n: number): string {
  return n.toLocaleString('es-CL');
}

// Puntos de sueldo predefinidos. Cubren el grueso del mercado chileno.
const SALARY_PRESETS = [
  { label: '$700K',   value: 700_000 },
  { label: '$1M',     value: 1_000_000 },
  { label: '$1,5M',   value: 1_500_000 },
  { label: '$2M',     value: 2_000_000 },
  { label: '$2,5M',   value: 2_500_000 },
  { label: '$3M+',    value: 3_000_000 },
];

function formatCLP(n: number | null | undefined): string {
  if (n == null) return '—';
  return '$' + Math.abs(n).toLocaleString('es-CL');
}

function ufToCLP(uf: number): number {
  return Math.round(uf * UF_CLP);
}

export default function TuMejorPlanPage() {
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<'solo' | 'pareja'>('solo');
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cotizarPlan, setCotizarPlan] = useState<LeadContextPlan | null>(null);
  const [cotizarIsConsalud, setCotizarIsConsalud] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const [isapreActual, setIsapreActual] = useState('');
  const [planActual, setPlanActual] = useState('');
  const [precioUF, setPrecioUF] = useState('');
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [planSearch, setPlanSearch] = useState('');
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [selectedPlanData, setSelectedPlanData] = useState<PlanOption | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const planDropdownRef = useRef<HTMLDivElement>(null);

  const [sexo, setSexo] = useState('masculino');
  const [edad, setEdad] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');

  const [sexoPareja, setSexoPareja] = useState('femenino');
  const [edadPareja, setEdadPareja] = useState('');
  const [ingresoPareja, setIngresoPareja] = useState('');

  // Preferencia para el ranking. Default = 3B (balanced).
  const [preference, setPreference] = useState<Preference>('balanced');

  const steps = [
    { num: 1, label: 'Tu Plan Actual' },
    { num: 2, label: 'Tu Perfil' },
    { num: 3, label: 'Completado' },
  ];

  const addCarga = () => setCargas([...cargas, { sexo: 'masculino', edad: '' }]);
  const removeCarga = (i: number) => setCargas(cargas.filter((_, idx) => idx !== i));

  const recommendedPlan = results[0] ?? null;

  type AltCard = { key: string; badge: string; badgeColor: string; plan: MatchResult | null; reason: string };
  const altCards: AltCard[] = (() => {
    if (!recommendedPlan || results.length < 2) return [];

    const recId = recommendedPlan.id;
    const recPrice = recommendedPlan.price_uf;
    const recCov = recommendedPlan.hospital_coverage * 0.6 + recommendedPlan.ambulatory_coverage * 0.4;
    const others = results.filter(p => p.id !== recId);

    if (preference === 'savings') {
      const altBetterCov = others
        .filter(p => {
          const cov = p.hospital_coverage * 0.6 + p.ambulatory_coverage * 0.4;
          return cov > recCov && p.price_uf <= recPrice * 1.2;
        })
        .sort((a, b) => (b.hospital_coverage + b.ambulatory_coverage) - (a.hospital_coverage + a.ambulatory_coverage))[0] ?? null;

      const altCheaper = others
        .filter(p => p.price_uf < recPrice)
        .sort((a, b) => a.price_uf - b.price_uf)[0] ?? null;

      const cards: AltCard[] = [];
      if (altBetterCov) cards.push({
        key: 'alt-better-cov',
        badge: 'Mejor cobertura, precio similar',
        badgeColor: 'bg-[#14dcb4] text-white',
        plan: altBetterCov,
        reason: altBetterCov.reason_tag || `+${((altBetterCov.hospital_coverage * 0.6 + altBetterCov.ambulatory_coverage * 0.4) - recCov).toFixed(0)}pp cobertura por solo ${((altBetterCov.price_uf - recPrice) * UF_CLP).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}/mes más`,
      });
      if (altCheaper) cards.push({
        key: 'alt-cheaper',
        badge: 'Aún más económico',
        badgeColor: 'bg-[#0f514b] text-white',
        plan: altCheaper,
        reason: altCheaper.reason_tag || `${((recPrice - altCheaper.price_uf) * UF_CLP).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}/mes menos que el recomendado`,
      });
      return cards;

    } else if (preference === 'coverage') {
      const altGoodCovCheaper = others
        .filter(p => {
          const cov = p.hospital_coverage * 0.6 + p.ambulatory_coverage * 0.4;
          return cov >= recCov * 0.9 && p.price_uf < recPrice;
        })
        .sort((a, b) => a.price_uf - b.price_uf)[0] ?? null;

      const altMaxCov = others
        .filter(p => {
          const cov = p.hospital_coverage * 0.6 + p.ambulatory_coverage * 0.4;
          return cov > recCov;
        })
        .sort((a, b) => (b.hospital_coverage + b.ambulatory_coverage) - (a.hospital_coverage + a.ambulatory_coverage))[0] ?? null;

      const cards: AltCard[] = [];
      if (altGoodCovCheaper) cards.push({
        key: 'alt-similar-cheaper',
        badge: 'Cobertura similar, más económico',
        badgeColor: 'bg-[#14dcb4] text-white',
        plan: altGoodCovCheaper,
        reason: altGoodCovCheaper.reason_tag || `≥${(recCov * 0.9).toFixed(0)}% cobertura a ${((recPrice - altGoodCovCheaper.price_uf) * UF_CLP).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}/mes menos`,
      });
      if (altMaxCov) cards.push({
        key: 'alt-max-cov',
        badge: 'Cobertura máxima',
        badgeColor: 'bg-[#0f514b] text-white',
        plan: altMaxCov,
        reason: altMaxCov.reason_tag || `+${((altMaxCov.hospital_coverage * 0.6 + altMaxCov.ambulatory_coverage * 0.4) - recCov).toFixed(0)}pp más cobertura que el recomendado`,
      });
      return cards;

    } else {
      const altCheaper = others.sort((a, b) => a.price_uf - b.price_uf)[0] ?? null;
      const altBetterCov = others
        .filter(p => p.id !== altCheaper?.id)
        .sort((a, b) => (b.hospital_coverage + b.ambulatory_coverage) - (a.hospital_coverage + a.ambulatory_coverage))[0] ?? null;

      const cards: AltCard[] = [];
      if (altCheaper) {
        const savings = (recPrice - altCheaper.price_uf) * UF_CLP;
        cards.push({
          key: 'alt-cheaper',
          badge: savings > 0 ? 'Más económico' : 'Alternativa económica',
          badgeColor: 'bg-[#14dcb4] text-white',
          plan: altCheaper,
          reason: altCheaper.reason_tag || (savings > 0
            ? `${savings.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}/mes menos que el recomendado`
            : `${altCheaper.price_uf.toFixed(2)} UF/mes`),
        });
      }
      if (altBetterCov) {
        const covDiff = (altBetterCov.hospital_coverage * 0.6 + altBetterCov.ambulatory_coverage * 0.4) - recCov;
        cards.push({
          key: 'alt-better-cov',
          badge: covDiff > 0 ? 'Mayor cobertura' : 'Otra opción balanceada',
          badgeColor: 'bg-[#0f514b] text-white',
          plan: altBetterCov,
          reason: altBetterCov.reason_tag || (covDiff > 0
            ? `+${covDiff.toFixed(0)}pp cobertura respecto al recomendado`
            : `${altBetterCov.hospital_coverage.toFixed(0)}% hosp / ${altBetterCov.ambulatory_coverage.toFixed(0)}% amb`),
        });
      }
      return cards;
    }
  })();

  const parsedPrecioUF = selectedPlanData ? selectedPlanData.price_uf : (precioUF ? parseFloat(precioUF) : null);
  const currentPlanHosp = selectedPlanData?.hospital_coverage ?? null;
  const currentPlanAmb = selectedPlanData?.ambulatory_coverage ?? null;
  const currentPlanName = ISAPRE_SLUGS[isapreActual] || isapreActual || 'Tu plan actual';

  // Fetch plans when isapre changes
  useEffect(() => {
    if (!isapreActual || isapreActual === 'fonasa') {
      setPlanOptions([]);
      setSelectedPlanData(null);
      setPlanActual('');
      setPlanSearch('');
      return;
    }
    let cancelled = false;
    setLoadingPlans(true);
    const params = new URLSearchParams({ isapre: isapreActual, limit: '200' });
    if (planSearch) params.set('search', planSearch);
    fetch(`${API_BASE_URL}/api/v1/plans-autocomplete?${params}`)
      .then(r => r.json())
      .then((data: PlanOption[]) => {
        if (!cancelled) {
          setPlanOptions(data);
          setLoadingPlans(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingPlans(false);
      });
    return () => { cancelled = true; };
  }, [isapreActual, planSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (planDropdownRef.current && !planDropdownRef.current.contains(e.target as Node)) {
        setShowPlanDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Scroll to top when step changes to 3
  useEffect(() => {
    if (step === 3) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

  const resetFlow = () => {
    setStep(1);
    setResults([]);
    setValidationError('');
    setSubmitError('');
    setIsSubmitting(false);
    setCotizarPlan(null);
    setCotizarIsConsalud(false);
    setShowContactOptions(false);
    setShowLeadForm(false);
    setPreference('balanced');
  };

  const openContactModal = (name: string, isapreName: string, isConsalud: boolean) => {
    setCotizarPlan({ name, isapreName });
    setCotizarIsConsalud(isConsalud);
    if (isConsalud) {
      setShowContactOptions(true);
      setShowLeadForm(false);
    } else {
      setShowContactOptions(false);
      setShowLeadForm(true);
    }
  };

  const handleCompare = async () => {
    setValidationError('');
    setSubmitError('');

    const parsedAge = Number(edad);
    const parsedIncome = parseIncomeValue(ingreso);

    if (!Number.isFinite(parsedAge) || parsedAge < 18) {
      setValidationError('Ingresa una edad válida de 18 años o más para comparar planes.');
      return;
    }

    if (!Number.isFinite(parsedIncome) || parsedIncome <= 0) {
      setValidationError('Ingresa un sueldo líquido válido para calcular el presupuesto del plan.');
      return;
    }

    if (!region) {
      setValidationError('Selecciona una región antes de comparar.');
      return;
    }

    setIsSubmitting(true);

    try {
      // El backend rankea contra TODO el mercado (1854 planes activos para
      // calcular percentiles reales) y luego filtra a Consalud antes de devolver.
      // Le pasamos toda la info del plan actual para que pueda computar deltas.
      const body: Record<string, unknown> = {
        age: parsedAge,
        income_clp: parsedIncome,
        dependents: cargas.length + (tipo === 'pareja' ? 1 : 0),
        preferred_region: region,
        isapre: 'consalud',
        preference,
        limit: 6,
        sexo,
        tipo,
        sexo_pareja: tipo === 'pareja' ? sexoPareja : undefined,
        edad_pareja: tipo === 'pareja' ? (edadPareja ? parseInt(edadPareja, 10) : undefined) : undefined,
        ingreso_pareja_clp: tipo === 'pareja' ? parseIncomeValue(ingresoPareja) || undefined : undefined,
        cargas: cargas.map(c => ({
          sexo: c.sexo,
          edad: c.edad ? parseInt(c.edad, 10) : 0,
        })),
      };
      if (parsedPrecioUF != null && parsedPrecioUF > 0) {
        body.current_price_uf = parsedPrecioUF;
      }
      if (currentPlanHosp != null) {
        body.current_hospital_coverage = currentPlanHosp;
      }
      if (currentPlanAmb != null) {
        body.current_ambulatory_coverage = currentPlanAmb;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/match-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('No pudimos calcular tu comparación en este momento. Intenta nuevamente en unos minutos.');
      }

      const data = await response.json() as MatchResult[];
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('La API no devolvió planes para tu perfil.');
      }

      setResults(data);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Ocurrió un error inesperado al comparar planes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPlan = (plan: PlanOption) => {
    setPlanActual(plan.name);
    setSelectedPlanData(plan);
    setPrecioUF(plan.price_uf.toString());
    setShowPlanDropdown(false);
  };

  const filteredPlanOptions = planOptions.filter(p =>
    !planSearch || p.name.toLowerCase().includes(planSearch.toLowerCase())
  );

  const planCards: { key: string; badge: string; badgeColor: string; plan: MatchResult | null; reason: string }[] = [
    { key: 'recommended', badge: 'Recomendado', badgeColor: 'bg-[#0f514b] text-white', plan: recommendedPlan, reason: recommendedPlan?.reason_tag || '' },
    ...altCards,
  ];

  return (
    <div className="bg-[#fbf8f3] min-h-screen">
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Stepper */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-1 sm:gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s.num ? 'bg-[#14dcb4] text-white' : 'bg-slate-200 text-slate-400'}`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs sm:text-sm font-medium ${step >= s.num ? 'text-[#0f514b]' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-4 sm:w-12 h-0.5 mx-1 sm:mx-2 ${step > s.num ? 'bg-[#14dcb4]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-8">
                <span className="inline-block bg-[#14dcb4]/10 text-[#14dcb4] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">Paso 1 de 3</span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">
                  Cuéntanos sobre <span className="text-[#0f514b]">tu plan actual</span>
                </h2>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  Para comparar, necesitamos saber tu situación actual. Si no tienes Isapre, puedes omitir este paso.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                {/* Isapre Actual */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Isapre Actual</label>
                  <select value={isapreActual} onChange={(e) => { setIsapreActual(e.target.value); setPlanActual(''); setSelectedPlanData(null); setPrecioUF(''); setPlanSearch(''); }} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all bg-white">
                    <option value="">Selecciona tu Isapre</option>
                    {Object.entries(ISAPRE_SLUGS).map(([slug, name]) => (
                      <option key={slug} value={slug}>{name}</option>
                    ))}
                  </select>
                </div>

                {/* Plan Actual — autocomplete with real data */}
                {isapreActual && isapreActual !== 'fonasa' && (
                  <div ref={planDropdownRef} className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Plan Actual</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" value={planSearch || planActual} onChange={(e) => { setPlanSearch(e.target.value); setShowPlanDropdown(true); if (selectedPlanData) { setSelectedPlanData(null); setPrecioUF(''); } }} onFocus={() => setShowPlanDropdown(true)} placeholder="Escribe el nombre de tu plan..." className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                      {planActual && (
                        <button onClick={() => { setPlanActual(''); setSelectedPlanData(null); setPrecioUF(''); setPlanSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {showPlanDropdown && (
                      <div className="absolute z-50 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                        {loadingPlans ? (
                          <div className="px-4 py-6 text-center text-sm text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                            Cargando planes...
                          </div>
                        ) : filteredPlanOptions.length === 0 ? (
                          <div className="px-4 py-6 text-center text-sm text-slate-400">No se encontraron planes</div>
                        ) : (
                          filteredPlanOptions.slice(0, 30).map((plan) => (
                            <button key={plan.id} onClick={() => handleSelectPlan(plan)} className="w-full text-left px-4 py-3 hover:bg-[#14dcb4]/5 transition-colors border-b border-slate-50 last:border-0">
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-semibold text-[#0f514b] truncate">{plan.name}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">
                                    {plan.modalidad}
                                    {plan.hospital_coverage != null && ` · Hosp: ${plan.hospital_coverage.toFixed(0)}%`}
                                    {plan.ambulatory_coverage != null && ` · Amb: ${plan.ambulatory_coverage.toFixed(0)}%`}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-[#0f514b] ml-3 whitespace-nowrap">
                                  {plan.price_uf.toFixed(2)} UF
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}

                    {selectedPlanData && (
                      <div className="mt-3 rounded-xl border border-[#14dcb4]/20 bg-[#14dcb4]/5 px-4 py-3">
                        <div className="text-sm font-semibold text-[#0f514b]">{selectedPlanData.name}</div>
                        <div className="flex gap-4 mt-1 text-xs text-slate-500">
                          <span>{selectedPlanData.price_uf.toFixed(2)} UF/mes</span>
                          {selectedPlanData.hospital_coverage != null && <span>Hosp: {selectedPlanData.hospital_coverage.toFixed(0)}%</span>}
                          {selectedPlanData.ambulatory_coverage != null && <span>Amb: {selectedPlanData.ambulatory_coverage.toFixed(0)}%</span>}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Precio UF (editable, pre-filled si eligió plan) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Precio Mensual (UF)</label>
                  <div className="relative">
                    <input type="number" value={precioUF} onChange={(e) => setPrecioUF(e.target.value)} placeholder="Ej: 3.5" step="0.1" className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">UF</span>
                  </div>
                  {parsedPrecioUF != null && parsedPrecioUF > 0 && (
                    <p className="mt-1 text-xs text-slate-400">≈ {formatCLP(ufToCLP(parsedPrecioUF))}/mes</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button onClick={() => setStep(2)} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:-translate-y-0.5 shadow-lg" style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}>
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-8">
                <span className="inline-block bg-[#14dcb4]/10 text-[#14dcb4] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">Paso 2 de 3</span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">Ingresa <span className="text-[#0f514b]">tu perfil</span></h2>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto">Último paso antes de comparar. Necesitamos estos datos para buscar las mejores alternativas.</p>
              </div>

              <div className="flex justify-center gap-3 mb-8">
                <button onClick={() => setTipo('solo')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${tipo === 'solo' ? 'bg-[#0f514b] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}>
                  <User className="w-4 h-4" /> Solo
                </button>
                <button onClick={() => setTipo('pareja')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${tipo === 'pareja' ? 'bg-[#0f514b] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'}`}>
                  <Users className="w-4 h-4" /> Pareja
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5 mb-4">
                <h3 className="font-bold text-[#0f514b] text-sm uppercase tracking-wide">Titular</h3>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Sexo</label>
                  <div className="flex gap-3">
                    {['masculino', 'femenino'].map((s) => (
                      <button key={s} onClick={() => setSexo(s)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${sexo === s ? 'bg-[#14dcb4]/15 text-[#0f514b] border-2 border-[#14dcb4]' : 'bg-slate-50 text-slate-500 border-2 border-transparent'}`}>
                        {s === 'masculino' ? '♂ Masculino' : '♀ Femenino'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Edad</label>
                  <div className="relative">
                    <input type="number" value={edad} onChange={(e) => setEdad(e.target.value)} placeholder="Ej: 30" className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">años</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Ingreso Líquido Mensual</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {SALARY_PRESETS.map((p) => {
                      const isActive = parseIncomeValue(ingreso) === p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setIngreso(formatIncomeInput(p.value))}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all ${
                            isActive
                              ? 'bg-[#0f514b] text-white border-[#0f514b]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#14dcb4] hover:text-[#0f514b]'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                    <input type="text" value={ingreso} onChange={(e) => setIngreso(e.target.value)} placeholder="O escribe un monto exacto" className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                  </div>
                </div>
              </div>

              {tipo === 'pareja' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5 mb-4">
                  <h3 className="font-bold text-[#0f514b] text-sm uppercase tracking-wide">Pareja</h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Sexo</label>
                    <div className="flex gap-3">
                      {['masculino', 'femenino'].map((s) => (
                        <button key={s} onClick={() => setSexoPareja(s)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${sexoPareja === s ? 'bg-[#14dcb4]/15 text-[#0f514b] border-2 border-[#14dcb4]' : 'bg-slate-50 text-slate-500 border-2 border-transparent'}`}>
                          {s === 'masculino' ? '♂ Masculino' : '♀ Femenino'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Edad</label>
                    <input type="number" value={edadPareja} onChange={(e) => setEdadPareja(e.target.value)} placeholder="Ej: 28" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Ingreso Líquido Mensual</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {SALARY_PRESETS.map((p) => {
                        const isActive = parseIncomeValue(ingresoPareja) === p.value;
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setIngresoPareja(formatIncomeInput(p.value))}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full border-2 transition-all ${
                              isActive
                                ? 'bg-[#0f514b] text-white border-[#0f514b]'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-[#14dcb4] hover:text-[#0f514b]'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                      <input type="text" value={ingresoPareja} onChange={(e) => setIngresoPareja(e.target.value)} placeholder="O escribe un monto exacto" className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#0f514b] text-sm uppercase tracking-wide">Cargas ({cargas.length})</h3>
                  <button onClick={addCarga} className="inline-flex items-center gap-1 text-sm font-semibold text-[#14dcb4] hover:text-[#0f9d8a] transition-colors"><Plus className="w-4 h-4" /> Agregar carga</button>
                </div>
                {cargas.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sin cargas médicas agregadas.</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cargas.map((carga, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 relative">
                      <button onClick={() => removeCarga(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                      <p className="text-xs font-bold text-slate-500 mb-3">Carga {i + 1}</p>
                      <div className="flex gap-2 mb-2">
                        {['masculino', 'femenino'].map((s) => (
                          <button key={s} onClick={() => { const u = [...cargas]; u[i] = { ...u[i], sexo: s }; setCargas(u); }} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${carga.sexo === s ? 'bg-[#14dcb4]/15 text-[#0f514b] border border-[#14dcb4]' : 'bg-slate-50 text-slate-400 border border-transparent'}`}>
                            {s === 'masculino' ? '♂' : '♀'}
                          </button>
                        ))}
                      </div>
                      <input type="number" value={carga.edad} onChange={(e) => { const u = [...cargas]; u[i] = { ...u[i], edad: e.target.value }; setCargas(u); }} placeholder="Edad" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4]" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5 mb-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2"><MapPin className="w-3.5 h-3.5" /> Región</label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all bg-white">
                    <option value="">Selecciona tu región</option>
                    <option value="rm">Región Metropolitana</option>
                    <option value="valparaiso">Valparaíso</option>
                    <option value="biobio">Biobío</option>
                    <option value="araucania">La Araucanía</option>
                    <option value="loslagos">Los Lagos</option>
                    <option value="otra">Otra región</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2"><Mail className="w-3.5 h-3.5" /> Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@email.com" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                </div>
              </div>

              {/* Selector de preferencia — define los pesos del scoring */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm mb-4">
                <div className="text-center mb-5">
                  <h3 className="font-bold text-[#0f514b] text-base">¿Qué priorizas?</h3>
                  <p className="text-xs text-slate-400 mt-1">Esto afecta cómo rankeamos tus opciones.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {([
                    { key: 'savings'  as Preference, icon: TrendingDown, title: 'Ahorrar',         sub: 'Lo más económico' },
                    { key: 'balanced' as Preference, icon: Sparkles,     title: 'Bueno · Bonito · Barato', sub: 'Equilibrio precio + cobertura' },
                    { key: 'coverage' as Preference, icon: Shield,       title: 'Más Cobertura',   sub: 'Sin importar precio' },
                  ]).map(({ key, icon: Icon, title, sub }) => {
                    const active = preference === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPreference(key)}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          active
                            ? 'border-[#14dcb4] bg-[#14dcb4]/8 shadow-md'
                            : 'border-slate-200 bg-slate-50 hover:border-[#14dcb4]/60'
                        }`}
                      >
                        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-full mb-2 ${active ? 'bg-[#14dcb4] text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className={`text-sm font-bold ${active ? 'text-[#0f514b]' : 'text-slate-700'}`}>{title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {(validationError || submitError) && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{validationError || submitError}</div>
                )}
                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[#0f514b] border-2 border-slate-200 hover:border-[#14dcb4] transition-all">
                    <ArrowLeft className="w-4 h-4" /> Atrás
                  </button>
                  <button onClick={handleCompare} disabled={isSubmitting} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:-translate-y-0.5 shadow-lg disabled:cursor-not-allowed disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}>
                    <Zap className="w-4 h-4" /> {isSubmitting ? 'Comparando...' : 'Comparar Ahora'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== STEP 3 - Results ===== */}
          {step === 3 && recommendedPlan && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {/* Success header */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.4 }} className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-[#14dcb4]/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#14dcb4]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2">¡Encontramos el plan ideal para ti!</h2>
                <p className="text-slate-500">
                  Comparamos los <strong className="text-[#0f514b]">{recommendedPlan.market_total_plans?.toLocaleString('es-CL') ?? '1.854'} planes activos de las 7 Isapres</strong> y estas son las mejores opciones para ti
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Ranking ponderado segun tu preferencia: <strong className="text-[#14dcb4]">{preference === 'savings' ? 'Ahorrar' : preference === 'coverage' ? 'Mas Cobertura' : 'Bueno · Bonito · Barato'}</strong>
                </p>
              </motion.div>

              {/* Comparison: Current Plan vs Recommended */}
              {parsedPrecioUF != null && parsedPrecioUF > 0 && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Current plan card */}
                  <div className="bg-white rounded-2xl border-2 border-slate-200 p-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Tu Plan Actual</div>
                    <div className="flex items-center gap-3 mb-4">
                      {isapreActual && ISAPRE_LOGOS[isapreActual] && <img src={ISAPRE_LOGOS[isapreActual]} alt="" className="h-8 w-auto object-contain opacity-70" />}
                      <div>
                        <div className="font-bold text-slate-700 text-sm">{currentPlanName}</div>
                        {planActual && <div className="text-xs text-slate-400">{planActual}</div>}
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-600 mb-1">
                      {parsedPrecioUF.toFixed(2)} <span className="text-base font-medium text-slate-400">UF/mes</span>
                    </div>
                    <div className="text-sm text-slate-400 mb-4">≈ {formatCLP(ufToCLP(parsedPrecioUF))}/mes</div>

                    {/* Real coverage bars for current plan */}
                    {(currentPlanHosp != null || currentPlanAmb != null) && (
                      <div className="space-y-2">
                        {currentPlanHosp != null && (
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-600">Hospitalaria</span>
                              <span className="text-slate-500">{currentPlanHosp.toFixed(0)}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-300 rounded-full" style={{ width: `${currentPlanHosp}%` }} />
                            </div>
                          </div>
                        )}
                        {currentPlanAmb != null && (
                          <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-slate-600">Ambulatoria</span>
                              <span className="text-slate-500">{currentPlanAmb.toFixed(0)}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-300 rounded-full" style={{ width: `${currentPlanAmb}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Recommended plan card (winner del scoring multi-objetivo) */}
                  <div className="bg-white rounded-2xl border-2 border-[#14dcb4] p-6 shadow-lg relative">
                    <div className="absolute -top-3 left-4 bg-[#14dcb4] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Recomendado</div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#14dcb4] mb-3 pt-1">Tu Nuevo Plan</div>
                    <div className="flex items-center gap-3 mb-4">
                      {recommendedPlan.logo_url && <img src={recommendedPlan.logo_url} alt="" className="h-8 w-auto object-contain" />}
                      <div>
                        <div className="font-bold text-[#0f514b] text-sm">{recommendedPlan.isapre_name}</div>
                        <div className="text-xs text-slate-400 max-w-[200px] truncate">{recommendedPlan.name}</div>
                        {recommendedPlan.reason_tag && (
                          <div className="text-[11px] text-[#14dcb4] font-medium mt-0.5">{recommendedPlan.reason_tag}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-3xl font-extrabold text-[#0f514b] mb-1">
                      {recommendedPlan.price_uf.toFixed(2)} <span className="text-base font-medium text-slate-400">UF/mes</span>
                    </div>
                    <div className="text-sm text-slate-500 mb-4">≈ {formatCLP(ufToCLP(recommendedPlan.price_uf))}/mes</div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-600">Hospitalaria</span>
                          <span className="text-[#0f514b] font-bold">{recommendedPlan.hospital_coverage.toFixed(0)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a] rounded-full" initial={{ width: 0 }} animate={{ width: `${recommendedPlan.hospital_coverage}%` }} transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-600">Ambulatoria</span>
                          <span className="text-[#0f514b] font-bold">{recommendedPlan.ambulatory_coverage.toFixed(0)}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a] rounded-full" initial={{ width: 0 }} animate={{ width: `${recommendedPlan.ambulatory_coverage}%` }} transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Savings or comparison highlight */}
              {parsedPrecioUF != null && parsedPrecioUF > 0 && recommendedPlan.savings_clp != null && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
                  <div className="rounded-2xl border border-[#14dcb4]/20 bg-gradient-to-br from-[#14dcb4]/8 to-[#0f9d8a]/5 p-6 mb-8">
                    {recommendedPlan.savings_clp > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingDown className="w-5 h-5 text-[#14dcb4]" />
                          <h3 className="text-lg font-bold text-[#0f514b]">¡Ahorras con {recommendedPlan.isapre_name}!</h3>
                        </div>
<div className="grid grid-cols-3 gap-2 sm:gap-4">
                            <div className="text-center">
                              <motion.div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#14dcb4]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                {formatCLP(recommendedPlan.savings_clp)}
                              </motion.div>
                              <div className="text-[10px] sm:text-xs text-slate-500 mt-1">ahorro mensual</div>
                          </div>
                          <div className="text-center">
                            <motion.div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#14dcb4]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                              {formatCLP(recommendedPlan.savings_clp * 12)}
                            </motion.div>
                            <div className="text-[10px] sm:text-xs text-slate-500 mt-1">ahorro anual</div>
                          </div>
                          <div className="text-center">
                            <motion.div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f514b]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                              {recommendedPlan.hospital_coverage.toFixed(0)}%
                            </motion.div>
                            <div className="text-[10px] sm:text-xs text-slate-500 mt-1">cobertura hospitalaria</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="w-5 h-5 text-[#0f9d8a]" />
                          <h3 className="text-lg font-bold text-[#0f514b]">Mejor cobertura por una pequeña diferencia</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4">
                          <div className="text-center">
                            <motion.div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f9d8a]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                              {formatCLP(Math.abs(recommendedPlan.savings_clp))}
                            </motion.div>
                            <div className="text-[10px] sm:text-xs text-slate-500 mt-1">inversión adicional/mes</div>
                          </div>
                          <div className="text-center">
                            <motion.div className="text-2xl md:text-3xl font-extrabold text-[#14dcb4]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                              {recommendedPlan.hospital_coverage.toFixed(0)}%
                            </motion.div>
                            <div className="text-xs text-slate-500 mt-1">vs {currentPlanHosp?.toFixed(0) ?? '—'}% actual</div>
                          </div>
                          <div className="text-center">
                            <motion.div className="text-2xl md:text-3xl font-extrabold text-[#14dcb4]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                              {recommendedPlan.ambulatory_coverage.toFixed(0)}%
                            </motion.div>
                            <div className="text-xs text-slate-500 mt-1">vs {currentPlanAmb?.toFixed(0) ?? '—'}% actual</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* No current price: show simple recommendation */}
              {(parsedPrecioUF == null || parsedPrecioUF <= 0) && recommendedPlan && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="mb-8">
                  <div className="rounded-2xl border border-[#14dcb4]/20 bg-gradient-to-br from-[#14dcb4]/8 to-[#0f9d8a]/5 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-[#14dcb4]" />
                      <h3 className="text-lg font-bold text-[#0f514b]">Plan recomendado para ti</h3>
                    </div>
<div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <motion.div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0f514b]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        {recommendedPlan.price_uf.toFixed(2)} UF
                        </motion.div>
                        <div className="text-xs text-slate-500 mt-1">precio mensual</div>
                      </div>
                      <div className="text-center">
                        <motion.div className="text-2xl md:text-3xl font-extrabold text-[#14dcb4]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                          {recommendedPlan.hospital_coverage.toFixed(0)}%
                        </motion.div>
                        <div className="text-xs text-slate-500 mt-1">hospitalaria</div>
                      </div>
                      <div className="text-center">
                        <motion.div className="text-2xl md:text-3xl font-extrabold text-[#14dcb4]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                          {recommendedPlan.ambulatory_coverage.toFixed(0)}%
                        </motion.div>
                        <div className="text-xs text-slate-500 mt-1">ambulatoria</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Justificacion cuantitativa — por que este plan */}
              {recommendedPlan.market_total_plans != null && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="rounded-2xl border border-[#0f514b]/15 bg-white p-6 md:p-8 mb-6 shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-[#14dcb4]" />
                    <h3 className="text-lg font-bold text-[#0f514b]">Por qué este plan es mejor para ti</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">
                    Análisis cuantitativo contra los <strong className="text-[#0f514b]">{recommendedPlan.market_total_plans.toLocaleString('es-CL')} planes activos</strong> del mercado.
                  </p>

                  {/* Percentiles de mercado */}
                  <div className="space-y-4 mb-6">
                    {recommendedPlan.market_percentile_coverage != null && (
                      <div>
                        <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                          <span className="text-[#0f514b]">Cobertura combinada</span>
                          <span className="text-[#14dcb4]">Mejor que el {recommendedPlan.market_percentile_coverage.toFixed(0)}% del mercado</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a]"
                            initial={{ width: 0 }}
                            animate={{ width: `${recommendedPlan.market_percentile_coverage}%` }}
                            transition={{ delay: 0.55, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    )}
                    {recommendedPlan.market_percentile_value != null && (
                      <div>
                        <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                          <span className="text-[#0f514b]">Relación cobertura / precio</span>
                          <span className="text-[#14dcb4]">Mejor que el {recommendedPlan.market_percentile_value.toFixed(0)}% del mercado</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a]"
                            initial={{ width: 0 }}
                            animate={{ width: `${recommendedPlan.market_percentile_value}%` }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    )}
                    {recommendedPlan.market_percentile_price != null && (
                      <div>
                        <div className="flex items-center justify-between text-sm font-semibold mb-1.5">
                          <span className="text-[#0f514b]">Precio</span>
                          <span className="text-[#14dcb4]">Más conveniente que el {recommendedPlan.market_percentile_price.toFixed(0)}% del mercado</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a]"
                            initial={{ width: 0 }}
                            animate={{ width: `${recommendedPlan.market_percentile_price}%` }}
                            transition={{ delay: 0.85, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deltas vs plan actual (si hay datos) */}
                  {(recommendedPlan.coverage_diff_hosp_pp != null || recommendedPlan.coverage_diff_amb_pp != null || recommendedPlan.savings_clp != null) && (
                    <div className="border-t border-slate-100 pt-5 mb-5">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Cambios vs tu plan actual</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {recommendedPlan.savings_clp != null && (
                          <div className="rounded-xl border border-slate-200 p-3 text-center">
                            <div className={`text-xl font-extrabold ${recommendedPlan.savings_clp >= 0 ? 'text-[#14dcb4]' : 'text-[#0f9d8a]'}`}>
                              {recommendedPlan.savings_clp >= 0 ? '−' : '+'}{formatCLP(recommendedPlan.savings_clp)}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">{recommendedPlan.savings_clp >= 0 ? 'menos al mes' : 'más al mes'}</div>
                          </div>
                        )}
                        {recommendedPlan.coverage_diff_hosp_pp != null && (
                          <div className="rounded-xl border border-slate-200 p-3 text-center">
                            <div className={`text-xl font-extrabold ${recommendedPlan.coverage_diff_hosp_pp >= 0 ? 'text-[#14dcb4]' : 'text-amber-500'}`}>
                              {recommendedPlan.coverage_diff_hosp_pp >= 0 ? '+' : ''}{recommendedPlan.coverage_diff_hosp_pp.toFixed(0)} pp
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">cobertura hospitalaria</div>
                          </div>
                        )}
                        {recommendedPlan.coverage_diff_amb_pp != null && (
                          <div className="rounded-xl border border-slate-200 p-3 text-center">
                            <div className={`text-xl font-extrabold ${recommendedPlan.coverage_diff_amb_pp >= 0 ? 'text-[#14dcb4]' : 'text-amber-500'}`}>
                              {recommendedPlan.coverage_diff_amb_pp >= 0 ? '+' : ''}{recommendedPlan.coverage_diff_amb_pp.toFixed(0)} pp
                            </div>
                            <div className="text-[11px] text-slate-500 mt-1">cobertura ambulatoria</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Score breakdown */}
                  {recommendedPlan.score_breakdown && (
                    <div className="border-t border-slate-100 pt-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Score multi-objetivo</div>
                        <div className="text-2xl font-extrabold text-[#0f514b]">
                          {recommendedPlan.match_score.toFixed(1)}<span className="text-sm font-medium text-slate-400">/100</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {[
                          { label: 'Asequibilidad', value: recommendedPlan.score_breakdown.affordability, weight: recommendedPlan.score_breakdown.weights.afford },
                          { label: 'Cobertura',     value: recommendedPlan.score_breakdown.coverage,      weight: recommendedPlan.score_breakdown.weights.coverage },
                          { label: 'Valor (perc.)', value: recommendedPlan.score_breakdown.value,         weight: recommendedPlan.score_breakdown.weights.value },
                          { label: 'Otros',         value: recommendedPlan.score_breakdown.extras,        weight: recommendedPlan.score_breakdown.weights.extras },
                        ].map((b) => (
                          <div key={b.label} className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{b.label}</div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-extrabold text-[#0f514b]">{b.value.toFixed(0)}</span>
                              <span className="text-[10px] text-slate-400">/100</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">peso {(b.weight * 100).toFixed(0)}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Plan Cards — Recommended + smart alternatives */}
              <div className={`grid gap-4 mb-8 ${altCards.length === 0 ? 'grid-cols-1 max-w-md mx-auto' : altCards.length === 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
                {planCards.map(({ key, badge, badgeColor, plan, reason }) => {
                  if (!plan) return null;
                  const isRecommended = key === 'recommended';
                  const cardClass = isRecommended
                    ? 'bg-white rounded-2xl border-2 border-[#14dcb4] p-6 shadow-lg relative'
                    : 'bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative';

                  return (
                    <motion.div key={key} className={cardClass} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + (isRecommended ? 0 : 0.15), duration: 0.4 }}>
                      <span className={`absolute -top-3 left-4 text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>{badge}</span>
                      <div className="pt-4">
                        {plan.logo_url && <img src={plan.logo_url} alt="" className="h-6 w-auto object-contain mb-2 opacity-80" />}
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{plan.isapre_name}</p>
                        <h4 className="font-bold text-[#0f514b] mb-1 text-sm leading-tight">{plan.name}</h4>
                        {(reason || plan.reason_tag) && (
                          <p className="text-[11px] text-[#14dcb4] font-medium mb-2">{reason || plan.reason_tag}</p>
                        )}
                        <div className="text-2xl font-extrabold text-[#0f514b] mb-1">
                          {plan.price_uf.toFixed(2)} <span className="text-sm font-medium text-slate-400">UF/mes</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-3">≈ {formatCLP(ufToCLP(plan.price_uf))}/mes</div>

                        {/* Coverage bars */}
                        <div className="space-y-1.5 mb-3">
                          <div>
                            <div className="flex justify-between text-[11px] font-medium mb-0.5">
                              <span className="text-slate-500">Hospitalaria</span>
                              <span className="text-[#0f514b]">{plan.hospital_coverage.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a] rounded-full" style={{ width: `${plan.hospital_coverage}%` }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] font-medium mb-0.5">
                              <span className="text-slate-500">Ambulatoria</span>
                              <span className="text-[#0f514b]">{plan.ambulatory_coverage.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a] rounded-full" style={{ width: `${plan.ambulatory_coverage}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Savings or coverage badge */}
                        {parsedPrecioUF != null && parsedPrecioUF > 0 && plan.savings_clp != null && plan.savings_clp > 0 && (
                          <div className="rounded-lg bg-[#14dcb4]/10 px-2 py-1.5 text-center mb-3">
                            <span className="text-xs font-bold text-[#0f514b]">Ahorras {formatCLP(plan.savings_clp)}/mes</span>
                          </div>
                        )}
                        {parsedPrecioUF != null && parsedPrecioUF > 0 && plan.savings_clp != null && plan.savings_clp <= 0 && (
                          <div className="rounded-lg bg-[#0f9d8a]/10 px-2 py-1.5 text-center mb-3">
                            <span className="text-xs font-bold text-[#0f514b]">Mejor cobertura</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs mb-3">
                          <span className="text-slate-400">Match</span>
                          <span className="font-bold text-[#0f514b]">{plan.match_score.toFixed(1)} pts</span>
                        </div>

                        <button onClick={() => openContactModal(plan.name, plan.isapre_name, plan.isapre_slug === 'consalud')} className={isRecommended ? 'w-full py-2.5 rounded-xl font-bold text-sm bg-[#14dcb4] text-white hover:bg-[#12c9a4] transition-all shadow-md' : 'w-full py-2.5 rounded-xl font-bold text-sm border-2 border-[#14dcb4] text-[#0f514b] hover:bg-[#14dcb4]/10 transition-all'}>
                          Cotizar
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Big CTA */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.4 }} className="text-center mt-8 space-y-4">
                <button onClick={() => openContactModal(recommendedPlan.name, recommendedPlan.isapre_name, recommendedPlan.isapre_slug === 'consalud')} className="inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-white text-lg transition-all hover:-translate-y-0.5 shadow-lg" style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}>
                  <Heart className="w-5 h-5" /> Hablar con un Ejecutivo
                </button>
                <div>
                  <button onClick={resetFlow} className="inline-flex items-center gap-2 text-sm font-semibold text-[#14dcb4] hover:text-[#0f9d8a] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Volver a empezar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Empty results */}
          {step === 3 && !recommendedPlan && (
            <motion.div key="step3-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <p className="text-slate-500 mb-4">No encontramos resultados para tu perfil. Intenta cambiar los filtros.</p>
              <button onClick={resetFlow} className="inline-flex items-center gap-2 text-sm font-semibold text-[#14dcb4] hover:text-[#0f9d8a]">
                <ArrowLeft className="w-4 h-4" /> Volver a empezar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lead Capture Modal */}
        <AnimatePresence>
          {cotizarPlan && (
            <motion.div key="lead-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm px-4 py-6 flex items-center justify-center" onClick={() => { setCotizarPlan(null); setCotizarIsConsalud(false); setShowContactOptions(false); setShowLeadForm(false); }}>
              <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} transition={{ duration: 0.22 }} className="mx-auto w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-[32px] border border-white/50 bg-[#f8fafc] shadow-[0_40px_120px_rgba(15,81,75,0.28)]" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-white/10 bg-[linear-gradient(135deg,#0f514b,#16766d)] px-5 py-3 text-white">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.18em] text-[#14dcb4]">Cotización</span>
                    <span className="text-white/35">|</span>
                    <span className="truncate text-sm font-bold">{cotizarPlan.isapreName} · {cotizarPlan.name}</span>
                  </div>
                  <button onClick={() => { setCotizarPlan(null); setCotizarIsConsalud(false); setShowContactOptions(false); setShowLeadForm(false); }} className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5 md:p-6">
                  {showContactOptions && !showLeadForm && (
                    <div className="space-y-5">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-[#0f514b] mb-2">Conecta con un Ejecutivo {cotizarPlan.isapreName}</h3>
                        <p className="text-sm text-slate-500">Elige tu forma preferida de contacto</p>
                      </div>
                      <ContactOptions
                        isConsalud={cotizarIsConsalud}
                        planName={cotizarPlan.name}
                        isapreName={cotizarPlan.isapreName}
                        onChooseForm={() => { setShowContactOptions(false); setShowLeadForm(true); }}
                      />
                    </div>
                  )}
                  {showLeadForm && (
                    <LeadCaptureForm compact showHeader={false} onClose={() => { setCotizarPlan(null); setCotizarIsConsalud(false); setShowContactOptions(false); setShowLeadForm(false); }} contextPlan={cotizarPlan} />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}