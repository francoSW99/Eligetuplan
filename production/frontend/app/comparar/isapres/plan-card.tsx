'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Calculator, UserRound, Users } from 'lucide-react';
import type { Plan, Cobertura } from '@/lib/api';
import { formatCLP, formatUF } from '@/lib/api';
import { useMeta } from '@/lib/meta-context';
import { EDAD_PERFIL_POR_DEFECTO } from '@/lib/factores';
import {
  clinicasUnicas,
  colorCobertura,
  gruposPorPct,
  rangoCobertura,
  textoRango,
} from '@/lib/coberturas';

/** Precio mensual del plan para el perfil activo (fórmula tu7). */
export function precioPlanUF(plan: Plan, totalFactor: number, numBeneficiarios: number): number {
  const base = plan.base_plan_uf ?? plan.price_uf;
  const ges = plan.ges_isapre_uf ?? 0;
  return base * totalFactor + ges * numBeneficiarios;
}

/** Para quién es el precio que se muestra (lenguaje simple, sin "factor" ni "cotizante"). */
export function etiquetaPrecio(
  numBeneficiarios: number,
  perfilPorDefecto: boolean,
  edadTitular?: number | null,
): string {
  if (perfilPorDefecto) return `Ejemplo: 1 persona de ${EDAD_PERFIL_POR_DEFECTO} años`;
  if (numBeneficiarios === 1) return edadTitular != null ? `Para ti · ${edadTitular} años` : 'Para ti';
  return `Para tu familia · ${numBeneficiarios} personas`;
}

// ── Columna de cobertura con globo "+N clínicas" ─────────────────────────────
function CoberturaCol({
  title,
  data,
  align = 'left',
}: {
  title: string;
  data: Cobertura[];
  /** Hacia qué lado se abre el globo (la columna derecha abre hacia la izquierda). */
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const rango = rangoCobertura(data);
  if (!rango) {
    return (
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a6b6a]">{title}</span>
          <span className="text-[11.5px] text-[#5a6b6a]">Sin datos</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100" />
      </div>
    );
  }

  const { fg, bg } = colorCobertura(rango.max);
  const grupos = gruposPorPct(data);
  // Primero las clínicas con mejor cobertura.
  const ordenadas = grupos.flatMap((g) => g.clinicas).filter((c, i, arr) => arr.indexOf(c) === i);
  const total = clinicasUnicas(data).length;
  const visibles = ordenadas.slice(0, 2);
  const resto = total - visibles.length;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a6b6a] whitespace-nowrap">{title}</span>
        <span
          className="text-[12.5px] font-extrabold tabular-nums whitespace-nowrap rounded-md px-1.5 py-0.5"
          style={{ color: fg, background: bg }}
        >
          {textoRango(rango)}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: bg }}>
        <div className="h-full rounded-full" style={{ width: `${rango.max}%`, background: fg }} />
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {visibles.map((c) => (
          <span
            key={c}
            className="inline-block text-[10.5px] px-2 py-0.5 rounded-md bg-[#fbf8f3] border border-[#0f514b]/8 text-[#5a6b6a] font-medium"
          >
            {c}
          </span>
        ))}
        {resto > 0 && (
          <div
            ref={wrapRef}
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <button
              type="button"
              // Abrir (no alternar): con mouse el hover ya lo abrió y un toggle lo cerraría.
              // Se cierra al salir con el mouse, tocando fuera o con Escape.
              onClick={() => setOpen(true)}
              aria-expanded={open}
              className="pressable text-[10.5px] font-bold text-[#0f9d8a] underline underline-offset-2 decoration-[#14dcb4]/60 hover:text-[#0f514b] px-1 py-0.5"
            >
              +{resto} {resto === 1 ? 'clínica' : 'clínicas'}
            </button>
            {open && (
              <div
                role="tooltip"
                className={`pop-in absolute top-full mt-1.5 z-30 w-[min(300px,80vw)] rounded-xl bg-[#092e2a] text-white p-3.5 shadow-[0_18px_40px_-12px_rgba(9,46,42,0.6)] ${
                  align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
                }`}
              >
                <div className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#8ff0db] pb-2 mb-2 border-b border-white/10">
                  {title} · {total} {total === 1 ? 'clínica' : 'clínicas'}
                </div>
                <ul className="space-y-1.5">
                  {grupos.map((g) => (
                    <li key={g.pct} className="flex gap-2.5 text-[11.5px] leading-snug">
                      <span className="shrink-0 w-9 font-extrabold tabular-nums text-[#14dcb4]">{g.pct}%</span>
                      <span className="text-white/90">{g.clinicas.join(', ')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tarjeta ────────────────────────────────────────────────────────────────
export default function PlanCard({
  plan,
  onRequestPlan,
  onViewDetails,
  budgetCLP,
  totalFactor,
  numBeneficiarios,
  perfilPorDefecto,
  edadTitular,
  onEditProfile,
  comparando = false,
  compararLleno = false,
  onToggleComparar,
}: {
  plan: Plan;
  onRequestPlan: (plan: Plan) => void;
  onViewDetails: (plan: Plan) => void;
  budgetCLP?: number | null;
  /** Σ factores y N° de personas del perfil efectivo (el del usuario o el por defecto). */
  totalFactor: number;
  numBeneficiarios: number;
  perfilPorDefecto: boolean;
  edadTitular?: number | null;
  /** Lleva al formulario "Calcula tu precio". */
  onEditProfile?: () => void;
  /** Comparar hasta 3 planes. */
  comparando?: boolean;
  compararLleno?: boolean;
  onToggleComparar?: (plan: Plan) => void;
}) {
  const { ufValueCLP } = useMeta();
  const displayUf = precioPlanUF(plan, totalFactor, numBeneficiarios);
  const displayCLP = Math.round(displayUf * ufValueCLP);

  const diff = budgetCLP ? budgetCLP - displayCLP : null; // >0 sobra, <0 falta

  const logoSrc =
    plan.logo_url && plan.logo_url.startsWith('/')
      ? plan.logo_url
      : plan.logo_url || '/logos/placeholder.png';

  return (
    <article
      className={`relative bg-white rounded-2xl border transition-[box-shadow,border-color] duration-200 ease-[var(--ease-out)] hover:shadow-[0_18px_36px_-14px_rgba(15,81,75,0.2)] ${
        comparando ? 'border-[#14dcb4] shadow-[0_0_0_3px_rgba(20,220,180,0.18)]' : 'border-[#0f514b]/10 hover:border-[#14dcb4]/40'
      }`}
    >
      <div className="grid lg:grid-cols-[minmax(0,210px)_minmax(0,1fr)_minmax(0,228px)]">
        {/* Identidad del plan */}
        <div className="p-4 sm:p-5 lg:border-r border-[#0f514b]/8 flex flex-col gap-2 min-w-0">
          <div className="h-8 w-28 relative">
            <Image src={logoSrc} alt={plan.isapre_name} fill className="object-contain object-left" sizes="112px" />
          </div>
          <h3 className="font-bold text-[13px] sm:text-[13.5px] text-[#0f514b] uppercase leading-tight tracking-tight">
            {plan.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {plan.codigo_plan && (
              <span className="text-[10.5px] text-[#5a6b6a] font-mono break-all">{plan.codigo_plan}</span>
            )}
            {plan.modalidad && (
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md bg-[#14dcb4]/12 text-[#0f9d8a]">
                {plan.modalidad}
              </span>
            )}
            {plan.zona_nombre && (
              <span className="text-[9.5px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md bg-[#0f514b]/5 text-[#5a6b6a]">
                Zona {plan.zona_nombre}
              </span>
            )}
          </div>
          {onToggleComparar && (
            <label
              className={`tappable-row lg:mt-auto self-start inline-flex items-center gap-2 py-1.5 -my-0.5 pr-1 text-[12px] font-semibold ${
                !comparando && compararLleno ? 'text-slate-400 cursor-not-allowed' : 'text-[#5a6b6a] cursor-pointer hover:text-[#0f514b]'
              }`}
              title={!comparando && compararLleno ? 'Puedes comparar hasta 3 planes' : undefined}
            >
              <input
                type="checkbox"
                checked={comparando}
                disabled={!comparando && compararLleno}
                onChange={() => onToggleComparar(plan)}
                className="w-4 h-4 rounded accent-[#0f9d8a]"
              />
              Comparar
            </label>
          )}
        </div>

        {/* Coberturas */}
        <div className="px-4 sm:px-5 pb-4 lg:py-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 content-start">
          <CoberturaCol title="Hospitalaria" data={plan.hospitalaria} />
          <CoberturaCol title="Ambulatoria" data={plan.ambulatoria} align="right" />
        </div>

        {/* Precio + acciones: franja verde en celular, columna clara en escritorio */}
        <div className="rounded-b-2xl lg:rounded-bl-none lg:rounded-r-2xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] lg:bg-none lg:bg-[#fcfdfc] lg:border-l border-[#0f514b]/8 p-4 sm:p-5 flex flex-col gap-3 lg:text-center">
          {/* Para quién es el precio: va ANTES del número, así se lee primero.
              Gris = precio de ejemplo · verde = precio calculado para la persona. */}
          <div
            className={`self-start lg:self-stretch inline-flex items-center lg:justify-center gap-1.5 rounded-full lg:rounded-lg px-2.5 py-1 lg:py-1.5 text-[11px] font-bold leading-tight lg:text-center ${
              perfilPorDefecto
                ? 'bg-white/12 text-white lg:bg-[#0f514b]/7 lg:text-[#0f514b]'
                : 'bg-[#14dcb4]/25 text-white lg:bg-[#14dcb4]/15 lg:text-[#0b7f6e]'
            }`}
          >
            {perfilPorDefecto || numBeneficiarios === 1 ? (
              <UserRound className="w-3.5 h-3.5 shrink-0" aria-hidden />
            ) : (
              <Users className="w-3.5 h-3.5 shrink-0" aria-hidden />
            )}
            <span>{etiquetaPrecio(numBeneficiarios, perfilPorDefecto, edadTitular)}</span>
          </div>

          <div className="flex items-end justify-between gap-3 lg:flex-col lg:items-center lg:gap-1">
            <div className="min-w-0">
              <div className="text-[22px] sm:text-[24px] font-extrabold leading-tight tabular-nums tracking-tight text-white lg:text-[#0f514b]">
                UF {formatUF(displayUf)}
              </div>
              <div className="text-[12px] text-white/75 lg:text-[#5a6b6a] tabular-nums">
                {formatCLP(displayCLP)} <span className="opacity-70">/mes</span>
              </div>
            </div>
            {perfilPorDefecto && onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="pressable shrink-0 inline-flex items-center gap-1 text-[12px] font-bold underline underline-offset-2 text-[#8ff0db] hover:text-white lg:text-[#0f9d8a] lg:hover:text-[#0f514b]"
              >
                <Calculator className="w-3.5 h-3.5" aria-hidden />
                Calcular el mío
              </button>
            )}
          </div>

          {diff != null && (
            diff >= 0 ? (
              <div className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold leading-snug bg-[#14dcb4]/20 text-[#bdf5e7] lg:bg-[#14dcb4]/15 lg:text-[#0b7f6e]">
                {diff === 0 ? 'Te alcanza justo con tu 7%' : <>Te alcanza con tu 7% · te sobran {formatCLP(diff)}</>}
              </div>
            ) : (
              <div className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold leading-snug bg-amber-300/15 text-amber-200 lg:bg-amber-50 lg:text-amber-800 lg:border lg:border-amber-200">
                Pagas {formatCLP(-diff)} extra sobre tu 7%
              </div>
            )
          )}

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => onRequestPlan(plan)}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] font-extrabold text-[11.5px] shadow-[0_8px_18px_rgba(20,220,180,0.3)] pressable hover:-translate-y-0.5 uppercase tracking-[0.08em]"
            >
              Solicitar plan
            </button>
            <button
              type="button"
              onClick={() => onViewDetails(plan)}
              aria-label={`Ver detalle de ${plan.name}`}
              className="pressable px-3 py-2.5 rounded-xl border font-bold text-[11.5px] uppercase tracking-[0.08em] border-white/25 bg-white/10 text-white hover:bg-white/20 lg:border-[#0f514b]/15 lg:bg-white lg:text-[#0f514b] lg:hover:bg-[#0f514b]/[0.03] lg:hover:border-[#0f514b]/30"
            >
              Ver detalle
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
