import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { InternalGuidesPanel } from "@/components/seo/internal-guides-panel";
import WhatsAppCTA from "@/components/landing/whatsapp-cta";
import { getIsapres, getPlanes, getSiteMeta, type Plan } from "@/lib/api";
import { formatCLP, formatUF } from "@/lib/api";
import { ISAPRE_LANDING_INFO, ISAPRE_LANDING_SLUGS } from "@/lib/isapre-landings";

const BASE = "https://www.elige-tuplan.cl";

export function generateStaticParams() {
  return ISAPRE_LANDING_SLUGS
    .filter((slug) => slug !== "consalud")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const info = ISAPRE_LANDING_INFO[slug];
  if (!info) return {};

  const title = `Planes ${info.name}: Precios, Coberturas y Sitio Oficial`;
  const description = `${info.description} Revisa planes destacados, criterios de comparación y el sitio oficial de ${info.name} para validar información institucional.`;
  const url = `${BASE}/isapres/${info.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
    },
  };
}

async function getLandingData(slug: string) {
  try {
    const [isapres, plans, meta] = await Promise.all([
      getIsapres(),
      getPlanes({ isapre: slug, limit: 6, sort: "precio_asc" }),
      getSiteMeta(),
    ]);
    const isapre = isapres.find((i) => i.slug === slug);
    return { isapre, plans: plans.items, total: plans.total, meta };
  } catch {
    return {
      isapre: null,
      plans: [] as Plan[],
      total: null,
      meta: { ufValueCLP: 40766, plansTotal: 2160, lastUpdate: "10 jun 2026" },
    };
  }
}

function maxCoverage(plan: Plan, kind: "hospitalaria" | "ambulatoria") {
  const values = plan[kind].map((c) => c.pct).filter((n) => Number.isFinite(n));
  return values.length ? Math.max(...values) : null;
}

function SmallPlanCard({ plan }: { plan: Plan }) {
  const hosp = maxCoverage(plan, "hospitalaria");
  const amb = maxCoverage(plan, "ambulatoria");

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[15px] font-extrabold uppercase leading-snug text-[#0f514b]">
            {plan.name}
          </h3>
          {plan.codigo_plan && <p className="mt-1 font-mono text-[11px] text-slate-400">{plan.codigo_plan}</p>}
        </div>
        {plan.modalidad && (
          <span className="shrink-0 rounded-lg bg-[#14dcb4]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0f9d8a]">
            {plan.modalidad}
          </span>
        )}
      </div>

      <div className="mb-4 rounded-xl bg-[#fbf8f3] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Precio base</p>
        <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0f514b]">
          UF {formatUF(plan.base_plan_uf ?? plan.price_uf)}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{formatCLP(plan.price_clp)} aprox.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hosp.</p>
          <p className="mt-1 text-xl font-extrabold text-[#0f514b]">{hosp != null ? `${hosp}%` : "N/D"}</p>
        </div>
        <div className="rounded-xl border border-slate-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Amb.</p>
          <p className="mt-1 text-xl font-extrabold text-[#0f514b]">{amb != null ? `${amb}%` : "N/D"}</p>
        </div>
      </div>
    </article>
  );
}

export default async function IsapreLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const info = ISAPRE_LANDING_INFO[slug];
  if (!info) notFound();

  const { isapre, plans, total, meta } = await getLandingData(slug);
  const planCount = isapre?.plan_count ?? total;
  const url = `${BASE}/isapres/${info.slug}`;
  const waMessage = `Hola, quiero cotizar o comparar planes ${info.name}.`;
  const faqs = [
    {
      question: `¿Dónde puedo comparar planes ${info.name}?`,
      answer: `En EligeTuPlan puedes comparar planes ${info.name} por precio, cobertura, modalidad y red de atención, y luego revisar el detalle en el sitio oficial de la Isapre.`,
    },
    {
      question: `¿Cuál es el sitio oficial de ${info.name}?`,
      answer: `El sitio oficial de ${info.name} es ${info.officialLabel}. Incluimos ese enlace para que puedas validar información institucional directamente con la Isapre.`,
    },
    {
      question: `¿Puedo cotizar ${info.name} online?`,
      answer: "Sí. Puedes revisar planes, comparar opciones y pedir asesoría gratuita por WhatsApp o formulario.",
    },
  ];

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: BASE },
          { name: "Isapres", url: `${BASE}/comparar/isapres` },
          { name: info.name, url },
        ]}
      />
      <FAQPageSchema
        items={faqs}
        name={`Preguntas frecuentes sobre planes ${info.name}`}
        url={url}
      />

      <main className="bg-[#fbf8f3] text-[#1e2a2a]">
        <section className="bg-[#0f514b] text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-6 md:grid-cols-[1.08fr_0.92fr] md:py-20 lg:px-10">
            <div>
              <nav className="mb-6 text-sm font-medium text-white/60">
                <Link href="/" className="no-underline hover:text-white">Inicio</Link>
                <span className="mx-2">/</span>
                <Link href="/comparar/isapres" className="no-underline hover:text-white">Isapres</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{info.name}</span>
              </nav>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#14dcb4]/35 bg-[#14dcb4]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#14dcb4]">
                <CheckCircle className="h-3.5 w-3.5" /> Isapre y sitio oficial
              </div>
              <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.05] sm:text-[48px]">
                Planes {info.name}: precios, coberturas y sitio oficial
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/80 sm:text-[18px]">
                Esta página concentra planes destacados de {info.name}, datos referenciales del
                comparador y acceso a su sitio oficial para validar información institucional.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/comparar/isapres?isapre=${info.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white no-underline shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
                >
                  Ver planes {info.name} en el comparador <ArrowRight className="h-5 w-5" />
                </Link>
                <WhatsAppCTA source="asesor_isapre" message={waMessage} label="Cotizar por WhatsApp" />
              </div>
            </div>

            <aside className="rounded-2xl border border-white/12 bg-white/8 p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="relative h-14 w-36 rounded-xl bg-white p-3">
                  <Image src={info.logo} alt={info.name} fill sizes="144px" className="object-contain p-3" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">Isapre</p>
                  <p className="text-xl font-extrabold">{info.name}</p>
                </div>
              </div>
              <a
                href={info.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#14dcb4]/25 bg-[#14dcb4]/10 px-4 py-3 text-white no-underline transition-colors hover:bg-[#14dcb4]/15"
              >
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[#14dcb4]">
                    Sitio oficial
                  </span>
                  <span className="text-sm font-bold">{info.officialLabel}</span>
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

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-10">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
                Vista rápida
              </p>
              <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
                Planes {info.name} destacados
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Muestra inicial ordenada por precio base. Para filtros completos, cálculo de 7%
                y clínicas, entra al comparador filtrado.
              </p>
            </div>
            <Link
              href={`/comparar/isapres?isapre=${info.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#14dcb4]/40 px-5 py-3 text-sm font-bold text-[#0f514b] no-underline hover:bg-[#14dcb4]/10"
            >
              Ver todos los planes {info.name} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {plans.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.map((plan) => <SmallPlanCard key={plan.id} plan={plan} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-[#14dcb4]" />
              <h3 className="text-lg font-extrabold text-[#0f514b]">No pudimos cargar planes en este momento</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
                Cuando el backend este disponible, esta seccion mostrara planes reales de {info.name}.
              </p>
            </div>
          )}
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 md:grid-cols-[0.9fr_1.1fr] lg:px-10">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
                Fuente institucional
              </p>
              <h2 className="text-2xl font-extrabold leading-tight text-[#0f514b] sm:text-3xl">
                También enlazamos al sitio oficial
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Esta landing ayuda a comparar planes con una mirada comercial y de usuario. Para
                información institucional, canales oficiales y documentos propios de la Isapre,
                puedes validar directamente en {info.officialLabel}.
              </p>
            </div>
            <a
              href={info.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-2xl border border-[#14dcb4]/25 bg-[#14dcb4]/8 p-6 text-[#0f514b] no-underline hover:bg-[#14dcb4]/12"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-32 rounded-xl bg-white p-3">
                  <Image src={info.logo} alt={info.name} fill sizes="128px" className="object-contain p-3" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f9d8a]">Sitio oficial</p>
                  <p className="text-lg font-extrabold">{info.officialLabel}</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 shrink-0 text-[#0f9d8a]" />
            </a>
          </div>
        </section>

        <InternalGuidesPanel
          title={`Guías relacionadas para comparar ${info.name}`}
          description={`Si estás revisando ${info.name}, también puede servirte comparar por perfil, presupuesto o etapa de vida antes de cotizar.`}
          currentHref={`/isapres/${info.slug}`}
        />

        <section className="mx-auto max-w-4xl px-5 py-16 sm:px-6 lg:px-10">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
            Preguntas frecuentes sobre {info.name}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
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
              <ShieldCheck className="mb-3 h-7 w-7 text-[#14dcb4]" />
              <h2 className="text-2xl font-extrabold sm:text-3xl">¿Quieres revisar un plan {info.name}?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                Compara por tu cuenta o escribe a un asesor para revisar precio, cobertura y si
                conviene según tu perfil.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href={`/comparar/isapres?isapre=${info.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-[#0f514b] no-underline hover:bg-white/90"
              >
                Comparar planes {info.name} <ArrowRight className="h-5 w-5" />
              </Link>
              <WhatsAppCTA source="asesor_isapre" message={waMessage} label="Hablar con asesor" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
