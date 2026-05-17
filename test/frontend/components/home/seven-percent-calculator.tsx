'use client';

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { STATS } from "@/lib/home-data";

const PRESETS = [
  { label: "$700K", value: 700_000 },
  { label: "$1M",   value: 1_000_000 },
  { label: "$1,5M", value: 1_500_000 },
  { label: "$2M",   value: 2_000_000 },
  { label: "$3M+",  value: 3_000_000 },
];

function plansAvailableFor(sevenPct: number): number {
  if (sevenPct < 25_000)  return 14;
  if (sevenPct < 45_000)  return 87;
  if (sevenPct < 70_000)  return 264;
  if (sevenPct < 95_000)  return 521;
  if (sevenPct < 130_000) return 842;
  if (sevenPct < 170_000) return 1147;
  if (sevenPct < 220_000) return 1452;
  if (sevenPct < 300_000) return 1689;
  return STATS.plansTotal;
}

export default function SevenPercentCalculator() {
  const router = useRouter();
  const [salary, setSalary] = useState(1_200_000);
  const [focused, setFocused] = useState(false);

  const sevenPct = Math.floor(salary * 0.07);
  const inUF = sevenPct / STATS.ufValueCLP;
  const plansAvailable = useMemo(() => plansAvailableFor(sevenPct), [sevenPct]);
  const pct = Math.round((plansAvailable / STATS.plansTotal) * 100);

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
          La ley reserva el 7% de tu sueldo bruto para salud. Ingrésalo y vemos cuántos planes te calzan.
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
              placeholder="950.000"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-[20px] font-bold text-[#0f514b] bg-transparent focus:outline-none placeholder:text-slate-300"
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

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#14dcb4]/15 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#14dcb4]/85 mb-1.5">
              · Tu 7% disponible ·
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-[36px] sm:text-[42px] font-extrabold tracking-tight tabular-nums leading-none">
                ${sevenPct.toLocaleString("es-CL")}
              </span>
              <span className="text-[13px] font-medium text-white/55">/mes</span>
            </div>
            <div className="mt-1 text-[12.5px] text-white/65 tabular-nums">
              ≈ <strong className="text-[#14dcb4] font-semibold">UF {inUF.toFixed(2)}</strong> al mes · UF ${STATS.ufValueCLP.toLocaleString("es-CL")}
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-baseline justify-between">
              <div>
                <div className="text-[10.5px] font-bold tracking-[0.18em] uppercase text-white/55">
                  Planes a tu alcance
                </div>
                <div className="text-[26px] font-extrabold text-[#14dcb4] tabular-nums leading-tight">
                  {plansAvailable.toLocaleString("es-CL")}{" "}
                  <span className="text-[13px] font-medium text-white/45">de {STATS.plansTotal.toLocaleString("es-CL")}</span>
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
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push("/comparar/isapres")}
          className="mt-4 w-full px-5 py-4 rounded-2xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] font-bold text-[15px] shadow-[0_14px_30px_rgba(20,220,180,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
        >
          Ver mis {plansAvailable.toLocaleString("es-CL")} planes disponibles
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
