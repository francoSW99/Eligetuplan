'use client';

import { useState, useMemo, type ReactNode } from "react";
import { Search, X } from "lucide-react";
import type { Isapre, Zona, PrestadorItem, PriceBucket, ConteoPresupuesto } from "@/lib/api";
import { formatCLP } from "@/lib/api";
import { buscarCiudades, ZONA_CIUDADES_EJEMPLO } from "@/lib/zonas-ciudades";

// ── Collapsible Group ──────────────────────────────────────────────────
export function FilterGroup({
  title,
  icon,
  activeCount = 0,
  help,
  children,
}: {
  title: string;
  icon: ReactNode;
  defaultOpen?: boolean; // legacy: ya no se usa — los grupos siempre están expandidos
  activeCount?: number;
  /** Explicación en lenguaje simple ("¿Para qué sirve?"), se abre con el botón "?". */
  help?: ReactNode;
  children: ReactNode;
}) {
  const [verAyuda, setVerAyuda] = useState(false);
  // No-colapsable: las opciones SIEMPRE se ven (sin desplegar). El header es solo
  // un rótulo (icono + título + conteo) y, si hay, el botón de ayuda.
  return (
    <div className="bg-white rounded-2xl border border-[#0f514b]/10 overflow-hidden">
      <div className="w-full px-4 py-3 flex items-center gap-3">
        <div
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            activeCount > 0 ? "bg-[#14dcb4] text-[#0f514b]" : "bg-[#0f514b]/5 text-[#0f514b]"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-[#0f514b] leading-tight">{title}</div>
          {activeCount > 0 && (
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[#0f9d8a] mt-0.5">
              {activeCount} {activeCount === 1 ? "filtro activo" : "filtros activos"}
            </div>
          )}
        </div>
        {help && (
          <button
            type="button"
            onClick={() => setVerAyuda((v) => !v)}
            aria-expanded={verAyuda}
            aria-label={`¿Para qué sirve ${title}?`}
            className={`pressable shrink-0 w-6 h-6 rounded-full border-[1.5px] text-[11px] font-extrabold grid place-items-center ${
              verAyuda ? "bg-[#0f9d8a] border-[#0f9d8a] text-white" : "border-[#0f9d8a] text-[#0f9d8a] hover:bg-[#14dcb4]/10"
            }`}
          >
            ?
          </button>
        )}
      </div>
      {help && verAyuda && (
        <div className="pop-in origin-top-right mx-4 mb-3 rounded-xl bg-[#092e2a] text-white/90 px-3.5 py-3 text-[12px] leading-relaxed">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8ff0db] mb-1">¿Para qué sirve?</div>
          {help}
        </div>
      )}
      <div className="px-4 pb-4 pt-1 border-t border-[#0f514b]/8">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

// ── Presupuesto: histograma + línea del 7% + "Me alcanza / Pago extra" ────────
export function PresupuestoBlock({
  histogram,
  floor,
  ceiling,
  min,
  max,
  setMin,
  setMax,
  onCommit,
  budgetCLP,
  conteo,
  enPresupuesto,
  onEnPresupuesto,
}: {
  histogram: PriceBucket[];
  floor: number;
  ceiling: number;
  min: number;
  max: number;
  setMin: (v: number) => void;
  setMax: (v: number) => void;
  onCommit: () => void;
  budgetCLP: number | null;
  conteo: ConteoPresupuesto | null | undefined;
  enPresupuesto: "si" | "no" | null;
  onEnPresupuesto: (v: "si" | "no" | null) => void;
}) {
  const rango = Math.max(ceiling - floor, 1);
  const maxCount = Math.max(1, ...histogram.map((b) => b.count));
  const marcaPct = budgetCLP ? Math.min(100, Math.max(0, ((budgetCLP - floor) / rango) * 100)) : null;
  // Barras en color = lo que se está mostrando (rango del slider y, si se eligió, "Me alcanza" / "Pago extra").
  const desde = enPresupuesto === "no" && budgetCLP ? Math.max(min, budgetCLP) : min;
  const hasta = enPresupuesto === "si" && budgetCLP ? Math.min(max, budgetCLP) : max;

  return (
    <div className="space-y-3">
      {histogram.length > 0 && (
        <div className="relative pt-4" aria-hidden>
          {marcaPct != null && (
            <div className="absolute top-0 bottom-0 w-[2px] bg-[#0f514b] z-10" style={{ left: `${marcaPct}%` }}>
              <span
                className={`absolute -top-0.5 whitespace-nowrap text-[9.5px] font-extrabold text-[#0f514b] ${
                  marcaPct > 60 ? "right-1.5" : "left-1.5"
                }`}
              >
                Tu 7%
              </span>
            </div>
          )}
          <div className="flex items-end gap-[2px] h-14">
            {histogram.map((b, i) => {
              const centro = (b.min_clp + b.max_clp) / 2;
              const enRango = centro >= desde && centro <= hasta;
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t-[3px]"
                  style={{
                    height: `${b.count > 0 ? Math.max(6, (b.count / maxCount) * 100) : 0}%`,
                    background: enRango ? "linear-gradient(180deg,#14dcb4,#0f9d8a)" : "#e2e8e6",
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      <PriceRange min={min} max={max} floor={floor} ceiling={ceiling} setMin={setMin} setMax={setMax} onCommit={onCommit} />

      {budgetCLP ? (
        <>
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#0f514b]/5 p-1" role="radiogroup" aria-label="Planes según tu 7%">
            {(
              [
                { v: null, label: "Todos", n: conteo?.todos },
                { v: "si", label: "Me alcanza", n: conteo?.dentro },
                { v: "no", label: "Pago extra", n: conteo?.fuera },
              ] as const
            ).map((o) => (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={enPresupuesto === o.v}
                onClick={() => onEnPresupuesto(o.v)}
                className={`pressable rounded-lg px-1 py-1.5 text-[11px] font-bold leading-tight ${
                  enPresupuesto === o.v ? "bg-white text-[#0f514b] shadow-sm" : "text-[#5a6b6a] hover:text-[#0f514b]"
                }`}
              >
                {o.label}
                {o.n != null && <span className="block text-[10.5px] font-semibold tabular-nums">{o.n.toLocaleString("es-CL")}</span>}
              </button>
            ))}
          </div>
          {conteo && (
            <p className="text-[11.5px] leading-snug text-[#5a6b6a]">
              Tu 7% ({formatCLP(budgetCLP)}) alcanza para{" "}
              <strong className="text-[#0f514b]">
                {conteo.dentro.toLocaleString("es-CL")} de {conteo.todos.toLocaleString("es-CL")}
              </strong>{" "}
              planes. En el resto te mostramos cuánto pagarías extra.
            </p>
          )}
        </>
      ) : (
        <p className="text-[11.5px] leading-snug text-[#5a6b6a]">
          Escribe tu sueldo en <strong className="text-[#0f514b]">Tu perfil</strong> (arriba) y te mostramos qué planes te
          alcanzan con tu 7%.
        </p>
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
  // Desde 40%: muchos planes tienen 40–50% y antes no se podían elegir.
  const marks = [40, 50, 60, 70, 80, 90, 100];
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
          className={`pressable text-[11px] font-bold py-1.5 px-2.5 rounded-md border ${
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
            className={`pressable text-[11px] font-bold py-1.5 flex-1 min-w-[44px] rounded-md border ${
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
              <label className="relative flex items-center justify-between gap-2 tappable-row cursor-pointer py-2 lg:py-1 px-2 rounded-lg hover:bg-[#14dcb4]/[0.05] active:bg-[#14dcb4]/[0.1] transition-colors duration-150">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-[background-color,border-color] duration-150 ${
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
  const [cityQuery, setCityQuery] = useState("");
  const zonaNombre = (id: number) => zonas.find((z) => z.id === id)?.nombre ?? `Zona ${id}`;
  const matches = useMemo(() => buscarCiudades(cityQuery), [cityQuery]);

  return (
    <div>
      {/* Buscador por ciudad/comuna: muchos saben su ciudad, no su "zona" */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6b6a] pointer-events-none" />
        <input
          type="text"
          value={cityQuery}
          onChange={(e) => setCityQuery(e.target.value)}
          placeholder="¿En qué ciudad o comuna vives?"
          className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/15 text-[13px] text-[#0f514b] placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150"
        />
        {cityQuery && (
          <button
            type="button"
            onClick={() => setCityQuery("")}
            className="pressable absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#5a6b6a]"
            aria-label="Limpiar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sugerencias en flujo (no dropdown absoluto → no se recorta dentro del sidebar) */}
      {cityQuery.trim() && (
        <div className="mt-2 rounded-xl border border-slate-200 bg-[#fbf8f3]/60 overflow-hidden">
          {matches.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {matches.map((m) => {
                const checked = selected.includes(String(m.zonaId));
                return (
                  <li key={`${m.ciudad}-${m.zonaId}`}>
                    <button
                      type="button"
                      onClick={() => { toggle(m.zonaId); setCityQuery(""); }}
                      className="tappable-row w-full px-3 py-2 flex items-center justify-between gap-2 text-left hover:bg-[#14dcb4]/[0.08] transition-colors"
                    >
                      <span className="text-[13px] font-semibold text-[#0f514b]">{m.ciudad}</span>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.06em] text-[#0f9d8a]">
                        {checked ? "✓ " : "→ "}{zonaNombre(m.zonaId)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-3 py-2.5 text-[12px] text-[#5a6b6a] leading-snug">
              No encontramos esa ciudad. Elige tu zona en la lista de abajo.
            </div>
          )}
        </div>
      )}

      <div className="flex items-baseline justify-between mt-3 mb-2">
        <span className="text-[12px] font-bold text-[#0f514b]">O elige tu zona</span>
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
          const ejemplo = ZONA_CIUDADES_EJEMPLO[z.id];
          return (
            <li key={z.id}>
              <label className="relative flex items-center justify-between gap-2 tappable-row cursor-pointer py-2 lg:py-1.5 px-2 rounded-lg hover:bg-[#14dcb4]/[0.05] active:bg-[#14dcb4]/[0.1] transition-colors duration-150">
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`shrink-0 mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center transition-[background-color,border-color] duration-150 ${
                      checked ? "bg-[#14dcb4] border-[#14dcb4]" : "border-slate-300 bg-white"
                    }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-[#0f514b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggle(z.id)} className="sr-only" />
                  <span className="min-w-0">
                    <span className={`block text-[13px] leading-tight transition-colors ${checked ? "text-[#0f514b] font-semibold" : "text-[#1e2a2a]"}`}>
                      {z.nombre}
                    </span>
                    {ejemplo && (
                      <span className="block text-[10.5px] text-[#5a6b6a] leading-tight mt-0.5">{ejemplo}</span>
                    )}
                  </span>
                </div>
                <span
                  className={`shrink-0 self-start text-[10.5px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
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
      <p className="text-[12px] text-[#5a6b6a] leading-snug mb-2.5">
        Cómo accedes a las clínicas: <strong className="text-[#0f514b]">Libre Elección</strong> (cualquiera),{" "}
        <strong className="text-[#0f514b]">Preferente</strong> (mejor precio en su red) o{" "}
        <strong className="text-[#0f514b]">Cerrado</strong> (solo su red).
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onChange("")}
          className={`pressable text-[11.5px] font-semibold py-2 rounded-lg border ${
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
            className={`pressable text-[11.5px] font-semibold py-2 rounded-lg border ${
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
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/15 text-[13px] text-[#0f514b] placeholder:text-slate-400 transition-[border-color,box-shadow] duration-150"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="pressable absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#5a6b6a]"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <ul className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
        {visible.map((c) => {
          const checked = selected.includes(c.id);
          return (
            <li key={c.id}>
              <label className="relative flex items-start gap-2 tappable-row cursor-pointer py-2 lg:py-1.5 px-2 rounded-lg hover:bg-[#14dcb4]/[0.05] active:bg-[#14dcb4]/[0.1] transition-colors duration-150">
                <span
                  className={`shrink-0 w-4 h-4 mt-0.5 rounded border-2 flex items-center justify-center transition-[background-color,border-color] duration-150 ${
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
                <div className="flex-1 min-w-0">
                  <span
                    className={`block text-[13px] leading-snug transition-colors break-words ${
                      checked ? "text-[#0f514b] font-semibold" : "text-[#1e2a2a]"
                    }`}
                  >
                    {c.name}
                  </span>
                  {c.zonas && c.zonas.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-0.5">
                      {c.zonas.map((z) => (
                        <span
                          key={z}
                          className="text-[9.5px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md bg-[#0f514b]/5 text-[#5a6b6a]"
                        >
                          {ZONA_LABELS[z] || z}
                        </span>
                      ))}
                    </div>
                  )}
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
          className="pressable text-[11px] font-semibold text-[#0f9d8a] hover:underline"
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
                className="pressable inline-flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-lg bg-[#14dcb4]/15 text-[#0f9d8a] hover:bg-[#14dcb4]/25"
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
