'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Columns3, ExternalLink, X } from 'lucide-react';
import type { Plan } from '@/lib/api';
import { formatCLP, formatUF } from '@/lib/api';
import { useMeta } from '@/lib/meta-context';
import { clinicasUnicas, rangoCobertura, textoRango } from '@/lib/coberturas';
import { FONDO_MOTION, useFlotanteMotion, useModalMotion } from '@/lib/motion';

// Comparar hasta 3 planes lado a lado (en tu7 solo existe para ejecutivos con cuenta).

export const MAX_COMPARAR = 3;

function logo(plan: Plan) {
  return plan.logo_url && plan.logo_url.startsWith('/') ? plan.logo_url : plan.logo_url || '/logos/placeholder.png';
}

/** Bandeja flotante: aparece al marcar el primer plan. */
export function BandejaComparar({
  planes,
  onQuitar,
  onComparar,
  onVaciar,
}: {
  planes: Plan[];
  onQuitar: (id: string) => void;
  onComparar: () => void;
  onVaciar: () => void;
}) {
  const flotante = useFlotanteMotion();
  const listo = planes.length >= 2;
  return (
    <AnimatePresence>
    {planes.length > 0 && (
    <motion.div
      key="bandeja"
      {...flotante}
      className="fixed inset-x-3 bottom-24 z-[60] mx-auto max-w-[940px] rounded-2xl border border-[#14dcb4]/30 bg-[#0f514b] text-white shadow-[0_20px_44px_-14px_rgba(9,46,42,0.6)] px-3 py-2.5 sm:px-4"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <Columns3 className="w-4 h-4 text-[#14dcb4]" aria-hidden />
          <span className="text-[12.5px] font-bold whitespace-nowrap">
            {planes.length} de {MAX_COMPARAR}
            <span className="hidden sm:inline"> para comparar</span>
          </span>
        </div>
        {/* Una sola fila: en el celular se desliza de lado si no cabe */}
        <div className="flex flex-1 min-w-0 gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {planes.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onQuitar(p.id)}
              aria-label={`Quitar ${p.name} de la comparación`}
              className="pressable inline-flex shrink-0 max-w-[160px] items-center gap-1 rounded-full bg-white/12 px-2.5 py-1.5 sm:py-1 text-[11px] font-semibold hover:bg-white/20"
            >
              <span className="truncate">{p.name}</span>
              <X className="w-3 h-3 shrink-0" aria-hidden />
            </button>
          ))}
        </div>
        <button type="button" onClick={onVaciar} className="pressable hidden sm:block shrink-0 text-[11.5px] font-semibold text-white/70 hover:text-white px-1">
          Vaciar
        </button>
        <button
          type="button"
          onClick={onComparar}
          disabled={!listo}
          title={listo ? undefined : 'Marca al menos 2 planes'}
          className="pressable shrink-0 whitespace-nowrap rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] px-3.5 sm:px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.06em] text-[#0f2826] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {listo ? (
            <>
              Comparar<span className="hidden sm:inline"> ahora</span>
            </>
          ) : (
            'Marca 1 más'
          )}
        </button>
      </div>
    </motion.div>
    )}
    </AnimatePresence>
  );
}

type Celda = { texto: React.ReactNode; valor?: number | null };

/** Tabla comparativa. Destaca lo mejor de cada fila (precio más bajo, cobertura más alta). */
export function CompararModal({
  planes,
  totalFactor,
  numBeneficiarios,
  perfilPorDefecto,
  budgetCLP,
  clinicasElegidas,
  onClose,
  onQuitar,
  onVerDetalle,
  onSolicitar,
}: {
  planes: Plan[];
  totalFactor: number;
  numBeneficiarios: number;
  perfilPorDefecto: boolean;
  budgetCLP: number | null;
  /** Nombres de las clínicas elegidas en el filtro: se agrega una fila por cada una. */
  clinicasElegidas: string[];
  onClose: () => void;
  onQuitar: (id: string) => void;
  onVerDetalle: (plan: Plan) => void;
  onSolicitar: (plan: Plan) => void;
}) {
  const { ufValueCLP } = useMeta();
  const modalMotion = useModalMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const precios = planes.map((p) => {
    const uf = (p.base_plan_uf ?? p.price_uf) * totalFactor + (p.ges_isapre_uf ?? 0) * numBeneficiarios;
    return { uf, clp: Math.round(uf * ufValueCLP) };
  });

  const pctEnClinica = (cobs: Plan['hospitalaria'], nombre: string): number | null => {
    const n = nombre.toLowerCase();
    let best: number | null = null;
    for (const c of cobs ?? []) {
      if (c.clinicas.some((cl) => cl.toLowerCase().includes(n))) best = best == null ? c.pct : Math.max(best, c.pct);
    }
    return best;
  };

  const etiquetaPrecio = perfilPorDefecto
    ? 'Precio (ejemplo: 1 persona de 30 años)'
    : numBeneficiarios === 1
      ? 'Tu precio'
      : `Precio para tu familia (${numBeneficiarios})`;

  const filas: { titulo: string; celdas: Celda[]; mejor?: 'min' | 'max' }[] = [
    {
      titulo: etiquetaPrecio,
      mejor: 'min',
      celdas: precios.map((pr) => ({
        valor: pr.uf,
        texto: (
          <>
            <span className="block text-[14px] sm:text-[15px] font-extrabold text-[#0f514b] tabular-nums">UF {formatUF(pr.uf)}</span>
            <span className="text-[11.5px] sm:text-[12px] text-[#5a6b6a] tabular-nums">{formatCLP(pr.clp)}/mes</span>
          </>
        ),
      })),
    },
  ];
  if (budgetCLP) {
    filas.push({
      titulo: 'Frente a tu 7%',
      mejor: 'min',
      celdas: precios.map((pr) => {
        const diff = budgetCLP - pr.clp;
        return {
          valor: -diff,
          texto:
            diff >= 0 ? (
              <span className="font-bold text-[#0b7f6e]">Te sobran {formatCLP(diff)}</span>
            ) : (
              <span className="font-bold text-amber-800">Pagas {formatCLP(-diff)} extra</span>
            ),
        };
      }),
    });
  }
  filas.push(
    { titulo: 'Modalidad', celdas: planes.map((p) => ({ texto: p.modalidad ?? '—' })) },
    { titulo: 'Zona', celdas: planes.map((p) => ({ texto: p.zona_nombre ?? '—' })) },
    {
      titulo: 'Hospitalaria',
      mejor: 'max',
      celdas: planes.map((p) => {
        const r = rangoCobertura(p.hospitalaria);
        return { valor: r?.max ?? null, texto: r ? textoRango(r) : '—' };
      }),
    },
    {
      titulo: 'Ambulatoria',
      mejor: 'max',
      celdas: planes.map((p) => {
        const r = rangoCobertura(p.ambulatoria);
        return { valor: r?.max ?? null, texto: r ? textoRango(r) : '—' };
      }),
    },
  );
  for (const nombre of clinicasElegidas) {
    filas.push({
      titulo: `${nombre} (hosp. / amb.)`,
      mejor: 'max',
      celdas: planes.map((p) => {
        const h = pctEnClinica(p.hospitalaria, nombre);
        const a = pctEnClinica(p.ambulatoria, nombre);
        return {
          valor: h == null && a == null ? null : (h ?? 0) + (a ?? 0),
          texto: h == null && a == null ? 'No está en la red' : `${h != null ? `${h}%` : '—'} / ${a != null ? `${a}%` : '—'}`,
        };
      }),
    });
  }
  filas.push({
    titulo: 'Clínicas y centros en la red',
    mejor: 'max',
    celdas: planes.map((p) => {
      const h = clinicasUnicas(p.hospitalaria).length;
      const a = clinicasUnicas(p.ambulatoria).length;
      return { valor: h + a, texto: `${h} hosp. · ${a} amb.` };
    }),
  });

  const esMejor = (fila: (typeof filas)[number], i: number) => {
    if (!fila.mejor || planes.length < 2) return false;
    const vals = fila.celdas.map((c) => c.valor).filter((v): v is number => v != null);
    if (vals.length < 2) return false;
    const objetivo = fila.mejor === 'min' ? Math.min(...vals) : Math.max(...vals);
    const v = fila.celdas[i].valor;
    // Si todos empatan, no se destaca a nadie.
    return v != null && v === objetivo && vals.some((x) => x !== objetivo);
  };

  return (
    <motion.div
      {...FONDO_MOTION}
      className="fixed inset-0 z-[73] bg-slate-950/55 backdrop-blur-sm px-2 py-2 sm:px-4 sm:py-4"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparar-titulo"
        {...modalMotion}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] sm:rounded-[28px] bg-[#fbf8f3] shadow-[0_40px_120px_rgba(15,81,75,0.28)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#0f514b]/10 bg-white px-4 py-3.5 sm:px-6">
          <h2 id="comparar-titulo" className="text-[16px] sm:text-[18px] font-extrabold text-[#0f514b]">
            Comparar {planes.length} planes
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar comparación"
            className="pressable w-9 h-9 rounded-full grid place-items-center text-[#5a6b6a] hover:bg-[#0f514b]/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Celular: el nombre de cada fila va arriba (fila propia) y los planes quedan lado a lado,
            así se ven todos sin deslizar. Desde sm: tabla clásica con la columna de títulos. */}
        <div className="flex-1 overflow-auto overscroll-contain p-2 sm:p-5">
          <table className="w-full table-fixed sm:table-auto sm:min-w-[560px] border-separate border-spacing-0 text-[12px] sm:text-[13px]">
            <thead>
              <tr>
                <th className="hidden sm:table-cell w-[26%] p-2" />
                {planes.map((p) => (
                  <th key={p.id} className="p-1 sm:p-2 align-top text-left">
                    <div className="rounded-xl bg-white border border-[#0f514b]/10 p-2 sm:p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-1 sm:gap-2">
                        <div className="h-5 w-16 sm:h-7 sm:w-24 relative">
                          <Image src={logo(p)} alt={p.isapre_name} fill className="object-contain object-left" sizes="96px" />
                        </div>
                        <button
                          type="button"
                          onClick={() => onQuitar(p.id)}
                          aria-label={`Quitar ${p.name}`}
                          className="pressable w-6 h-6 rounded-full grid place-items-center text-[#5a6b6a] hover:bg-[#0f514b]/5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[10.5px] sm:text-[12px] font-extrabold uppercase leading-tight text-[#0f514b] break-words">{p.name}</div>
                      <div className="text-[10px] sm:text-[10.5px] font-mono font-normal text-[#5a6b6a] break-all">{p.codigo_plan}</div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <Fragment key={fila.titulo}>
                  <tr className="sm:hidden">
                    <th
                      colSpan={planes.length}
                      scope="colgroup"
                      className="border-t border-[#0f514b]/8 px-1.5 pt-2.5 pb-1 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[#5a6b6a]"
                    >
                      {fila.titulo}
                    </th>
                  </tr>
                  <tr>
                    <th scope="row" className="hidden sm:table-cell border-t border-[#0f514b]/8 p-2.5 text-left align-top text-[11px] font-bold uppercase tracking-[0.08em] text-[#5a6b6a]">
                      {fila.titulo}
                    </th>
                    {fila.celdas.map((c, i) => (
                      <td
                        key={planes[i].id}
                        className={`sm:border-t border-[#0f514b]/8 px-1.5 pb-2 pt-0.5 sm:p-2.5 align-top text-[#1e2a2a] break-words ${
                          esMejor(fila, i) ? 'bg-[#14dcb4]/12 font-bold text-[#0f514b] rounded-md sm:rounded-none' : ''
                        }`}
                      >
                        {c.texto}
                      </td>
                    ))}
                  </tr>
                </Fragment>
              ))}
              <tr>
                <th scope="row" className="hidden sm:table-cell border-t border-[#0f514b]/8 p-2.5" />
                {planes.map((p) => (
                  <td key={p.id} className="border-t border-[#0f514b]/8 p-1 pt-2.5 sm:p-2.5 align-top">
                    <div className="flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSolicitar(p)}
                        className="pressable rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] px-2 sm:px-3 py-2 text-[10.5px] sm:text-[11px] font-extrabold uppercase leading-tight tracking-[0.04em] sm:tracking-[0.06em] text-[#0f2826]"
                      >
                        Solicitar plan
                      </button>
                      <button
                        type="button"
                        onClick={() => onVerDetalle(p)}
                        className="pressable rounded-xl border border-[#0f514b]/15 bg-white px-2 sm:px-3 py-2 text-[10.5px] sm:text-[11px] font-bold uppercase leading-tight tracking-[0.04em] sm:tracking-[0.06em] text-[#0f514b]"
                      >
                        Ver detalle
                      </button>
                      {p.pdf_url && (
                        <a
                          href={p.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1 text-[11.5px] font-bold text-[#0f9d8a] no-underline hover:underline"
                        >
                          Folleto PDF <ExternalLink className="w-3 h-3" aria-hidden />
                        </a>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-[11.5px] text-[#5a6b6a]">
            Lo destacado en verde es lo mejor de cada fila: el precio más bajo o la cobertura más alta.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
