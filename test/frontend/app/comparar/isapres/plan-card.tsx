'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { Plan, Cobertura } from '@/lib/api';
import { formatCLP, formatUF } from '@/lib/api';

function CoberturaBlock({
  titulo,
  color,
  data,
}: {
  titulo: string;
  color: string;
  data: Cobertura[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {titulo}
          </span>
          <span className="text-sm text-slate-400">No disponible</span>
        </div>
      </div>
    );
  }

  const top = data[0];
  const rest = data.slice(1);
  const showRest = expanded && rest.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {titulo}
        </span>
        <span className="text-sm font-bold text-slate-700">{top.pct}%</span>
      </div>
      <div
        className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3"
        aria-label={`Cobertura ${top.pct}%`}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${top.pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {top.clinicas.slice(0, 3).map((c) => (
          <span
            key={c}
            className="inline-block text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700"
          >
            {c}
          </span>
        ))}
        {top.clinicas.length > 3 && !expanded && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-xs text-[#14dcb4] font-semibold hover:underline"
          >
            +{top.clinicas.length - 3} más
          </button>
        )}
      </div>
      {(rest.length > 0 || top.clinicas.length > 3) && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-[#14dcb4] font-semibold hover:underline mt-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" /> Ocultar coberturas
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" /> + coberturas
            </>
          )}
        </button>
      )}
      {showRest && (
        <div className="mt-3 space-y-2 pl-2 border-l-2 border-slate-100">
          {rest.map((cov, i) => (
            <div key={i}>
              <div className="text-xs font-bold text-slate-600 mb-1">{cov.pct}%</div>
              <div className="flex flex-wrap gap-1.5">
                {cov.clinicas.map((c) => (
                  <span
                    key={c}
                    className="inline-block text-xs px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlanCard({
  plan,
  onRequestPlan,
  onViewDetails,
}: {
  plan: Plan;
  onRequestPlan: (plan: Plan) => void;
  onViewDetails: (plan: Plan) => void;
}) {
  const logoSrc =
    plan.logo_url && plan.logo_url.startsWith('/')
      ? plan.logo_url
      : plan.logo_url || '/logos/placeholder.png';

  return (
    <article className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 h-full">
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="relative w-28 h-12 mb-3">
              <Image
                src={logoSrc}
                alt={plan.isapre_name}
                fill
                className="object-contain object-left"
                sizes="112px"
              />
            </div>
            <h3 className="font-bold text-sm text-slate-800 uppercase leading-tight mb-1">
              {plan.name}
            </h3>
            {plan.codigo_plan && (
              <p className="text-xs text-slate-400 font-mono break-all">{plan.codigo_plan}</p>
            )}
            {plan.modalidad && (
              <span className="inline-block mt-2 text-xs font-semibold text-[#14dcb4] bg-[#14dcb4]/10 px-2 py-0.5 rounded-full w-fit">
                {plan.modalidad}
              </span>
            )}
          </div>

          <div className="rounded-2xl bg-[#0f514b]/5 border border-[#0f514b]/10 px-4 py-3 sm:min-w-[150px] sm:text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">
              Precio base
            </div>
            <div className="text-2xl font-extrabold text-[#0f514b] leading-none">
              {formatUF(plan.base_plan_uf ?? plan.price_uf)} UF
            </div>
            <div className="text-sm text-slate-500 mt-1">
              {formatCLP(plan.price_clp)} / mes
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <CoberturaBlock titulo="Hospitalaria" color="#f97316" data={plan.hospitalaria} />
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <CoberturaBlock titulo="Ambulatoria" color="#f97316" data={plan.ambulatoria} />
          </div>
        </div>

        <div className="mt-auto grid grid-cols-1 gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onRequestPlan(plan)}
            className="text-center bg-[linear-gradient(135deg,#14dcb4,#0f9d8a)] hover:brightness-105 text-white text-sm font-bold py-2.5 rounded-lg transition-all shadow-[0_10px_24px_rgba(20,220,180,0.24)]"
          >
            SOLICITAR PLAN
          </button>
          {plan.pdf_url ? (
            <button
              type="button"
              onClick={() => onViewDetails(plan)}
              className="flex items-center justify-center gap-1.5 border border-slate-300 hover:border-[#14dcb4] hover:text-[#14dcb4] text-slate-700 text-sm font-bold py-2.5 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" /> VER DETALLES
            </button>
          ) : (
            <button
              disabled
              className="flex items-center justify-center gap-1.5 border border-slate-200 text-slate-400 text-sm font-bold py-2.5 rounded-lg cursor-not-allowed"
            >
              <FileText className="w-4 h-4" /> Sin PDF
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
