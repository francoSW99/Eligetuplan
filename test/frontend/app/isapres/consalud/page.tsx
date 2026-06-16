import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, ExternalLink, FileText, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { InternalGuidesPanel } from "@/components/seo/internal-guides-panel";
import { TrackedSeoLink } from "@/components/seo/tracked-seo-link";
import WhatsAppCTA from "@/components/landing/whatsapp-cta";
import { getIsapres, getPlanes, getSiteMeta, type Plan } from "@/lib/api";
import { formatCLP, formatUF } from "@/lib/api";
import { ISAPRE_LANDING_INFO } from "@/lib/isapre-landings";

const URL = "https://www.elige-tuplan.cl/isapres/consalud";
const CONSALUD_SLUG = "consalud";
const CONSALUD_INFO = ISAPRE_LANDING_INFO.consalud;

export const metadata: Metadata = {
  title: "Planes Consalud: Precios, Coberturas y Sitio Oficial",
  description:
    "Revisa planes Consalud vigentes por precio en UF, cobertura hospitalaria y ambulatoria, modalidad, clínicas y sitio oficial para validar información institucional.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Planes Consalud: Precios, Coberturas y Sitio Oficial",
    description:
      "Revisa planes Consalud, criterios de comparación y el sitio oficial para validar información institucional.",
    url: URL,
    type: "website",
  },
};

const FAQS = [
  {
    question: "¿Dónde puedo comparar planes Consalud?",
    answer:
      "En EligeTuPlan puedes revisar planes Consalud vigentes, comparar precios en UF, cobertura hospitalaria, cobertura ambulatoria, modalidad y clínicas asociadas.",
  },
  {
    question: "¿Cuánto cuesta un plan Consalud?",
    answer:
      "El precio depende del plan, la UF del día, tu edad, tus cargas y el GES. En esta página mostramos precios base referenciales y puedes usar el comparador para calcular opciones según tu 7%.",
  },
  {
    question: "¿Puedo cotizar un plan Consalud online?",
    answer:
      "Sí. Puedes comparar planes en línea y luego solicitar asesoría gratuita por WhatsApp o formulario para revisar tu caso antes de contratar.",
  },
  {
    question: "Los datos de planes Consalud son oficiales?",
    answer:
      "Usamos datos publicos de la Superintendencia de Salud y enriquecimiento operativo de fuentes del mercado para mostrar precios, coberturas, modalidad y red de prestadores.",
  },
];

async function getConsaludData() {
  try {
    const [isapres, plans, meta] = await Promise.all([
      getIsapres(),
      getPlanes({ isapre: CONSALUD_SLUG, limit: 6, sort: "precio_asc" }),
      getSiteMeta(),
    ]);
    const consalud = isapres.find((i) => i.slug === CONSALUD_SLUG);
    return { consalud, plans: plans.items, total: plans.total, meta };
  } catch {
    return {
      consalud: null,
      plans: [] as Plan[],
      total: null,
      meta: { ufValueCLP: 40766, plansTotal: 2160, lastUpdate: "10 jun 2026" },
    };
  }
}

function getCoverage(plan: Plan, kind: "hospitalaria" | "ambulatoria") {
  const values = plan[kind].map((c) => c.pct).filter((n) => Number.isFinite(n));
  if (!values.length) return null;
  return Math.max(...values);
}

function PlanPreviewCard({ plan }: { plan: Plan }) {
  const hosp = getCoverage(plan, "hospitalaria");
  const amb = getCoverage(plan, "ambulatoria");

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f9d8a]">
            Consalud
          </p>
          <h3 className="line-clamp-2 text-[15px] font-extrabold uppercase leading-snug text-[#0f514b]">
            {plan.name}
          </h3>
          {plan.codigo_plan && (
            <p className="mt-1 font-mono text-[11px] text-slate-400">{plan.codigo_plan}</p>
          )}
        </div>
        {plan.modalidad && (
          <span className="shrink-0 rounded-lg bg-[#14dcb4]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0f9d8a]">
            {plan.modalidad}
          </span>
        )}
      </div>

      <div className="mb-4 rounded-xl bg-[#fbf8f3] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Precio base</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-extrabold tabular-nums text-[#0f514b]">
            UF {formatUF(plan.base_plan_uf ?? plan.price_uf)}
          </span>
          <span className="text-sm text-slate-500">/mes</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500">{formatCLP(plan.price_clp)} aprox.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hospitalaria</p>
          <p className="mt-1 text-xl font-extrabold text-[#0f514b]">{hosp != null ? `${hosp}%` : "N/D"}</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Ambulatoria</p>
          <p className="mt-1 text-xl font-extrabold text-[#0f514b]">{amb != null ? `${amb}%` : "N/D"}</p>
        </div>
      </div>
    </article>
  );
}

export default async function ConsaludLandingPage() {
  const { consalud, plans, total, meta } = await getConsaludData();
  const planCount = consalud?.plan_count ?? total;
  const waMessage = "Hola, quiero cotizar o comparar planes Consalud.";

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: "https://www.elige-tuplan.cl" },
          { name: "Isapres", url: "https://www.elige-tuplan.cl/comparar/isapres" },
          { name: "Consalud", url: URL },
        ]}
      />
      <FAQPageSchema
        items={FAQS}
        name="Preguntas frecuentes sobre planes Consalud"
        url={URL}
      />

      <main className="bg-[#fbf8f3] text-[#1e2a2a]">
        <section className="bg-[#0f514b] text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-20 lg:px-10">
            <div>
              <nav className="mb-6 text-sm font-medium text-white/60">
                <Link href="/" className="no-underline hover:text-white">Inicio</Link>
                <span className="mx-2">/</span>
                <Link href="/comparar/isapres" className="no-underline hover:text-white">Isapres</Link>
                <span className="mx-2">/</span>
                <span className="text-white">Consalud</span>
              </nav>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#14dcb4]/35 bg-[#14dcb4]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#14dcb4]">
                <CheckCircle className="h-3.5 w-3.5" /> Datos de planes vigentes
              </div>
              <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.05] sm:text-[48px]">
                Planes Consalud: precios, coberturas y sitio oficial
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/80 sm:text-[18px]">
                Revisa planes Consalud vigentes, compara precio en UF, cobertura hospitalaria y
                ambulatoria, modalidad y accede al sitio oficial para validar información institucional.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedSeoLink
                  href="/comparar/isapres?isapre=consalud"
                  source="isapre_landing"
                  label="Ver planes Consalud en el comparador"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white no-underline shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
                >
                  Ver planes Consalud en el comparador <ArrowRight className="h-5 w-5" />
                </TrackedSeoLink>
                <WhatsAppCTA source="asesor_isapre" message={waMessage} label="Cotizar por WhatsApp" />
              </div>
            </div>

            <aside className="rounded-2xl border border-white/12 bg-white/8 p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-14 w-36 rounded-xl bg-white p-3">
                  <Image src="/logos/logo_consalud.png" alt="Consalud" fill sizes="144px" className="object-contain p-3" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Isapre</p>
                  <p className="text-xl font-extrabold">Consalud</p>
                </div>
              </div>
              <a
                href={CONSALUD_INFO.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#14dcb4]/25 bg-[#14dcb4]/10 px-4 py-3 text-white no-underline transition-colors hover:bg-[#14dcb4]/15"
              >
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#14dcb4]">
                    Sitio oficial
                  </span>
                  <span className="text-sm font-bold">{CONSALUD_INFO.officialLabel}</span>
                </span>
                <ExternalLink className="h-4 w-4 text-[#14dcb4]" />
              </a>
              <dl className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Planes</dt>
                  <dd className="mt-1 text-2xl font-extrabold">{planCount?.toLocaleString("es-CL") ?? "N/D"}</dd>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">UF usada</dt>
                  <dd className="mt-1 text-2xl font-extrabold">{formatCLP(meta.ufValueCLP)}</dd>
                </div>
                <div className="col-span-2 rounded-xl bg-white/10 p-4">
                  <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Actualización</dt>
                  <dd className="mt-1 text-base font-bold">{meta.lastUpdate}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-8 sm:grid-cols-3 sm:px-6 lg:px-10">
            {[
              { icon: Search, title: "Compara precio y cobertura", text: "Filtra planes Consalud por UF, modalidad, cobertura y clínicas." },
              { icon: ShieldCheck, title: "Calcula tu 7%", text: "Usa tu sueldo imponible para saber que planes calzan con tu presupuesto." },
              { icon: Stethoscope, title: "Cotiza con asesoría", text: "Un asesor te ayuda a revisar el plan antes de avanzar." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#14dcb4]/12 text-[#0f9d8a]">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-extrabold text-[#0f514b]">{item.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
                Vista rápida
              </p>
              <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
                Planes Consalud destacados
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Estos son algunos planes Consalud ordenados por precio base. Para calcular tu
                precio exacto según beneficiarios, cargas y 7%, entra al comparador.
              </p>
            </div>
            <TrackedSeoLink
              href="/comparar/isapres?isapre=consalud"
              source="isapre_landing"
              label="Ver todos los planes Consalud"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#14dcb4]/40 px-5 py-3 text-sm font-bold text-[#0f514b] no-underline hover:bg-[#14dcb4]/10"
            >
              Ver todos los planes Consalud <ArrowRight className="h-4 w-4" />
            </TrackedSeoLink>
          </div>

          {plans.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => <PlanPreviewCard key={plan.id} plan={plan} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-[#14dcb4]" />
              <h3 className="text-lg font-extrabold text-[#0f514b]">No pudimos cargar los planes en este momento</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                Cuando el backend esté activo, esta sección mostrará planes Consalud reales desde el comparador.
              </p>
            </div>
          )}
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-10">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
                Antes de contratar
              </p>
              <h2 className="text-2xl font-extrabold leading-tight text-[#0f514b] sm:text-3xl">
                Qué mirar en un plan Consalud
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                El precio no lo es todo. Dos planes con un valor parecido pueden tener redes,
                coberturas y topes muy distintos. Por eso conviene revisar el plan completo antes
                de contratar.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Precio base en UF y GES de la Isapre",
                "Cobertura hospitalaria y ambulatoria",
                "Clínicas o prestadores preferentes",
                "Modalidad: preferente, libre elección o cerrado",
                "Cobertura con parto si aplica a tu perfil",
                "Si el precio final calza con tu 7%",
              ].map((text) => (
                <div key={text} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] p-4">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#14dcb4]" />
                  <p className="text-sm font-semibold leading-relaxed text-[#0f514b]">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <InternalGuidesPanel
          title="Guías relacionadas para comparar Consalud"
          description="Si estás revisando Consalud, también puede servirte comparar por familia, embarazo, independientes o cambio de Isapre antes de cotizar."
          currentHref="/isapres/consalud"
          trackingSource="isapre_landing"
        />

        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-10">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
            Preguntas frecuentes sobre planes Consalud
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-[16px] font-extrabold text-[#0f514b]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#0f514b] px-5 py-16 text-white sm:px-6 lg:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#14dcb4]">
                Cotización gratuita
              </p>
              <h2 className="text-2xl font-extrabold sm:text-3xl">¿Quieres revisar un plan Consalud?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                Compara por tu cuenta o escribe a un asesor para revisar precio, cobertura y si
                conviene según tu perfil.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <TrackedSeoLink
                href="/comparar/isapres?isapre=consalud"
                source="isapre_landing"
                label="Comparar planes Consalud"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-[#0f514b] no-underline hover:bg-white/90"
              >
                Comparar planes Consalud <ArrowRight className="h-5 w-5" />
              </TrackedSeoLink>
              <WhatsAppCTA source="asesor_isapre" message={waMessage} label="Hablar con asesor" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
