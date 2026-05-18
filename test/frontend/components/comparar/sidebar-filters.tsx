'use client';

import { useState, useMemo, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import type { Isapre, Zona, PrestadorItem } from "@/lib/api";
import { formatCLP } from "@/lib/api";
import { STATS } from "@/lib/home-data";

const UF_VALUE_CLP = STATS.ufValueCLP;

function formatUF2(n: number) {
  return n.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Collapsible Group ──────────────────────────────────────────────────
export function FilterGroup({
  title,
  icon,
  defaultOpen = true,
  activeCount = 0,
  children,
}: {
  title: string;
  icon: ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-[#0f514b]/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 group hover:bg-[#14dcb4]/[0.03] transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 text-left">
          <div
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              activeCount > 0 ? "bg-[#14dcb4] text-[#0f514b]" : "bg-[#0f514b]/5 text-[#0f514b]"
            }`}
          >
            {icon}
          </div>
          <div>
            <div className="text-[14px] font-bold text-[#0f514b] leading-tight">{title}</div>
            {activeCount > 0 && (
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#0f9d8a] mt-0.5">
                {activeCount} {activeCount === 1 ? "filtro activo" : "filtros activos"}
              </div>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-[#5a6b6a] transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[#0f514b]/8">
          <div className="space-y-4">{children}</div>
        </div>
      )}
    </div>
  );
}

// ── 7% Block ───────────────────────────────────────────────────────────
export function SevenPercentBlock({
  salaryInput,
  setSalaryInput,
  applyBudget,
  clearBudget,
  active,
  total,
}: {
  salaryInput: string;
  setSalaryInput: (v: string) => void;
  applyBudget: () => void;
  clearBudget: () => void;
  active: boolean;
  total: number;
}) {
  const salary = salaryInput ? parseInt(salaryInput, 10) : 0;
  const sevenPct = salary > 0 ? Math.floor(salary * 0.07) : 0;
  const uf = sevenPct / UF_VALUE_CLP;

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-[#5a6b6a] leading-relaxed">
        Ingresa tu sueldo bruto y filtramos solo los planes que tu{" "}
        <strong className="text-[#0f514b] font-bold">7% legal</strong> puede pagar.
      </p>

      <div>
        <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1.5 block">
          Sueldo bruto imponible
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[#0f514b]/55 pointer-events-none">
            $
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={salaryInput ? parseInt(salaryInput, 10).toLocaleString("es-CL") : ""}
            onChange={(e) => setSalaryInput(e.target.value.replace(/\D/g, ""))}
            placeholder="950.000"
            className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/15 text-[15px] font-bold text-[#0f514b] placeholder:text-slate-300 transition-all"
          />
        </div>
      </div>

      {sevenPct > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] p-3.5 text-white relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-[#14dcb4]/15 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#14dcb4]/85 mb-1">
              Tu 7% disponible
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[24px] font-extrabold tabular-nums leading-none">{formatCLP(sevenPct)}</span>
              <span className="text-[11px] text-white/55">/mes</span>
            </div>
            <div className="text-[11px] text-white/65 mt-0.5 tabular-nums">
              ≈ <strong className="text-[#14dcb4]">UF {formatUF2(uf)}</strong>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!sevenPct}
        onClick={applyBudget}
        className="w-full px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f514b] font-bold text-[13px] shadow-[0_8px_20px_rgba(20,220,180,0.3)] disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all"
      >
        {active ? "Actualizar filtro 7%" : "Filtrar por mi 7%"}
      </button>

      {active && (
        <div className="rounded-xl border border-[#14dcb4]/30 bg-[#14dcb4]/8 p-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0f514b]/70 mb-0.5">
            Con tu 7% puedes optar a
          </div>
          <div className="text-[22px] font-extrabold text-[#0f514b] tabular-nums leading-none">
            {total.toLocaleString("es-CL")}
          </div>
          <div className="text-[10.5px] text-[#5a6b6a] mt-1">planes vigentes</div>
          <button
            type="button"
            onClick={clearBudget}
            className="mt-2 text-[11px] font-semibold text-[#0f9d8a] hover:underline"
          >
            Quitar filtro
          </button>
        </div>
      )}
    </div>
  );
}

// ── Price Range ────────────────────────────────────────────────────────
export function PriceRange({
  min,
  max,
  floor,
  ceiling,
  setMin,
  setMax,
  onCommit,
}: {
  min: number;
  max: number;
  floor: number;
  ceiling: number;
  setMin: (v: number) => void;
  setMax: (v: number) => void;
  onCommit: () => void;
}) {
  const range = Math.max(ceiling - floor, 1);
  const minPct = ((min - floor) / range) * 100;
  const maxPct = ((max - floor) / range) * 100;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-[#0f514b]/10 bg-[#fbf8f3] px-3 py-2 text-center">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-0.5">Desde</div>
          <div className="text-[14px] font-extrabold text-[#0f514b] tabular-nums leading-none">{formatCLP(min)}</div>
        </div>
        <div className="rounded-xl border border-[#0f514b]/10 bg-[#fbf8f3] px-3 py-2 text-center">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-0.5">Hasta</div>
          <div className="text-[14px] font-extrabold text-[#0f514b] tabular-nums leading-none">{formatCLP(max)}</div>
        </div>
      </div>

      <div className="relative py-3 px-1">
        <div className="absolute left-1 right-1 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#14dcb4]/15" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#14dcb4] to-[#0f9d8a]"
          style={{ left: `calc(${minPct}% + 4px)`, right: `calc(${100 - maxPct}% + 4px)` }}
        />
        <input
          type="range"
          min={floor}
          max={ceiling}
          step={1000}
          value={min}
          onChange={(e) => setMin(Math.min(+e.target.value, max - 1000))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          className="price-range-input"
          aria-label="Precio mínimo"
        />
        <input
          type="range"
          min={floor}
          max={ceiling}
          step={1000}
          value={max}
          onChange={(e) => setMax(Math.max(+e.target.value, min + 1000))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          className="price-range-input"
          aria-label="Precio máximo"
        />
      </div>
      <div className="flex justify-between text-[10.5px] font-semibold text-[#5a6b6a] tabular-nums">
        <span>Min: {formatCLP(floor)}</span>
        <span>Max: {formatCLP(ceiling)}</span>
      </div>
    </div>
  );
}

// ── Coverage Stepper ───────────────────────────────────────────────────
export function CoverageStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const marks = [50, 60, 70, 80, 90, 100];
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] font-bold text-[#0f514b]">{label}</span>
        <span className="text-[14px] font-extrabold text-[#0f514b] tabular-nums">
          {value ? `≥ ${value}%` : "Cualquiera"}
        </span>
      </div>
      <div className="flex gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`text-[11px] font-bold py-1.5 px-2.5 rounded-md border transition-all ${
            value === null
              ? "bg-[#0f514b] text-white border-[#0f514b]"
              : "border-slate-200 text-[#5a6b6a] hover:border-[#14dcb4] hover:text-[#0f514b]"
          }`}
        >
          Todos
        </button>
        {marks.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => onChange(pct)}
            className={`text-[11px] font-bold py-1.5 flex-1 min-w-[44px] rounded-md border transition-all ${
              value === pct
                ? "bg-[#0f514b] text-white border-[#0f514b]"
                : "border-slate-200 text-[#5a6b6a] hover:border-[#14dcb4] hover:text-[#0f514b]"
            }`}
          >
            {pct}%
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Isapres Filter ─────────────────────────────────────────────────────
export function IsapresFilter({
  isapres,
  selected,
  toggle,
}: {
  isapres: Isapre[];
  selected: string[];
  toggle: (slug: string) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] font-bold text-[#0f514b]">Isapres</span>
        {selected.length === 0 ? (
          <span className="text-[10.5px] text-[#5a6b6a] italic">Todas mostradas</span>
        ) : (
          <span className="text-[11px] font-bold text-[#0f9d8a]">
            {selected.length} {selected.length === 1 ? "sel." : "sels."}
          </span>
        )}
      </div>
      <ul className="space-y-1.5">
        {isapres.map((i) => {
          const slug = i.slug ?? "";
          const checked = selected.includes(slug);
          return (
            <li key={i.id}>
              <label className="flex items-center justify-between gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#14dcb4]/[0.05] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      checked ? "bg-[#14dcb4] border-[#14dcb4]" : "border-slate-300 bg-white"
                    }`}
                  >
                    {checked && (
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
                  <input type="checkbox" checked={checked} onChange={() => toggle(slug)} className="sr-only" />
                  <span
                    className={`text-[13px] truncate transition-colors ${
                      checked ? "text-[#0f514b] font-semibold" : "text-[#1e2a2a]"
                    }`}
                  >
                    {i.name}
                  </span>
                </div>
                <span
                  className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                    checked ? "bg-[#14dcb4]/15 text-[#0f9d8a]" : "bg-[#0f514b]/5 text-[#5a6b6a]"
                  }`}
                >
                  {i.plan_count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Zonas Filter ───────────────────────────────────────────────────────
export function ZonasFilter({
  zonas,
  selected,
  toggle,
}: {
  zonas: Zona[];
  selected: string[];
  toggle: (id: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[12px] font-bold text-[#0f514b]">Zonas</span>
        {selected.length === 0 ? (
          <span className="text-[10.5px] text-[#5a6b6a] italic">Todas mostradas</span>
        ) : (
          <span className="text-[11px] font-bold text-[#0f9d8a]">
            {selected.length} {selected.length === 1 ? "sel." : "sels."}
          </span>
        )}
      </div>
      <ul className="space-y-1.5">
        {zonas.map((z) => {
          const checked = selected.includes(String(z.id));
          return (
            <li key={z.id}>
              <label className="flex items-center justify-between gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#14dcb4]/[0.05] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      checked ? "bg-[#14dcb4] border-[#14dcb4]" : "border-slate-300 bg-white"
                    }`}
                  >
                    {checked && (
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
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(z.id)}
                    className="sr-only"
                  />
                  <span
                    className={`text-[13px] truncate transition-colors ${
                      checked ? "text-[#0f514b] font-semibold" : "text-[#1e2a2a]"
                    }`}
                  >
                    {z.nombre}
                  </span>
                </div>
                <span
                  className={`text-[10.5px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                    checked ? "bg-[#14dcb4]/15 text-[#0f9d8a]" : "bg-[#0f514b]/5 text-[#5a6b6a]"
                  }`}
                >
                  {z.plan_count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Modalidad Filter ───────────────────────────────────────────────────
export function ModalidadFilter({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="text-[12px] font-bold text-[#0f514b] mb-2">Modalidad</div>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`text-[11.5px] font-semibold py-2 rounded-lg border transition-all ${
            !value
              ? "bg-[#0f514b] text-white border-[#0f514b]"
              : "border-slate-200 text-[#5a6b6a] hover:border-[#14dcb4] hover:text-[#0f514b]"
          }`}
        >
          Todas
        </button>
        {options.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`text-[11.5px] font-semibold py-2 rounded-lg border transition-all ${
              value === m
                ? "bg-[#0f514b] text-white border-[#0f514b]"
                : "border-slate-200 text-[#5a6b6a] hover:border-[#14dcb4] hover:text-[#0f514b]"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Clinicas Filter ─────────────────────────────────────────────────────
const ZONA_LABELS: Record<number, string> = {
  1: "Norte",
  3: "Octava",
  4: "Quinta",
  5: "RM",
  6: "Sur",
  8: "Regional",
  9: "Centro",
};

export function ClinicasFilter({
  clinicas,
  selected,
  toggle,
  activeCount,
}: {
  clinicas: PrestadorItem[];
  selected: string[];
  toggle: (id: string) => void;
  activeCount: number;
}) {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return clinicas;
    const q = search.toLowerCase();
    return clinicas.filter((c) => c.name.toLowerCase().includes(q));
  }, [clinicas, search]);

  const visible = showAll ? filtered : filtered.slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b6a] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar clínica u hospital..."
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/15 text-[13px] text-[#0f514b] placeholder:text-slate-400 transition-all"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#5a6b6a] transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <ul className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1">
        {visible.map((c) => {
          const checked = selected.includes(c.id);
          return (
            <li key={c.id}>
              <label className="flex items-center justify-between gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-[#14dcb4]/[0.05] transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                      checked ? "bg-[#14dcb4] border-[#14dcb4]" : "border-slate-300 bg-white"
                    }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-[#0f514b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggle(c.id)} className="sr-only" />
                  <span
                    className={`text-[13px] truncate transition-colors ${
                      checked ? "text-[#0f514b] font-semibold" : "text-[#1e2a2a]"
                    }`}
                  >
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.zonas &&
                    c.zonas.map((z) => (
                      <span
                        key={z}
                        className="text-[9.5px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md bg-[#0f514b]/5 text-[#5a6b6a]"
                      >
                        {ZONA_LABELS[z] || z}
                      </span>
                    ))}
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {filtered.length > 8 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-[11px] font-semibold text-[#0f9d8a] hover:underline"
        >
          {showAll ? "Ver menos" : `Ver todas (${filtered.length})`}
        </button>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const c = clinicas.find((cl) => cl.id === id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-lg bg-[#14dcb4]/15 text-[#0f9d8a] hover:bg-[#14dcb4]/25 transition-colors"
              >
                {c?.name ?? id}
                <X className="w-3 h-3" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
