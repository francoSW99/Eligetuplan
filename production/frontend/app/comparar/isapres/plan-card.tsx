'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Plan, Cobertura } from '@/lib/api';
import { formatCLP, formatUF } from '@/lib/api';
import { useMeta } from '@/lib/meta-context';

function coverageColor(pct: number) {
  if (pct < 60) return { fg: '#c8401a', bg: 'rgba(200,64,26,0.10)' };
  if (pct < 80) return { fg: '#d97706', bg: 'rgba(217,119,6,0.10)' };
  return { fg: '#14dcb4', bg: 'rgba(20,220,180,0.10)' };
}

function flatClinicas(data: Cobertura[]): string[] {
  if (!data || data.length === 0) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of data) {
    for (const clin of c.clinicas) {
      if (!seen.has(clin)) {
        seen.add(clin);
        out.push(clin);
      }
    }
  }
  return out;
}

function CoverageBlock({
  title,
  data,
  expanded,
}: {
  title: string;
  data: Cobertura[];
  expanded: boolean;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[#0f514b]/8 bg-[#fbf8f3]/60 p-3.5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a6b6a]">{title}</span>
          <span className="text-[12px] text-[#5a6b6a]">No disponible</span>
        </div>
      </div>
    );
  }

  const pct = data[0].pct;
  const { fg, bg } = coverageColor(pct);
  const clinicas = flatClinicas(data);
  const visibles = expanded ? clinicas : clinicas.slice(0, 2);

  return (
    <div className="rounded-xl border border-[#0f514b]/8 bg-[#fbf8f3]/60 p-3.5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a6b6a]">{title}</span>
        <span className="text-[15px] font-extrabold tabular-nums" style={{ color: fg }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden mb-2.5" style={{ background: bg }}>
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: fg }}
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {visibles.map((c) => (
          <span
            key={c}
            className="inline-block text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-[#0f514b]/8 text-[#5a6b6a] font-medium"
          >
            {c}
          </span>
        ))}
        {!expanded && clinicas.length > 2 && (
          <span className="inline-block text-[10.5px] px-2 py-0.5 rounded-md text-[#0f9d8a] font-bold">
            +{clinicas.length - 2}
          </span>
        )}
      </div>
    </div>
  );
}

export default function PlanCard({
  plan,
  onRequestPlan,
  onViewDetails,
  budgetCLP,
  totalFactor = 0,
  numBeneficiarios = 0,
}: {
  plan: Plan;
  onRequestPlan: (plan: Plan) => void;
  onViewDetails: (plan: Plan) => void;
  budgetCLP?: number | null;
  totalFactor?: number;
  numBeneficiarios?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { ufValueCLP } = useMeta();
  const hasFactor = numBeneficiarios > 0;
  const baseUf = plan.base_plan_uf ?? plan.price_uf;
  const gesUf = plan.ges_isapre_uf ?? 0;
  // Fórmula exacta tu7: precio = BASE_PLAN × Σ factores + GES × N° beneficiarios
  const displayUf = hasFactor
    ? baseUf * totalFactor + gesUf * numBeneficiarios
    : plan.price_uf;
  const displayCLP = hasFactor
    ? Math.round(displayUf * ufValueCLP)
    : plan.price_clp;
  const fits = !budgetCLP || (displayCLP != null && displayCLP <= budgetCLP);
  const adicionalCLP =
    budgetCLP && displayCLP != null && displayCLP > budgetCLP
      ? displayCLP - budgetCLP
      : 0;
  const totalClinicas =
    flatClinicas(plan.hospitalaria).length + flatClinicas(plan.ambulatoria).length;

  const logoSrc =
    plan.logo_url && plan.logo_url.startsWith('/')
      ? plan.logo_url
      : plan.logo_url || '/logos/placeholder.png';

  return (
    <article
      className={`relative bg-white rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(15,81,75,0.18)] ${
        fits ? 'border-[#0f514b]/10 hover:border-[#14dcb4]/40' : 'border-slate-200/60 opacity-75'
      }`}
    >
      {!fits && budgetCLP && (
        <div className="absolute -top-2.5 right-5 px-2.5 py-1 rounded-full text-[10.5px] font-bold tracking-[0.12em] uppercase bg-amber-100 text-amber-800 border border-amber-200 shadow-sm z-10">
          Fuera de tu 7%
        </div>
      )}

      <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-3.5 sm:gap-4 h-full">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="h-9 sm:h-10 w-24 sm:w-28 mb-2 sm:mb-2.5 relative">
              <Image
                src={logoSrc}
                alt={plan.isapre_name}
                fill
                className="object-contain object-left"
                sizes="112px"
              />
            </div>
            <h3 className="font-bold text-[13px] sm:text-[14px] text-[#0f514b] uppercase leading-tight mb-1 tracking-tight">
              {plan.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {plan.codigo_plan && (
                <span className="text-[10.5px] text-[#5a6b6a] font-mono break-all">{plan.codigo_plan}</span>
              )}
              {plan.modalidad && (
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-md bg-[#14dcb4]/12 text-[#0f9d8a]">
                  {plan.modalidad}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 text-right">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-0.5">
              {hasFactor ? `Tu precio (${numBeneficiarios} ben.)` : 'Precio base'}
            </div>
            <div className={`text-[18px] sm:text-[22px] font-extrabold leading-none tabular-nums tracking-tight ${hasFactor ? 'text-[#0f9d8a]' : 'text-[#0f514b]'}`}>
              UF {formatUF(displayUf)}
            </div>
            <div className="text-[11px] sm:text-[12px] text-[#5a6b6a] mt-1 tabular-nums">
              {formatCLP(displayCLP)} <span className="text-[#5a6b6a]/65">/mes</span>
            </div>
            {hasFactor && (
              <div className="text-[9.5px] text-[#5a6b6a]/70 mt-0.5 tabular-nums">
                Base {formatUF(baseUf)} × {totalFactor.toFixed(2)} + GES {formatUF(gesUf)} × {numBeneficiarios}
              </div>
            )}
          </div>
        </div>

        {adicionalCLP > 0 && (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <svg className="w-3.5 h-3.5 shrink-0 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[11px] font-semibold text-amber-900 truncate">
                Pagas <strong className="font-extrabold">{formatCLP(adicionalCLP)}</strong> extra sobre tu 7%
              </span>
            </div>
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700/80">
              /mes
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
          <CoverageBlock title="Hospitalaria" data={plan.hospitalaria} expanded={expanded} />
          <CoverageBlock title="Ambulatoria" data={plan.ambulatoria} expanded={expanded} />
        </div>

        {totalClinicas > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="self-start inline-flex items-center gap-1 text-[12px] font-semibold text-[#0f9d8a] hover:underline"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
            {expanded ? 'Ocultar clínicas' : 'Ver todas las clínicas'}
          </button>
        )}

        <div className="mt-auto pt-4 border-t border-[#0f514b]/8 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onRequestPlan(plan)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f514b] font-bold text-[12.5px] shadow-[0_8px_18px_rgba(20,220,180,0.3)] hover:-translate-y-0.5 transition-all uppercase tracking-[0.08em]"
          >
            Solicitar plan
          </button>
          {plan.pdf_url ? (
            <button
              type="button"
              onClick={() => onViewDetails(plan)}
              className="px-4 py-2.5 rounded-xl border border-[#0f514b]/15 text-[#0f514b] font-bold text-[12.5px] hover:bg-[#0f514b]/[0.03] hover:border-[#0f514b]/30 transition-all uppercase tracking-[0.08em] flex items-center justify-center gap-1.5"
            >
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Ver PDF
            </button>
          ) : (
            <button
              disabled
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-400 font-bold text-[12.5px] cursor-not-allowed uppercase tracking-[0.08em] flex items-center justify-center gap-1.5"
            >
              Sin PDF
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
