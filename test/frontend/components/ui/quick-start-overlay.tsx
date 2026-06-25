'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  MessagesSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  X,
} from 'lucide-react';
import {
  calcularPrecioPlanUF,
  calcularSeptimoLegal,
  getFactor,
  serializeBeneficiarios,
  type Beneficiario,
} from '@/lib/factores';
import { formatCLP, formatUF, getPlanes } from '@/lib/api';
import { useMeta } from '@/lib/meta-context';
import { LEAD_FORM_TOKEN, LEAD_SHEETS_URL as SHEETS_URL } from '@/lib/lead';

const QUALIFYING = ['/', '/comparar/isapres'];
const seenKey = (path: string) => `etp_qs_seen:${path}`;

type PreviewPlan = {
  id: string;
  name: string;
  isapreName: string;
  logoUrl: string;
  basePlanUf: number;
  gesIsapreUf: number;
};

// Snapshot liviano de planes reales. Sirve solo como muestra inmediata; el comparador
// consulta el catálogo vigente al entrar. Precios base capturados en junio de 2026.
const SNAPSHOT_PLANS: PreviewPlan[] = [
  {
    id: '3fa805a8-c289-4fc3-92f0-df8586016cf2',
    name: 'Salud Conecta Clásico 00/2601',
    isapreName: 'Banmédica',
    logoUrl: '/logos/banmedica-logo.png',
    basePlanUf: 0.94,
    gesIsapreUf: 0.778,
  },
  {
    id: '00e7770a-bf31-498b-91fe-fd4357a950e9',
    name: 'Core 10 01 26',
    isapreName: 'Consalud',
    logoUrl: '/logos/logo_consalud.png',
    basePlanUf: 1.16,
    gesIsapreUf: 0.731,
  },
  {
    id: 'e5b87ad5-165a-4908-96b3-f4fba750a054',
    name: 'Campus Bupa Max 100 D25',
    isapreName: 'Cruz Blanca',
    logoUrl: '/logos/logo_cruzblanca.png',
    basePlanUf: 1.09,
    gesIsapreUf: 0.971,
  },
];

function markSeen(path: string) {
  try {
    sessionStorage.setItem(seenKey(path), '1');
  } catch {
    // sessionStorage no está disponible durante SSR o en navegadores restringidos.
  }
}

export default function QuickStartOverlay() {
  const pathname = usePathname();
  const router = useRouter();
  const { ufValueCLP, topeImponibleUF } = useMeta();

  const [open, setOpen] = useState(false);
  const [salary, setSalary] = useState(0);
  const [salaryDisplay, setSalaryDisplay] = useState('');
  const [age, setAge] = useState<number | null>(null);
  const [ageInput, setAgeInput] = useState('');
  const [cargas, setCargas] = useState<number[]>([]);
  const [cargaInput, setCargaInput] = useState('');
  const [showLeadForm, setShowLeadForm] = useState(false);
  // Muestra de planes: arranca en SNAPSHOT_PLANS (instantáneo) y se reemplaza por planes
  // vigentes (los más baratos) cuando el fetch responde → la vista previa nunca queda vieja.
  const [livePlans, setLivePlans] = useState<PreviewPlan[] | null>(null);

  function closeOverlay() {
    // El componente vive en el layout y puede sobrevivir a una navegación. Resetear
    // el paso evita que una apertura posterior quede atrapada en el formulario.
    setShowLeadForm(false);
    setOpen(false);
  }

  // El timeout de 0 evita bloquear el primer render y abre apenas termina la hidratación.
  useEffect(() => {
    if (!QUALIFYING.includes(pathname)) return;
    let seen = true;
    try {
      seen = sessionStorage.getItem(seenKey(pathname)) === '1';
    } catch {
      seen = false;
    }
    if (seen) return;
    const timer = window.setTimeout(() => {
      setShowLeadForm(false);
      setSalary(0);
      setSalaryDisplay('');
      setAge(null);
      setAgeInput('');
      setCargas([]);
      setCargaInput('');
      setLivePlans(null);
      setOpen(true);
      markSeen(pathname);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLeadForm(false);
        setOpen(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  // Refresca la muestra con planes vigentes (los más baratos) al abrir. Mientras carga
  // —o si la API falla— se ve SNAPSHOT_PLANS al instante. Así no se necesita actualizar
  // los precios hardcodeados a mano: el catálogo manda.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getPlanes({ limit: 14, sort: 'precio_asc' })
      .then((res) => {
        if (cancelled) return;
        const mapped: PreviewPlan[] = res.items
          .filter((plan) => (plan.base_plan_uf ?? plan.price_uf) != null)
          .map((plan) => ({
            id: plan.id,
            name: plan.name,
            isapreName: plan.isapre_name,
            logoUrl: plan.logo_url && plan.logo_url.startsWith('/') ? plan.logo_url : (plan.logo_url || '/logos/placeholder.png'),
            basePlanUf: plan.base_plan_uf ?? plan.price_uf,
            gesIsapreUf: plan.ges_isapre_uf ?? 0,
          }));
        if (mapped.length >= 3) setLivePlans(mapped);
      })
      .catch(() => { /* se queda con el snapshot */ });
    return () => { cancelled = true; };
  }, [open]);

  const hasProfile = salary > 0 && age != null;

  const beneficiarios = useMemo<Beneficiario[]>(() => {
    const titularAge = age ?? 34;
    return [
      { id: 'cot', edad: titularAge, tipo: 'cotizante' },
      ...cargas.map((cargaAge, index) => ({
        id: `crg-${index}`,
        edad: cargaAge,
        tipo: 'carga' as const,
      })),
    ];
  }, [age, cargas]);

  const previewPlans = useMemo(
    () => (livePlans ?? SNAPSHOT_PLANS)
      .map((plan) => ({
        ...plan,
        priceUf: calcularPrecioPlanUF(plan.basePlanUf, plan.gesIsapreUf, beneficiarios),
      }))
      .sort((a, b) => a.priceUf - b.priceUf)
      .slice(0, 3),
    [livePlans, beneficiarios],
  );

  const seven = useMemo(
    () => calcularSeptimoLegal(salary, ufValueCLP, topeImponibleUF),
    [salary, ufValueCLP, topeImponibleUF],
  );

  if (!open) return null;

  function onSalary(raw: string) {
    const digits = raw.replace(/\D/g, '');
    const value = digits ? Math.min(parseInt(digits, 10), 99_999_999) : 0;
    setSalary(value);
    setSalaryDisplay(value ? value.toLocaleString('es-CL') : '');
  }

  function onAge(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 3);
    setAgeInput(digits);
    if (!digits) {
      setAge(null);
      setCargas([]);
      return;
    }
    const value = parseInt(digits, 10);
    setAge(value >= 0 && value <= 110 ? value : null);
  }

  function addCarga() {
    const value = parseInt(cargaInput, 10);
    if (!Number.isFinite(value) || value < 0 || value > 110) return;
    setCargas((current) => [...current, value]);
    setCargaInput('');
  }

  function verPlanes() {
    markSeen('/comparar/isapres');
    const params = new URLSearchParams();
    if (hasProfile) {
      params.set('sueldo_imponible_clp', String(salary));
      params.set('aplicar_tope_legal', 'true');
      params.set('ben', serializeBeneficiarios(beneficiarios));
    }
    closeOverlay();
    const query = params.toString();
    router.push(query ? `/comparar/isapres?${query}` : '/comparar/isapres');
  }

  function cotizarExperto() {
    setShowLeadForm(true);
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-2 sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-start-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#06201d]/55 backdrop-blur-md"
        onClick={closeOverlay}
        aria-label="Cerrar vista previa"
      />

      <section
        data-mobile-layout="compact-sheet"
        className="relative z-10 flex h-[min(88dvh,720px)] w-full max-w-[900px] flex-col overflow-hidden rounded-[22px] border border-white/20 bg-white shadow-[0_26px_80px_rgba(3,32,29,0.48)] sm:h-auto sm:max-h-[calc(100dvh-40px)] sm:rounded-[24px] sm:shadow-[0_30px_100px_rgba(3,32,29,0.55)]"
        style={{ animation: 'slide-up-fade 0.24s cubic-bezier(.2,.8,.2,1)' }}
      >
        <header className="relative shrink-0 bg-[#0f514b] px-4 py-3 pr-24 text-white sm:px-6 sm:pr-28">
          <button
            type="button"
            onClick={closeOverlay}
            aria-label="Cerrar"
            className="absolute right-3 top-3 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-white bg-white px-3 text-xs font-extrabold text-[#0f514b] shadow-[0_6px_18px_rgba(0,0,0,0.22)] ring-2 ring-white/25 transition hover:-translate-y-0.5 hover:bg-[#e9fbf7] hover:shadow-[0_9px_24px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14dcb4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f514b] sm:right-5"
          >
            <span>Salir</span>
            <X className="h-4 w-4" strokeWidth={2.8} />
          </button>
          <div className="flex items-center gap-3">
            {showLeadForm ? (
              <button
                type="button"
                onClick={() => setShowLeadForm(false)}
                aria-label="Volver a los planes"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/10 text-[11px] font-bold text-white transition hover:bg-white/20 sm:h-auto sm:w-auto sm:px-2.5 sm:py-2"
              >
                <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Volver</span>
              </button>
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#14dcb4] text-[#073d38]">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
            <div className="min-w-0">
              <p className="hidden text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#14dcb4] sm:block">
                {showLeadForm ? 'Asesoría gratuita' : 'Vista previa personalizada'}
              </p>
              <h2 id="quick-start-title" className="text-[17px] font-extrabold leading-tight sm:mt-0.5 sm:text-xl">
                <span className="sm:hidden">{showLeadForm ? 'Asesoría por WhatsApp' : 'Planes a tu precio real'}</span>
                <span className="hidden sm:inline">{showLeadForm ? 'Recibe opciones revisadas por WhatsApp' : 'Mira planes a tu precio real'}</span>
              </h2>
              <p className="mt-0.5 hidden truncate text-[11px] text-white/62 sm:block sm:text-xs">
                {showLeadForm
                  ? 'Deja tus datos y un experto revisará alternativas para tu perfil.'
                  : 'Ajusta edad, sueldo y grupo familiar para recalcular la muestra.'}
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overscroll-contain overflow-y-auto p-3 sm:p-5 md:p-6">
          {showLeadForm ? (
            <InlineLeadForm
              salary={salary}
              age={age}
              cargas={cargas}
              previewPlans={previewPlans}
              onBack={() => setShowLeadForm(false)}
              onClose={closeOverlay}
            />
          ) : (
          <div className="grid gap-4 md:grid-cols-[0.82fr_1.18fr] md:gap-6">
            <div>
              <div className="mb-2.5 flex items-center justify-between gap-3 sm:mb-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0f9d8a]">Personaliza la muestra</p>
                  <p className="mt-0.5 text-xs text-slate-500">Tus datos no se guardan.</p>
                </div>
                {age != null && (
                  <span className="rounded-full bg-[#14dcb4]/15 px-2.5 py-1 text-[10px] font-bold text-[#08796d]">
                    Factor {getFactor(age, 'cotizante').toFixed(2)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-[1.35fr_0.65fr] gap-2.5">
                <label>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">Sueldo bruto</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#0f514b]/55">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={salaryDisplay}
                      onChange={(event) => onSalary(event.target.value)}
                      placeholder="950.000"
                      aria-label="Sueldo bruto"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-7 pr-3 text-base font-bold text-[#0f514b] outline-none transition focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/10 sm:text-sm"
                    />
                  </div>
                </label>
                <label>
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">Edad</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ageInput}
                    onChange={(event) => onAge(event.target.value)}
                    placeholder="34"
                    aria-label="Tu edad"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base font-bold text-[#0f514b] outline-none transition focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/10 sm:text-sm"
                  />
                </label>
              </div>

              <div className="mt-3">
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                  Cargas <span className="font-medium normal-case tracking-normal text-slate-400">(opcional)</span>
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cargaInput}
                    onChange={(event) => setCargaInput(event.target.value.replace(/\D/g, '').slice(0, 3))}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addCarga();
                      }
                    }}
                    placeholder="Edad"
                    aria-label="Edad de la carga"
                    className="w-20 rounded-lg border border-slate-200 px-2.5 py-2 text-base font-bold text-[#0f514b] outline-none focus:border-[#14dcb4] sm:text-xs"
                  />
                  <button
                    type="button"
                    onClick={addCarga}
                    disabled={!cargaInput}
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-[#14dcb4]/15 px-3 py-2 text-xs font-bold text-[#08796d] transition hover:bg-[#14dcb4]/25 disabled:opacity-40"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Agregar
                  </button>
                  {cargas.map((cargaAge, index) => (
                    <button
                      key={`${cargaAge}-${index}`}
                      type="button"
                      onClick={() => setCargas((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      title="Quitar carga"
                      className="rounded-lg bg-[#0f514b] px-2.5 py-2 text-xs font-bold text-white"
                    >
                      {cargaAge} años ×
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-xl border border-[#14dcb4]/30 bg-[#e9fbf7] p-3 sm:mt-4">
                <div className="flex items-center gap-2 text-[#0f514b]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#14dcb4]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#08796d]">Tu 7% legal estimado</p>
                    <p className="text-base font-extrabold leading-tight">
                      {salary > 0 ? `${formatCLP(seven.montoCLP)} al mes` : 'Ingresa tu sueldo para calcularlo'}
                    </p>
                  </div>
                </div>
              </div>

              <ul className="mt-3 hidden gap-1.5 text-xs text-slate-600 sm:grid sm:mt-4">
                <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#0f9d8a]" /> Precio familiar, no el valor “desde”.</li>
                <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#0f9d8a]" /> Compara las siete Isapres sin costo.</li>
                <li className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-[#0f9d8a]" /> Puedes explorar sin dejar tus datos.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#fbf8f3] p-3 sm:p-4">
              <div className="mb-2.5 flex items-start justify-between gap-3 sm:mb-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#0f9d8a]">Muestra de planes reales</p>
                  <h3 className="mt-0.5 text-base font-extrabold text-[#0f514b]">
                    {age == null ? 'Ejemplo para una persona de 34 años' : 'Precio recalculado para tu perfil'}
                  </h3>
                </div>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                  Snapshot
                </span>
              </div>

              <div className="space-y-2">
                {previewPlans.map((plan) => {
                  const priceClp = Math.round(plan.priceUf * ufValueCLP);
                  const fits = hasProfile && seven.montoCLP > 0 && priceClp <= seven.montoCLP;
                  return (
                    <article key={plan.id} className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="relative h-7 w-16 shrink-0 sm:h-8 sm:w-[78px]">
                          <Image src={plan.logoUrl} alt={plan.isapreName} fill sizes="(max-width: 639px) 64px, 78px" className="object-contain object-left" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-extrabold uppercase tracking-tight text-[#0f514b] sm:text-xs">{plan.name}</p>
                          <p className="mt-0.5 text-[10px] font-medium text-slate-500">{plan.isapreName}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-extrabold leading-none text-[#0f9d8a] sm:text-sm">UF {formatUF(plan.priceUf)}</p>
                          <p className="mt-1 text-[10px] text-slate-500">{formatCLP(priceClp)}/mes</p>
                        </div>
                      </div>
                      {fits && (
                        <p className="mt-2 border-t border-slate-100 pt-2 text-[10px] font-bold text-[#08796d]">
                          ✓ Este valor está dentro de tu 7% estimado
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>

              <p className="mt-2.5 text-[9px] leading-relaxed text-slate-500 sm:mt-3 sm:text-[10px]">
                Muestra referencial guardada para carga instantánea. El comparador consulta precios y disponibilidad vigentes.
              </p>
            </div>
          </div>
          )}
        </div>

        {!showLeadForm && (
        <footer className="shrink-0 border-t border-slate-200 bg-white px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:py-4">
          <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-center">
            <div className="relative isolate col-span-2 sm:flex-1">
              <span className="pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-[#14dcb4]/35 animate-[wsp-ping_1.8s_ease-out_infinite]" />
              <button
                type="button"
                onClick={cotizarExperto}
                className="group relative inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl border border-[#14dcb4]/40 bg-[#0f514b] px-3 py-2 text-white shadow-[0_14px_32px_rgba(15,81,75,0.36)] transition hover:-translate-y-0.5 hover:bg-[#0b4540] hover:shadow-[0_18px_40px_rgba(15,81,75,0.46)] sm:gap-3 sm:px-4 sm:py-2.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14dcb4] text-[#062f2b] shadow-[0_8px_20px_rgba(20,220,180,0.32)] sm:h-10 sm:w-10">
                  <MessagesSquare className="h-5 w-5" strokeWidth={2.4} />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-extrabold leading-tight sm:text-[15px]">Recibe asesoría de un experto</span>
                  <span className="mt-0.5 block text-[9px] font-semibold text-white/68 sm:mt-1 sm:text-[10px]">Contacto inmediato · Sin compromiso · 24h</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <button
              type="button"
              onClick={verPlanes}
              className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#14dcb4]/70 bg-[#dff9f3] px-4 py-2.5 text-sm font-extrabold text-[#0f514b] shadow-[0_8px_20px_rgba(20,220,180,0.18)] transition hover:-translate-y-0.5 hover:border-[#14dcb4] hover:bg-[#c9f5eb] hover:shadow-[0_12px_26px_rgba(20,220,180,0.28)] sm:px-6 sm:py-3"
            >
              Ver comparador
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={closeOverlay}
              className="min-h-11 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-[#0f514b] sm:px-2"
            >
              Ahora no
            </button>
          </div>
        </footer>
        )}
      </section>
    </div>
  );
}

type InlineLeadFormProps = {
  salary: number;
  age: number | null;
  cargas: number[];
  previewPlans: Array<PreviewPlan & { priceUf: number }>;
  onBack: () => void;
  onClose: () => void;
};

function InlineLeadForm({
  salary,
  age,
  cargas,
  previewPlans,
  onBack,
  onClose,
}: InlineLeadFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rut, setRut] = useState('');
  const [edadInput, setEdadInput] = useState(age != null ? String(age) : '');
  const [hp, setHp] = useState(''); // honeypot anti-bot (oculto)
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      setError('Ingresa tu nombre para continuar.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 8) {
      setError('Ingresa un número de WhatsApp válido.');
      return;
    }
    if (rut.replace(/[.\-\s]/g, '').length < 7) {
      setError('Ingresa tu RUT para continuar.');
      return;
    }
    const edadNum = parseInt(edadInput, 10);
    if (!Number.isFinite(edadNum) || edadNum < 18 || edadNum > 100) {
      setError('Ingresa una edad válida (18 a 100).');
      return;
    }

    setSubmitting(true);
    setError('');
    const profileSummary = [
      salary > 0 ? `Sueldo: ${formatCLP(salary)}` : 'Sueldo: no informado',
      `Edad: ${edadInput.trim() || (age != null ? String(age) : 'no informada')}`,
      cargas.length ? `Cargas: ${cargas.join(', ')}` : 'Sin cargas informadas',
      `Snapshot: ${previewPlans.map((plan) => `${plan.isapreName} ${plan.name}`).join(' | ')}`,
    ].join(' · ');

    try {
      if (process.env.NODE_ENV === 'development') {
        await new Promise((resolve) => window.setTimeout(resolve, 550));
      } else {
        await fetch(SHEETS_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: name.trim(),
            rut: rut.trim(),
            correo: '',
            telefono: phone.trim(),
            region: '',
            edad: edadInput.trim(),
            planActual: '',
            observaciones: `Lead QuickStart Overlay · ${profileSummary}`,
            planCotizado: 'Tres opciones personalizadas',
            _token: LEAD_FORM_TOKEN,
            _hp: hp,
          }),
        });
      }
      setSubmitted(true);
    } catch {
      setError('No pudimos enviar tus datos. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[280px] max-w-lg flex-col items-center justify-center px-3 py-5 text-center sm:min-h-[330px] sm:py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14dcb4]/15 text-[#0f9d8a]">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="mt-5 text-2xl font-extrabold text-[#0f514b]">¡Solicitud recibida!</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600">
          Un experto revisará alternativas para tu perfil y te contactará por WhatsApp.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="mt-3 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700">
            Modo local: envío simulado, no se agregó a la planilla.
          </p>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-xl bg-[#0f514b] px-6 py-3 text-sm font-bold text-white"
        >
          Seguir explorando
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-[#14dcb4]/30 bg-[#e9fbf7] px-3 py-2.5 text-xs text-[#0f514b] md:hidden">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#0f9d8a]" />
        <span><strong>Gratis y sin compromiso.</strong> Usaremos el perfil que ya completaste.</span>
      </div>
      <div className="grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:gap-7">
      <aside className="hidden rounded-2xl bg-[#e9fbf7] p-5 md:block">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#08796d]">Lo hacemos fácil</p>
        <h3 className="mt-2 text-xl font-extrabold leading-tight text-[#0f514b]">
          Recibe una selección revisada para ti
        </h3>
        <ul className="mt-5 space-y-3 text-sm text-slate-700">
          <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9d8a]" /> Comparamos precio, cobertura y red.</li>
          <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9d8a]" /> Usamos el perfil que ya completaste.</li>
          <li className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9d8a]" /> Te contactamos por WhatsApp.</li>
        </ul>
        <div className="mt-5 rounded-xl border border-[#14dcb4]/30 bg-white/70 p-3 text-xs leading-relaxed text-[#0f514b]">
          <strong>Gratis y sin compromiso.</strong><br />Respuesta estimada en menos de 24 horas.
        </div>
      </aside>

      <form onSubmit={submitLead} noValidate className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 md:p-2">
        {/* Honeypot anti-bot: invisible para humanos */}
        <input
          type="text"
          value={hp}
          onChange={(event) => setHp(event.target.value)}
          name="empresa"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0"
        />
        <button
          type="button"
          onClick={onBack}
          className="mb-4 hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-[#0f514b] transition hover:border-[#14dcb4] hover:bg-[#e9fbf7] md:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a los planes
        </button>

        <div className="grid gap-3">
          <label>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <User className="h-3.5 w-3.5" /> Tu nombre
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => { setName(event.target.value); setError(''); }}
              placeholder="Ej: Daniela Soto"
              autoComplete="name"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-base text-slate-800 outline-none transition focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/10 sm:text-sm"
            />
          </label>

          <label>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Phone className="h-3.5 w-3.5" /> WhatsApp
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => { setPhone(event.target.value); setError(''); }}
              placeholder="Ej: +56 9 8765 4321"
              autoComplete="tel"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-base text-slate-800 outline-none transition focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/10 sm:text-sm"
            />
          </label>

          <div className="grid grid-cols-[1.4fr_0.6fr] gap-3">
            <label>
              <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5" /> RUT
              </span>
              <input
                type="text"
                value={rut}
                onChange={(event) => { setRut(event.target.value); setError(''); }}
                placeholder="Ej: 12.345.678-9"
                inputMode="text"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-base text-slate-800 outline-none transition focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/10 sm:text-sm"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Edad</span>
              <input
                type="text"
                inputMode="numeric"
                value={edadInput}
                onChange={(event) => { setEdadInput(event.target.value.replace(/\D/g, '').slice(0, 3)); setError(''); }}
                placeholder="34"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-base font-bold tabular-nums text-slate-800 outline-none transition focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/10 sm:text-sm"
              />
            </label>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="group mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#14dcb4]/40 bg-[#0f514b] px-4 py-3 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(15,81,75,0.34)] transition hover:-translate-y-0.5 hover:bg-[#0b4540] hover:shadow-[0_16px_36px_rgba(15,81,75,0.44)] disabled:translate-y-0 disabled:opacity-60 sm:px-5 sm:py-3.5 sm:text-[15px]"
        >
          {submitting ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#062f2b]/25 border-t-[#062f2b]" /> Enviando...</>
          ) : (
            <><MessagesSquare className="h-4 w-4" /> Recibe asesoría de un experto</>
          )}
        </button>
        <p className="mt-3 flex items-start justify-center gap-1.5 text-center text-[10px] leading-relaxed text-slate-400">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0f9d8a]" />
          Tus datos se usan solo para esta asesoría. Sin spam.
        </p>
      </form>
    </div>
    </>
  );
}
