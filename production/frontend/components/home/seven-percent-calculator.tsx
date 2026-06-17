'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMeta } from "@/lib/meta-context";
import {
  type Beneficiario,
  calcularSeptimoLegal,
  getFactor,
  getTotalFactor,
  serializeBeneficiarios,
} from "@/lib/factores";
import { track } from "@/lib/analytics";

const PRESETS = [
  { label: "$700K", value: 700_000 },
  { label: "$1M",   value: 1_000_000 },
  { label: "$1,5M", value: 1_500_000 },
  { label: "$2M",   value: 2_000_000 },
  { label: "$3M+",  value: 3_000_000 },
];

const GES_AVG_CLP = 28_000; // GES promedio por beneficiario (ver lib/factores.ts)
const MIN_BASE_CLP = 38_000; // plan más barato del mercado (base_plan_uf × UF, mayo 2026)

// Distribución calibrada con consultas reales al backend (mayo 2026).
// El backend filtra por price_clp = base_plan_uf × UF, así que `effectiveBudget`
// representa el cap sobre el precio base (no el precio mostrado al usuario).
function plansAvailableFor(effectiveBudget: number, maxPlans: number): number {
  if (effectiveBudget < 38_000)  return 0;
  if (effectiveBudget < 45_000)  return 5;
  if (effectiveBudget < 50_000)  return 35;
  if (effectiveBudget < 55_000)  return 102;
  if (effectiveBudget < 60_000)  return 166;
  if (effectiveBudget < 65_000)  return 241;
  if (effectiveBudget < 70_000)  return 326;
  if (effectiveBudget < 80_000)  return 509;
  if (effectiveBudget < 90_000)  return 683;
  if (effectiveBudget < 100_000) return 858;
  if (effectiveBudget < 115_000) return 1071;
  if (effectiveBudget < 130_000) return 1273;
  if (effectiveBudget < 150_000) return 1501;
  if (effectiveBudget < 175_000) return 1736;
  if (effectiveBudget < 200_000) return 1899;
  if (effectiveBudget < 250_000) return 2031;
  return maxPlans;
}

export default function SevenPercentCalculator() {
  const router = useRouter();
  const { plansTotal, ufValueCLP, topeImponibleUF } = useMeta();
  const [salary, setSalary] = useState(0);
  const [focused, setFocused] = useState(false);
  // El usuario es el cotizante. Solo guardamos su edad y la lista de cargas.
  const [userAge, setUserAge] = useState<number | null>(null);
  const [userAgeInput, setUserAgeInput] = useState('');
  const [userAgeError, setUserAgeError] = useState(false);
  const [cargas, setCargas] = useState<Beneficiario[]>([]);
  const [cargaInput, setCargaInput] = useState('');
  const [cargaError, setCargaError] = useState(false);

  // 7% legal con tope imponible aplicado (90 UF en 2026, valor vivo desde app_meta):
  // un sueldo sobre el tope cotiza solo hasta el tope, así el monto no se sobreestima.
  const { montoCLP: sevenPct, topeAplicado, topeCLP } = calcularSeptimoLegal(salary, ufValueCLP, topeImponibleUF);
  const inUF = sevenPct / ufValueCLP;

  // Construye el array completo de beneficiarios para serializar URL y calcular factor
  const beneficiarios = useMemo<Beneficiario[]>(() => {
    if (userAge == null) return [];
    return [{ id: 'cotizante', edad: userAge, tipo: 'cotizante' }, ...cargas];
  }, [userAge, cargas]);

  const totalFactor = useMemo(() => getTotalFactor(beneficiarios), [beneficiarios]);
  const N = beneficiarios.length;

  // Budget efectivo por unidad de factor (mismo cálculo que compare-body.tsx)
  const effectiveBudget = N > 0 && totalFactor > 0
    ? Math.max(0, (sevenPct - GES_AVG_CLP * N) / totalFactor)
    : sevenPct;

  const plansAvailable = useMemo(() => plansAvailableFor(effectiveBudget, plansTotal), [effectiveBudget, plansTotal]);
  const pct = Math.round((plansAvailable / plansTotal) * 100);

  // Si no alcanza ningún plan, calcular sueldo bruto sugerido para alcanzar el más barato
  const insufficientBudget = plansAvailable === 0 && salary > 0;
  const minDisplayedCLP = N > 0
    ? MIN_BASE_CLP * totalFactor + GES_AVG_CLP * N
    : MIN_BASE_CLP;
  const suggestedSalary = Math.ceil(minDisplayedCLP / 0.07 / 10_000) * 10_000;

  function commitUserAge(value: string) {
    const raw = value.trim();
    if (!raw) {
      setUserAge(null);
      setCargas([]); // sin cotizante no pueden existir cargas
      setUserAgeError(false);
      return;
    }
    const edad = parseInt(raw, 10);
    if (!Number.isFinite(edad) || edad < 0 || edad > 110) {
      setUserAgeError(true);
      return;
    }
    setUserAgeError(false);
    setUserAge(edad);
  }

  function addCarga() {
    const edad = parseInt(cargaInput, 10);
    if (!Number.isFinite(edad) || edad < 0 || edad > 110) {
      setCargaError(true);
      return;
    }
    setCargaError(false);
    setCargas((prev) => [
      ...prev,
      { id: `crg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, edad, tipo: 'carga' },
    ]);
    setCargaInput('');
  }

  function removeCarga(id: string) {
    setCargas((prev) => prev.filter((c) => c.id !== id));
  }

  function handleGoToComparar() {
    if (salary > 0) {
      track.calcUsed(salary, plansAvailable);
    }
    const params = new URLSearchParams();
    if (salary > 0) {
      params.set('sueldo_imponible_clp', String(salary));
      params.set('aplicar_tope_legal', 'true');
      // No setear precio_max_clp: el 7% es un marcador visual, no un filtro estricto.
      // El backend devuelve todos los planes y las cards marcan los que exceden el tope.
    }
    if (beneficiarios.length > 0) {
      params.set('ben', serializeBeneficiarios(beneficiarios));
    }
    const qs = params.toString();
    router.push(qs ? `/comparar/isapres?${qs}` : '/comparar/isapres');
  }

  const hasUserAge = userAge != null;

  return (
    <div className="relative rounded-3xl bg-white shadow-[0_30px_80px_-20px_rgba(9,46,42,0.55)] border border-white/40 overflow-hidden">
      <div className="absolute top-5 right-5 z-10">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14dcb4]/10 border border-[#14dcb4]/30 text-[10px] font-bold tracking-[0.14em] uppercase text-[#0f514b]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
          En vivo
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#0f514b]/55 mb-1.5">
          · Calculadora del 7% legal ·
        </div>
        <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0f514b] leading-[1.1] tracking-tight">
          ¿Cuánto puedes destinar a tu plan?
        </h3>
        <p className="text-[13px] text-[#5a6b6a] mt-1.5 leading-relaxed">
          La ley reserva el 7% de tu sueldo bruto para salud. Ingrésalo para ver todos los planes y cuánto pagarías de adicional si excedes tu tope.
        </p>

        <label className="block mt-5">
          <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-[#5a6b6a] mb-2 block">
            Tu sueldo bruto imponible
          </span>
          <div
            className={`relative flex items-center rounded-2xl border-2 transition-all ${
              focused
                ? "border-[#14dcb4] shadow-[0_0_0_4px_rgba(20,220,180,0.12)]"
                : "border-slate-200"
            }`}
          >
            <span className="absolute left-4 text-[18px] font-bold text-[#0f514b]/55 pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={salary ? salary.toLocaleString("es-CL") : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setSalary(raw ? Math.min(parseInt(raw, 10), 99_999_999) : 0);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Ingresa tu sueldo bruto"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-[20px] font-bold text-[#0f514b] bg-transparent focus:outline-none placeholder:text-slate-300 placeholder:font-normal placeholder:text-[15px]"
              aria-label="Sueldo bruto imponible"
            />
          </div>
        </label>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {PRESETS.map((p) => {
            const active = salary === p.value;
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => setSalary(p.value)}
                className={`text-[11.5px] font-semibold px-2.5 py-1.5 rounded-lg transition-all border ${
                  active
                    ? "bg-[#0f514b] text-white border-[#0f514b]"
                    : "bg-white text-[#5a6b6a] border-slate-200 hover:border-[#14dcb4] hover:text-[#0f514b]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Tu edad (cotizante) */}
        <label className="block mt-4">
          <span className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-[#5a6b6a] mb-2 block">
            Tu edad
          </span>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={userAgeInput}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
                setUserAgeInput(raw);
                if (userAgeError) setUserAgeError(false);
              }}
              onBlur={() => commitUserAge(userAgeInput)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
              placeholder="34"
              aria-label="Tu edad"
              className={`w-full px-4 pr-28 py-3 rounded-2xl border-2 text-[18px] font-bold text-[#0f514b] tabular-nums placeholder:text-slate-300 focus:outline-none focus:ring-4 transition-all ${
                userAgeError
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-200/40'
                  : 'border-slate-200 focus:border-[#14dcb4] focus:ring-[#14dcb4]/12'
              }`}
            />
            {hasUserAge && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-[#14dcb4]/15 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0f9d8a] tabular-nums">
                F {getFactor(userAge!, 'cotizante').toFixed(2)}
              </div>
            )}
          </div>
          {userAgeError && (
            <div className="mt-1 text-[11px] text-red-600 font-semibold">Edad inválida (0-110)</div>
          )}
        </label>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#14dcb4]/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#14dcb4]/85 mb-1.5">
              · Tu 7% disponible ·
            </div>
            {salary <= 0 ? (
              <div className="text-[14px] text-white/55 leading-relaxed py-2">
                Ingresa tu sueldo bruto arriba para calcular tu 7% legal y ver cuántos planes te calzan.
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-[36px] sm:text-[42px] font-extrabold tracking-tight tabular-nums leading-none">
                    ${sevenPct.toLocaleString("es-CL")}
                  </span>
                  <span className="text-[13px] font-medium text-white/55">/mes</span>
                </div>
                <div className="mt-1 text-[12.5px] text-white/65 tabular-nums">
                  ≈ <strong className="text-[#14dcb4] font-semibold">UF {inUF.toFixed(2)}</strong> al mes · UF ${ufValueCLP.toLocaleString("es-CL")}
                </div>
                {topeAplicado && (
                  <div className="mt-1.5 text-[11px] text-white/50 leading-snug">
                    Calculado sobre el tope imponible legal de salud
                    (${Math.round(topeCLP).toLocaleString("es-CL")} / {topeImponibleUF} UF).
                  </div>
                )}
              </>
            )}

            {salary > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              {insufficientBudget ? (
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-amber-300/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                  </div>
                  <div className="text-[12.5px] text-white/85 leading-relaxed">
                    Tu 7% no alcanza{cargas.length > 0 ? ` para tu grupo de ${N}` : hasUserAge ? '' : ' para ningún plan'}.
                    Necesitas un sueldo bruto de{' '}
                    <strong className="text-[#14dcb4] font-bold">${suggestedSalary.toLocaleString('es-CL')}</strong>{' '}
                    o más para acceder al plan más barato.
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-white/55">
                      Planes a tu alcance
                      {N > 1 && (
                        <span className="text-[#14dcb4]/85"> · grupo de {N}</span>
                      )}
                    </div>
                    <div className="text-[26px] font-extrabold text-[#14dcb4] tabular-nums leading-tight">
                      {plansAvailable.toLocaleString("es-CL")}{" "}
                      <span className="text-[13px] font-medium text-white/45">de {plansTotal.toLocaleString("es-CL")}</span>
                    </div>
                  </div>
                  <div className="hidden sm:block w-[80px]">
                    <div className="text-right text-[11px] font-semibold text-white/55 mb-1.5">{pct}%</div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#14dcb4] to-[#1ee5be] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </div>

        {/* Cargas (opcional) — solo disponible cuando hay edad del cotizante */}
        <div className={`mt-3.5 rounded-2xl border border-slate-200 p-3.5 ${!hasUserAge ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="text-[10.5px] font-bold tracking-[0.16em] uppercase text-[#5a6b6a]">
              Cargas{' '}
              <span className="text-slate-400 font-semibold normal-case tracking-normal">
                (opcional)
              </span>
            </div>
            {totalFactor > 0 && (
              <div className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#0f9d8a]">
                Factor {totalFactor.toFixed(2)}
              </div>
            )}
          </div>

          {!hasUserAge ? (
            <div className="text-[11.5px] text-slate-500 leading-relaxed">
              Ingresa tu edad arriba para poder agregar cargas (hijos, cónyuge, etc.).
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[1fr_auto] gap-1.5">
                <input
                  type="text"
                  inputMode="numeric"
                  value={cargaInput}
                  onChange={(e) => {
                    setCargaInput(e.target.value.replace(/\D/g, '').slice(0, 3));
                    if (cargaError) setCargaError(false);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCarga(); } }}
                  placeholder="Edad de la carga"
                  className={`rounded-lg border px-2.5 py-2 text-[13px] font-bold text-[#0f514b] tabular-nums focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300 ${
                    cargaError
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                      : 'border-slate-200 focus:border-[#14dcb4] focus:ring-[#14dcb4]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={addCarga}
                  disabled={!cargaInput}
                  className="rounded-lg px-3 py-2 text-[11.5px] font-bold bg-[#14dcb4]/15 hover:bg-[#14dcb4]/25 text-[#0f9d8a] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  + Carga
                </button>
              </div>

              {cargas.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {cargas.map((c) => {
                    const factor = getFactor(c.edad, 'carga');
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => removeCarga(c.id)}
                        title="Quitar"
                        className="inline-flex items-center gap-1.5 rounded-lg pl-2 pr-1.5 py-1 text-[11px] font-bold bg-[#14dcb4]/20 text-[#0f9d8a] hover:bg-[#14dcb4]/30 hover:-translate-y-px transition-all"
                      >
                        <span className="tabular-nums">{c.edad}</span>
                        <span className="text-[9.5px] font-extrabold uppercase tracking-[0.08em]">CRG</span>
                        <span className="text-[10px] opacity-65 tabular-nums">{factor.toFixed(1)}</span>
                        <svg className="w-3 h-3 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleGoToComparar}
          disabled={salary <= 0}
          className="mt-4 w-full px-5 py-4 rounded-2xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] font-bold text-[15px] shadow-[0_14px_30px_rgba(20,220,180,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
        >
          {salary <= 0
            ? 'Ingresa tu sueldo para continuar'
            : insufficientBudget
              ? 'Ver opciones cercanas (con adicional)'
              : plansAvailable > 0
                ? `Ver mis ${plansAvailable.toLocaleString('es-CL')} planes + opciones`
                : 'Ver todas las opciones'}
          <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        <a
          href="/comparar/isapres"
          className="block text-center mt-3 text-[12.5px] font-semibold text-[#5a6b6a] hover:text-[#0f514b] transition-colors no-underline"
        >
          Prefiero ver el catálogo completo →
        </a>
      </div>
    </div>
  );
}
