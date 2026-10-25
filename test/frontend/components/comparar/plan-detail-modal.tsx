'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BedDouble,
  Calculator,
  ExternalLink,
  FileText,
  Info,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import type { Plan } from '@/lib/api';
import { formatCLP, formatUF } from '@/lib/api';
import { useMeta } from '@/lib/meta-context';
import { type Beneficiario, EDAD_PERFIL_POR_DEFECTO, getFactor } from '@/lib/factores';
import CalculaTuPrecio from '@/components/comparar/calcula-tu-precio';
import { EASE_OUT, FONDO_MOTION, useModalMotion } from '@/lib/motion';
import {
  type CoberturaClinica,
  coberturaPorClinica,
  colorCobertura,
  nivelCobertura,
  rangoCobertura,
  textoRango,
} from '@/lib/coberturas';

type Tab = 'coberturas' | 'precio' | 'folleto';

const CLINICAS_VISIBLES = 9;

function fmtFactor(n: number) {
  return n.toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

/** Una fila "Hospitalaria / Ambulatoria" dentro de la tarjeta de una clínica. */
function FilaCobertura({ label, valores }: { label: string; valores: number[] }) {
  if (valores.length === 0) {
    return (
      <div className="space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#5a6b6a]">{label}</span>
          <span className="text-[12px] font-bold text-slate-300">—</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100" />
        <p className="text-[10.5px] italic text-[#5a6b6a]">No es parte de la red {label.toLowerCase()}</p>
      </div>
    );
  }
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const { fg, bg } = colorCobertura(max);
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#5a6b6a]">{label}</span>
        <span className="text-[13px] font-extrabold tabular-nums" style={{ color: fg }}>
          {textoRango({ min, max })}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: bg }}>
        <div className="h-full rounded-full" style={{ width: `${max}%`, background: fg }} />
      </div>
      <p className="text-[10.5px] text-[#5a6b6a]">
        {min === max ? (
          <>La Isapre paga {max}% · tú pagas {100 - max}%</>
        ) : (
          <>La Isapre paga hasta {max}% (desde {min}%, según la prestación)</>
        )}
      </p>
    </div>
  );
}

function TarjetaClinica({ c }: { c: CoberturaClinica }) {
  const ambas = c.hosp.length > 0 && c.amb.length > 0;
  const badge = ambas ? 'Hosp. y amb.' : c.hosp.length > 0 ? 'Solo hospitalaria' : 'Solo ambulatoria';
  return (
    <div className="rounded-2xl border border-[#0f514b]/10 bg-white p-3.5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-bold text-[#0f514b] leading-snug">{c.nombre}</span>
        <span
          className={`shrink-0 text-[9px] font-extrabold uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-md ${
            ambas ? 'bg-[#14dcb4]/15 text-[#0b7f6e]' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {badge}
        </span>
      </div>
      <FilaCobertura label="Hospitalaria" valores={c.hosp} />
      <FilaCobertura label="Ambulatoria" valores={c.amb} />
    </div>
  );
}

export default function PlanDetailModal({
  plan,
  perfil,
  perfilPorDefecto,
  beneficiariosUsuario,
  budgetCLP,
  onClose,
  onRequestPlan,
  onApplyPerfil,
}: {
  plan: Plan;
  /** Beneficiarios con que se calcula el precio (los del usuario o el perfil por defecto). */
  perfil: Beneficiario[];
  perfilPorDefecto: boolean;
  /** Lo que ingresó el usuario (vacío si aún nada): prellena "Calcula tu precio". */
  beneficiariosUsuario: Beneficiario[];
  budgetCLP: number | null;
  onClose: () => void;
  onRequestPlan: (plan: Plan) => void;
  /** Calcula el precio con la edad del usuario sin cerrar la ficha. */
  onApplyPerfil: (edadTitular: number, edadesCargas: number[]) => void;
}) {
  const { ufValueCLP } = useMeta();
  const modalMotion = useModalMotion();
  const [tab, setTab] = useState<Tab>('coberturas');
  const [verTodas, setVerTodas] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  // onClose cambia de identidad en cada render del padre: se guarda en un ref para que
  // el efecto de abajo corra UNA vez (si no, el foco saltaría al botón de cerrar cada
  // vez que el listado se actualiza).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  /** Lleva a la pestaña de precio y pone el foco en "Tu edad". */
  function irACalcular() {
    setTab('precio');
    setTimeout(() => document.getElementById('calcula-edad-modal')?.focus(), 60);
  }

  // ── Precio por persona ──────────────────────────────────────────────────
  const base = plan.base_plan_uf ?? plan.price_uf;
  const ges = plan.ges_isapre_uf ?? 0;
  let nCotizante = 0;
  const filas = perfil.map((b) => {
    const factor = getFactor(b.edad, b.tipo);
    const uf = base * factor + ges;
    let label: string;
    if (perfilPorDefecto) label = `1 persona de ${EDAD_PERFIL_POR_DEFECTO} años (ejemplo)`;
    else if (b.tipo === 'cotizante') label = nCotizante++ === 0 ? `Tú · ${b.edad} años` : `Cotizante · ${b.edad} años`;
    else label = `Carga · ${b.edad} años`;
    return { id: b.id, label, factor, uf, clp: Math.round(uf * ufValueCLP) };
  });
  const totalUf = filas.reduce((s, f) => s + f.uf, 0);
  const totalClp = Math.round(totalUf * ufValueCLP);
  const sumaFactores = filas.reduce((s, f) => s + f.factor, 0);
  const diff = budgetCLP ? budgetCLP - totalClp : null;

  // ── Coberturas ──────────────────────────────────────────────────────────
  const clinicas = coberturaPorClinica(plan.hospitalaria, plan.ambulatoria);
  const nHosp = clinicas.filter((c) => c.hosp.length > 0).length;
  const nAmb = clinicas.filter((c) => c.amb.length > 0).length;
  const rHosp = rangoCobertura(plan.hospitalaria);
  const rAmb = rangoCobertura(plan.ambulatoria);
  const nivel = nivelCobertura(clinicas);
  const mejores = clinicas.slice(0, 2).map((c) => c.nombre);
  const visibles = verTodas ? clinicas : clinicas.slice(0, CLINICAS_VISIBLES);

  const logoSrc =
    plan.logo_url && plan.logo_url.startsWith('/') ? plan.logo_url : plan.logo_url || '/logos/placeholder.png';

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'coberturas', label: 'Coberturas', show: true },
    { id: 'precio', label: perfilPorDefecto ? 'Precio' : 'Tu precio', show: true },
    { id: 'folleto', label: 'Folleto (PDF)', show: !!plan.pdf_url },
  ];

  return (
    <motion.div
      {...FONDO_MOTION}
      className="fixed inset-0 z-[72] bg-slate-950/55 backdrop-blur-sm px-2 py-2 sm:px-4 sm:py-4 md:px-6"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-plan-titulo"
        {...modalMotion}
        className="mx-auto flex h-full max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-[22px] sm:rounded-[28px] border border-white/40 bg-[#fbf8f3] shadow-[0_40px_120px_rgba(15,81,75,0.28)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-white border-b border-[#0f514b]/10 px-4 py-3.5 sm:px-6 sm:py-4 flex items-start gap-3 sm:gap-5">
          <div className="hidden sm:block h-10 w-28 relative shrink-0 mt-0.5">
            <Image src={logoSrc} alt={plan.isapre_name} fill className="object-contain object-left" sizes="112px" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="sm:hidden text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#5a6b6a]">
              {plan.isapre_name}
            </div>
            <h2 id="detalle-plan-titulo" className="text-[15px] sm:text-[17px] font-extrabold text-[#0f514b] uppercase leading-tight tracking-tight">
              {plan.name}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {plan.codigo_plan && <span className="text-[10.5px] text-[#5a6b6a] font-mono">{plan.codigo_plan}</span>}
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
          </div>
          <div className="shrink-0 text-right flex flex-col items-end gap-1">
            <div className="text-[19px] sm:text-[22px] font-extrabold text-[#0f514b] leading-tight tabular-nums">
              UF {formatUF(totalUf)}
            </div>
            <div className="text-[11.5px] text-[#5a6b6a] tabular-nums">
              {formatCLP(totalClp)}/mes{' '}
              {!perfilPorDefecto && (
                <span className="hidden sm:inline">{perfil.length > 1 ? '· tu familia' : '· para ti'}</span>
              )}
            </div>
            {perfilPorDefecto && (
              <>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#0f514b]/7 px-2 py-0.5 text-[10.5px] font-bold text-[#0f514b]">
                  <UserRound className="w-3 h-3" aria-hidden />
                  Ejemplo: 1 persona de {EDAD_PERFIL_POR_DEFECTO} años
                </span>
                <button
                  type="button"
                  onClick={irACalcular}
                  className="pressable hidden sm:inline-flex items-center gap-1 text-[11.5px] font-bold text-[#0f7f6f] underline underline-offset-2 hover:text-[#0f514b]"
                >
                  <Calculator className="w-3.5 h-3.5" aria-hidden />
                  Calcular mi precio
                </button>
              </>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle del plan"
            className="pressable shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-[#5a6b6a] hover:bg-[#0f514b]/5 hover:text-[#0f514b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Celular: aviso de precio de ejemplo bajo el encabezado */}
        {perfilPorDefecto && (
          <div className="sm:hidden flex items-center justify-between gap-2 border-b border-[#0f514b]/10 bg-[#14dcb4]/12 px-4 py-2 text-[12px] text-[#0f514b]">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <UserRound className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Ejemplo: 1 persona de {EDAD_PERFIL_POR_DEFECTO} años
            </span>
            <button type="button" onClick={irACalcular} className="pressable shrink-0 font-bold underline underline-offset-2">
              Calcular el mío
            </button>
          </div>
        )}

        {/* Pestañas */}
        <div className="bg-white border-b border-[#0f514b]/10 px-2 sm:px-4 flex items-center gap-1">
          <div role="tablist" aria-label="Información del plan" className="flex min-w-0 overflow-x-auto">
            {tabs.filter((t) => t.show).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={`tappable-row relative whitespace-nowrap px-3 sm:px-4 py-3 text-[11.5px] sm:text-[12px] font-bold uppercase tracking-[0.08em] transition-colors duration-150 ${
                  tab === t.id ? 'text-[#0f514b]' : 'text-[#5a6b6a] hover:text-[#0f514b]'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.span
                    layoutId="ficha-pestana-activa"
                    transition={{ duration: 0.25, ease: EASE_OUT }}
                    className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-[#14dcb4]"
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onRequestPlan(plan)}
            className="pressable hidden sm:inline-flex ml-auto shrink-0 my-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] text-[11.5px] font-extrabold uppercase tracking-[0.08em] shadow-[0_8px_18px_rgba(20,220,180,0.3)] hover:-translate-y-0.5"
          >
            Solicitar plan
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">
          {tab === 'coberturas' && (
            <div role="tabpanel" id="panel-coberturas" aria-labelledby="tab-coberturas" className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 rounded-2xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white p-4 sm:p-5">
                <div>
                  <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8ff0db]">
                    <BedDouble className="w-3.5 h-3.5" /> Hospitalaria
                  </div>
                  <div className="text-[22px] font-extrabold leading-tight">{rHosp ? `hasta ${rHosp.max}%` : 'Sin datos'}</div>
                  <div className="text-[11.5px] text-white/70">
                    {nHosp > 0 ? `en ${nHosp} ${nHosp === 1 ? 'clínica' : 'clínicas'} de la red` : 'Sin clínicas informadas'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8ff0db]">
                    <Stethoscope className="w-3.5 h-3.5" /> Ambulatoria
                  </div>
                  <div className="text-[22px] font-extrabold leading-tight">{rAmb ? `hasta ${rAmb.max}%` : 'Sin datos'}</div>
                  <div className="text-[11.5px] text-white/70">
                    {nAmb > 0 ? `en ${nAmb} ${nAmb === 1 ? 'centro o clínica' : 'centros y clínicas'}` : 'Sin centros informados'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] text-[#8ff0db]">
                    <ShieldCheck className="w-3.5 h-3.5" /> En resumen
                  </div>
                  <div className="text-[22px] font-extrabold leading-tight">{nivel?.label ?? '—'}</div>
                  {mejores.length > 0 && (
                    <div className="text-[11.5px] text-white/70">Mejor en {mejores.join(' y ')}</div>
                  )}
                </div>
              </div>

              {clinicas.length > 0 ? (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {visibles.map((c) => (
                      <TarjetaClinica key={c.nombre} c={c} />
                    ))}
                  </div>
                  {clinicas.length > CLINICAS_VISIBLES && (
                    <button
                      type="button"
                      onClick={() => setVerTodas((v) => !v)}
                      className="pressable text-[12.5px] font-bold text-[#0f9d8a] hover:underline"
                    >
                      {verTodas ? 'Ver menos' : `Ver las ${clinicas.length} clínicas y centros`}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-[#5a6b6a]">Este plan no informa clínicas en su red. Revisa el folleto.</p>
              )}

              <p className="flex gap-2 rounded-xl bg-white border border-[#0f514b]/8 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-[#5a6b6a]">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0f9d8a]" />
                <span>
                  El % es la parte de la cuenta que paga la Isapre según el arancel del plan; el resto es tu copago.
                  {plan.modalidad === 'Preferente' &&
                    ' En planes Preferentes también puedes atenderte fuera de esta red, con menor cobertura (revisa el folleto).'}
                  {plan.modalidad === 'Cerrado' && ' En planes Cerrados la cobertura aplica solo en esta red.'}
                </span>
              </p>
            </div>
          )}

          {tab === 'precio' && (
            <div role="tabpanel" id="panel-precio" aria-labelledby="tab-precio" className="space-y-4">
              <CalculaTuPrecio
                variant="modal"
                inputId="calcula-edad-modal"
                beneficiarios={beneficiariosUsuario}
                perfilPorDefecto={perfilPorDefecto}
                onApply={onApplyPerfil}
              />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { k: 'Precio base', v: `${formatUF(base)} UF`, s: 'lo fija el plan' },
                  { k: 'GES', v: `${formatUF(ges)} UF`, s: 'por persona, igual en toda la Isapre' },
                  { k: 'Factores', v: fmtFactor(sumaFactores), s: 'según la edad de cada uno' },
                  { k: 'Personas', v: String(filas.length), s: perfilPorDefecto ? 'perfil de ejemplo' : 'en tu grupo' },
                ].map((t) => (
                  <div key={t.k} className="rounded-xl bg-white border border-[#0f514b]/10 px-3.5 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a6b6a]">{t.k}</div>
                    <div className="text-[18px] font-extrabold text-[#0f514b] tabular-nums">{t.v}</div>
                    <div className="text-[10.5px] text-[#5a6b6a] leading-snug">{t.s}</div>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto rounded-2xl bg-white border border-[#0f514b]/10">
                <table className="w-full text-[12.5px] tabular-nums">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.12em] text-[#5a6b6a]">
                      <th className="text-left font-bold px-4 py-2.5">Persona</th>
                      <th className="text-right font-bold px-4 py-2.5">Cálculo (UF)</th>
                      <th className="text-right font-bold px-4 py-2.5">UF</th>
                      <th className="text-right font-bold px-4 py-2.5">Pesos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filas.map((f) => (
                      <tr key={f.id} className="border-t border-[#0f514b]/8">
                        <td className="px-4 py-2.5 text-[#1e2a2a] font-medium whitespace-nowrap">{f.label}</td>
                        <td className="px-4 py-2.5 text-right text-[#5a6b6a] whitespace-nowrap">
                          {formatUF(base)} × {fmtFactor(f.factor)} + {formatUF(ges)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[#0f514b] font-semibold">{formatUF(f.uf)}</td>
                        <td className="px-4 py-2.5 text-right text-[#0f514b] font-semibold">{formatCLP(f.clp)}</td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-[#0f514b]/15">
                      <td className="px-4 py-3 font-extrabold text-[#0f514b]">Total al mes</td>
                      <td />
                      <td className="px-4 py-3 text-right font-extrabold text-[#0f514b]">{formatUF(totalUf)}</td>
                      <td className="px-4 py-3 text-right font-extrabold text-[#0f514b]">{formatCLP(totalClp)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {diff != null ? (
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 border ${
                    diff >= 0 ? 'bg-[#14dcb4]/10 border-[#14dcb4]/40 text-[#0b7f6e]' : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="text-[12.5px] flex items-center gap-2">
                    <Wallet className="w-4 h-4 shrink-0" />
                    <span>
                      Tu 7% es <strong className="tabular-nums">{formatCLP(budgetCLP)}</strong>.
                      {diff >= 0 ? ' Con este plan te sobran' : ' Con este plan pagarías'}
                    </span>
                  </span>
                  <strong className="text-[16px] tabular-nums">
                    {diff >= 0 ? `${formatCLP(diff)} al mes` : `${formatCLP(-diff)} extra al mes`}
                  </strong>
                </div>
              ) : (
                <p className="flex gap-2 rounded-xl bg-white border border-[#0f514b]/8 px-3.5 py-2.5 text-[11.5px] text-[#5a6b6a]">
                  <Wallet className="w-4 h-4 shrink-0 mt-0.5 text-[#0f9d8a]" />
                  <span>
                    ¿Te alcanza con tu 7%? Ingresa tu sueldo en <strong className="text-[#0f514b]">“Tu 7% legal”</strong> y te
                    mostramos cuánto te sobra o cuánto pagarías extra.
                  </span>
                </p>
              )}

              <p className="text-[11px] text-[#5a6b6a] leading-relaxed">
                Precio = precio base × factor de cada persona + GES por persona. El GES (Garantías Explícitas en Salud) es igual
                en todos los planes de una misma Isapre. Valores con UF de {formatCLP(Math.round(ufValueCLP))}.
              </p>
            </div>
          )}

          {tab === 'folleto' && plan.pdf_url && (
            <div role="tabpanel" id="panel-folleto" aria-labelledby="tab-folleto" className="flex h-full min-h-[60vh] flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-[12px] text-[#5a6b6a]">
                  <FileText className="w-4 h-4 text-[#0f9d8a]" /> Folleto oficial de la Isapre.
                </p>
                <a
                  href={plan.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#0f514b]/15 bg-white px-3 py-1.5 text-[12px] font-bold text-[#0f514b] hover:border-[#0f514b]/30 no-underline"
                >
                  Abrir en pestaña nueva <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <iframe
                src={plan.pdf_url}
                title={`Folleto del plan ${plan.name}`}
                className="w-full flex-1 min-h-[55vh] rounded-2xl border border-slate-200 bg-white"
              />
            </div>
          )}
        </div>

        {/* Acción fija en celular */}
        <div className="sm:hidden border-t border-[#0f514b]/10 bg-white p-3">
          <button
            type="button"
            onClick={() => onRequestPlan(plan)}
            className="pressable w-full py-3 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] text-[12.5px] font-extrabold uppercase tracking-[0.08em] shadow-[0_8px_18px_rgba(20,220,180,0.3)]"
          >
            Solicitar plan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
