'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, UserPlus, ArrowRight, Trash2, Sparkles, Wallet, Users } from 'lucide-react';
import { useMeta } from '@/lib/meta-context';
import { getPlanes, formatCLP, formatUF, type Plan } from '@/lib/api';
import {
  calcularPrecioPlanUF,
  calcularSeptimoLegal,
  serializeBeneficiarios,
  getFactor,
  type Beneficiario,
} from '@/lib/factores';

// Rutas donde aparece el modal de bienvenida. NUNCA en /buscar (ahí ya están cotizando).
const QUALIFYING = ['/', '/comparar/isapres'];
const seenKey = (path: string) => `etp_qs_seen:${path}`;

function markSeen(path: string) {
  try { sessionStorage.setItem(seenKey(path), '1'); } catch { /* sessionStorage no disponible */ }
}

/**
 * Modal de "quick start": al entrar por 1ª vez (por sección, por sesión) a `/` o
 * `/comparar/isapres`, aparece sobre la página difuminada ofreciendo personalizar la
 * búsqueda (sueldo + cargas → vista previa de planes a precio REAL) e incentivando la
 * asesoría con un experto. Se cierra con X, click afuera o "explorar sin personalizar".
 */
export default function QuickStartOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const { ufValueCLP, topeImponibleUF } = useMeta();

  const [open, setOpen] = useState(false);

  // ── Mini-formulario ──────────────────────────────────────────────
  const [salary, setSalary] = useState(0);
  const [salaryDisplay, setSalaryDisplay] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [ageInput, setAgeInput] = useState('');
  const [cargas, setCargas] = useState<number[]>([]);
  const [cargaInput, setCargaInput] = useState('');

  // ── Preview ──────────────────────────────────────────────────────
  const [plans, setPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Trigger: 1ª vez por sección (sessionStorage). Pequeño delay para que la página pinte.
  useEffect(() => {
    if (!QUALIFYING.includes(pathname)) return;
    let seen = true;
    try { seen = sessionStorage.getItem(seenKey(pathname)) === '1'; } catch { seen = false; }
    if (seen) return;
    const t = setTimeout(() => {
      setOpen(true);
      markSeen(pathname);
    }, 650);
    return () => clearTimeout(t);
  }, [pathname]);

  // Bloquear scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const beneficiarios = useMemo<Beneficiario[]>(() => {
    if (age == null) return [];
    return [
      { id: 'cot', edad: age, tipo: 'cotizante' },
      ...cargas.map((edad, i) => ({ id: `crg-${i}`, edad, tipo: 'carga' as const })),
    ];
  }, [age, cargas]);

  const seven = useMemo(
    () => calcularSeptimoLegal(salary, ufValueCLP, topeImponibleUF),
    [salary, ufValueCLP, topeImponibleUF],
  );

  const hasProfile = salary > 0 && age != null;

  // Vista previa: trae los planes más baratos, los valoriza al perfil y muestra el top-3.
  useEffect(() => {
    if (!open || !hasProfile) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      getPlanes({ limit: 14, sort: 'precio_asc' })
        .then((res) => {
          if (cancelled) return;
          setTotal(res.total);
          const ranked = res.items
            .map((p) => ({ p, uf: calcularPrecioPlanUF(p.base_plan_uf, p.ges_isapre_uf, beneficiarios) }))
            .sort((a, b) => a.uf - b.uf)
            .slice(0, 3);
          setPlans(ranked.map((x) => x.p));
        })
        .catch(() => { if (!cancelled) { setPlans([]); setTotal(null); } })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [open, hasProfile, salary, age, beneficiarios]);

  if (!open) return null;

  // ── Handlers ─────────────────────────────────────────────────────
  function onSalary(raw: string) {
    const digits = raw.replace(/\D/g, '');
    const n = digits ? Math.min(parseInt(digits, 10), 99_999_999) : 0;
    setSalary(n);
    setSalaryDisplay(n ? n.toLocaleString('es-CL') : '');
  }
  function commitAge() {
    const v = ageInput.trim();
    if (!v) { setAge(null); setCargas([]); return; }
    const n = parseInt(v, 10);
    if (Number.isFinite(n) && n >= 0 && n <= 110) setAge(n);
  }
  function addCarga() {
    const n = parseInt(cargaInput, 10);
    if (Number.isFinite(n) && n >= 0 && n <= 110) {
      setCargas((c) => [...c, n]);
      setCargaInput('');
    }
  }

  function dismiss() { setOpen(false); }

  function verPlanes() {
    // No volver a mostrar el modal al aterrizar en el comparador (venimos de acá).
    markSeen('/comparar/isapres');
    const params = new URLSearchParams();
    if (hasProfile) {
      params.set('sueldo_imponible_clp', String(salary));
      params.set('aplicar_tope_legal', 'true');
      params.set('ben', serializeBeneficiarios(beneficiarios));
    }
    const qs = params.toString();
    setOpen(false);
    router.push(qs ? `/comparar/isapres?${qs}` : '/comparar/isapres');
  }

  function cotizarExperto() {
    markSeen('/buscar');
    setOpen(false);
    router.push('/buscar');
  }

  const nPlanes = total ?? null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center overflow-y-auto px-3 py-6 sm:py-10"
      role="dialog"
      aria-modal="true"
      aria-label="Personaliza tu búsqueda de planes"
    >
      {/* Backdrop difuminado */}
      <div
        className="absolute inset-0 bg-[#06201d]/45 backdrop-blur-md"
        onClick={dismiss}
        aria-hidden
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[680px] rounded-[26px] bg-white shadow-[0_40px_120px_-20px_rgba(9,46,42,0.6)] border border-white/50 overflow-hidden"
        style={{ animation: 'slide-up-fade 0.3s cubic-bezier(.2,.8,.2,1)' }}
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-[#0f514b]/5 hover:bg-[#0f514b]/10 text-[#0f514b] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-7">
          {/* Header */}
          <div className="flex items-start gap-3 pr-8">
            <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] flex items-center justify-center shadow-[0_8px_18px_rgba(20,220,180,0.4)]">
              <Sparkles className="w-5 h-5 text-[#0f2826]" />
            </div>
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-bold text-[#0f514b] leading-tight tracking-tight">
                Mira tus planes a tu precio real
              </h2>
              <p className="text-[13px] text-[#5a6b6a] mt-0.5 leading-snug">
                Ingresa tu sueldo y tu grupo familiar y te mostramos al instante una vista previa personalizada.
              </p>
            </div>
          </div>

          {/* Mini-formulario */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-[1.3fr_0.7fr] gap-2.5">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1 block">Tu sueldo bruto</span>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] font-bold text-[#0f514b]/55 pointer-events-none">$</span>
                <input
                  type="text" inputMode="numeric"
                  value={salaryDisplay}
                  onChange={(e) => onSalary(e.target.value)}
                  placeholder="950.000"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border-2 border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/12 text-[15px] font-bold text-[#0f514b] placeholder:text-slate-300 placeholder:font-normal transition-all"
                  aria-label="Sueldo bruto"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1 block">Tu edad</span>
              <div className="relative">
                <input
                  type="text" inputMode="numeric"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onBlur={commitAge}
                  onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                  placeholder="34"
                  className="w-full px-3.5 py-2.5 pr-12 rounded-xl border-2 border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-4 focus:ring-[#14dcb4]/12 text-[15px] font-bold text-[#0f514b] tabular-nums placeholder:text-slate-300 placeholder:font-normal transition-all"
                  aria-label="Tu edad"
                />
                {age != null && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9.5px] font-bold uppercase tracking-[0.06em] text-[#0f9d8a] tabular-nums bg-[#14dcb4]/15 px-1.5 py-0.5 rounded">
                    F {getFactor(age, 'cotizante').toFixed(2)}
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* Cargas */}
          <div className={`mt-2.5 ${age == null ? 'opacity-50 pointer-events-none' : ''}`}>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1 block">
              Cargas <span className="font-medium normal-case tracking-normal text-slate-400">(opcional — hijos, pareja)</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center gap-1.5">
                <input
                  type="text" inputMode="numeric"
                  value={cargaInput}
                  onChange={(e) => setCargaInput(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCarga(); } }}
                  placeholder="Edad"
                  disabled={age == null}
                  className="w-20 px-2.5 py-2 rounded-lg border border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/15 text-[13px] font-bold text-[#0f514b] tabular-nums placeholder:text-slate-300 transition-all"
                  aria-label="Edad de la carga"
                />
                <button
                  type="button" onClick={addCarga} disabled={!cargaInput || age == null}
                  className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-[#14dcb4]/15 hover:bg-[#14dcb4]/25 text-[#0f9d8a] text-[11.5px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>
              {cargas.map((edad, i) => (
                <button
                  key={`${edad}-${i}`}
                  type="button"
                  onClick={() => setCargas((c) => c.filter((_, idx) => idx !== i))}
                  title="Quitar"
                  className="inline-flex items-center gap-1.5 rounded-lg pl-2 pr-1.5 py-1.5 text-[11.5px] font-bold bg-[#14dcb4]/20 text-[#0f9d8a] hover:bg-[#14dcb4]/30 transition-colors"
                >
                  <span className="tabular-nums">{edad}</span>
                  <Trash2 className="w-3 h-3 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          {/* Vista previa */}
          <div className="mt-4">
            {!hasProfile ? (
              <PreviewEmpty />
            ) : (
              <div className="rounded-2xl border border-[#0f514b]/10 bg-[#fbf8f3]/70 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#0f514b]/60">
                    Tu vista previa {seven.montoCLP > 0 && <>· 7%: {formatCLP(seven.montoCLP)}/mes</>}
                  </span>
                  {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-[#14dcb4]/30 border-t-[#14dcb4] animate-spin" />}
                </div>
                <div className="space-y-1.5">
                  {plans.map((p) => {
                    const uf = calcularPrecioPlanUF(p.base_plan_uf, p.ges_isapre_uf, beneficiarios);
                    const clp = Math.round(uf * ufValueCLP);
                    const fits = seven.montoCLP > 0 && clp <= seven.montoCLP;
                    const logo = p.logo_url && p.logo_url.startsWith('/') ? p.logo_url : (p.logo_url || '/logos/placeholder.png');
                    return (
                      <div key={p.id} className="flex items-center gap-2.5 rounded-xl bg-white border border-[#0f514b]/8 px-2.5 py-2">
                        <div className="relative h-6 w-16 shrink-0">
                          <Image src={logo} alt={p.isapre_name} fill className="object-contain object-left" sizes="64px" />
                        </div>
                        <span className="flex-1 min-w-0 truncate text-[11.5px] font-semibold text-[#0f514b] uppercase tracking-tight">{p.name}</span>
                        {fits && (
                          <span className="shrink-0 text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#0f9d8a] bg-[#14dcb4]/15 px-1.5 py-0.5 rounded">en tu 7%</span>
                        )}
                        <span className="shrink-0 text-right">
                          <span className="block text-[13px] font-extrabold text-[#0f9d8a] tabular-nums leading-none">UF {formatUF(uf)}</span>
                          <span className="block text-[10px] text-[#5a6b6a] tabular-nums">{formatCLP(clp)}/mes</span>
                        </span>
                      </div>
                    );
                  })}
                  {!loading && plans.length === 0 && (
                    <div className="text-[12px] text-[#5a6b6a] py-2 text-center">No pudimos cargar la vista previa, pero igual puedes ver el comparador completo.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Value props */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <ValueProp icon={<Sparkles className="w-3.5 h-3.5" />} title="Precio exacto" desc="Según tu edad y familia, no el 'desde'." />
            <ValueProp icon={<Wallet className="w-3.5 h-3.5" />} title="Tu 7% legal" desc="Cuánto puedes destinar a salud." />
            <ValueProp icon={<Users className="w-3.5 h-3.5" />} title="Incluye tu familia" desc="Precio total del grupo." />
          </div>

          {/* CTAs */}
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={verPlanes}
              className="w-full px-5 py-3.5 rounded-2xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] font-bold text-[15px] shadow-[0_14px_30px_rgba(20,220,180,0.4)] hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 group"
            >
              {hasProfile
                ? `Ver mis ${nPlanes ? nPlanes.toLocaleString('es-CL') + ' ' : ''}planes personalizados`
                : 'Ver el comparador de planes'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              type="button"
              onClick={cotizarExperto}
              className="w-full px-5 py-3 rounded-2xl border-2 border-[#0f514b]/12 bg-white text-[#0f514b] font-bold text-[14px] hover:border-[#14dcb4]/50 hover:bg-[#14dcb4]/[0.04] transition-all inline-flex items-center justify-center gap-2"
            >
              💬 Cotiza gratis con un experto
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="text-center text-[12.5px] font-semibold text-[#5a6b6a] hover:text-[#0f514b] transition-colors mt-0.5"
            >
              Explorar sin personalizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewEmpty() {
  return (
    <div className="rounded-2xl border border-dashed border-[#0f514b]/15 bg-[#fbf8f3]/50 p-3">
      <div className="space-y-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white/70 border border-[#0f514b]/6 px-2.5 py-2 blur-[1.5px] select-none">
            <div className="h-6 w-16 rounded bg-slate-200" />
            <div className="flex-1 h-3 rounded bg-slate-200" />
            <div className="h-4 w-14 rounded bg-[#14dcb4]/30" />
          </div>
        ))}
      </div>
      <p className="text-[12px] text-[#5a6b6a] text-center mt-2 font-medium">
        Ingresa tu sueldo y edad para ver tus planes a precio real ↑
      </p>
    </div>
  );
}

function ValueProp({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-[#0f514b]/8 bg-white p-2.5">
      <div className="w-6 h-6 rounded-lg bg-[#14dcb4]/15 text-[#0f9d8a] flex items-center justify-center mb-1.5">{icon}</div>
      <div className="text-[11px] font-bold text-[#0f514b] leading-tight">{title}</div>
      <div className="text-[10px] text-[#5a6b6a] leading-tight mt-0.5">{desc}</div>
    </div>
  );
}
