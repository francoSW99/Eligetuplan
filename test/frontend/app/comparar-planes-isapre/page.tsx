import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, HeartPulse, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { FeaturedPlans, MarketSnapshot, OfficialSourcesPanel } from "@/components/seo/landing-data-panels";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { TrackedSeoLink } from "@/components/seo/tracked-seo-link";
import WhatsAppCTA from "@/components/landing/whatsapp-cta";
import { getIsapres, getPlanes, getSiteMeta, type Isapre, type Plan, type PlansResponse } from "@/lib/api";
import { HOME_SEO_GUIDES, SECONDARY_SEO_GUIDES } from "@/lib/seo-landings";

const URL = "https://www.elige-tuplan.cl/comparar-planes-isapre";

export const metadata: Metadata = {
  title: "Cómo Comparar Planes de Isapre | Guía de Precios y Coberturas",
  description:
    "Guía para comparar planes de Isapre antes de cotizar: precio en UF, 7%, coberturas, red, modalidad, topes y documentos oficiales.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Cómo Comparar Planes de Isapre | Guía de Precios y Coberturas",
    description:
      "Ordena precio, cobertura, red, modalidad y fuentes oficiales antes de usar el comparador.",
    url: URL,
    type: "website",
  },
};

const FAQS = [
  {
    question: "¿Qué debo comparar antes de elegir un plan de Isapre?",
    answer:
      "Precio final, cobertura hospitalaria y ambulatoria, clínicas preferidas, topes, modalidad y si el valor calza con tu 7% legal.",
  },
  {
    question: "¿Existe una mejor Isapre para todos?",
    answer:
      "No. La mejor opción depende de tu edad, renta, cargas, comuna, uso esperado y red de atención que necesitas.",
  },
  {
    question: "¿Puedo comparar y luego hablar con un asesor?",
    answer:
      "Sí. Puedes revisar opciones en el comparador y pedir asesoría gratuita por WhatsApp o formulario.",
  },
];

const POINTS = [
  {
    icon: Search,
    title: "Precio y 7%",
    description: "Revisa si el plan cabe en tu cotización legal o si requiere adicional mensual.",
  },
  {
    icon: HeartPulse,
    title: "Cobertura real",
    description: "Compara hospitalario, ambulatorio, topes y prestaciones frecuentes.",
  },
  {
    icon: ShieldCheck,
    title: "Red y clínicas",
    description: "Prioriza los lugares donde tú o tu familia realmente se atenderían.",
  },
  {
    icon: SlidersHorizontal,
    title: "Modalidad",
    description: "Evalúa libre elección, preferente o cerrada según tu estilo de uso.",
  },
];

type CompareLandingData = {
  meta: Awaited<ReturnType<typeof getSiteMeta>>;
  isapres: Isapre[];
  plans: Plan[];
  response: Pick<PlansResponse, "total" | "price_min_clp" | "price_max_clp"> | null;
};

async function getCompareLandingData(): Promise<CompareLandingData> {
  const meta = await getSiteMeta();

  try {
    const [isapres, plansResponse] = await Promise.all([
      getIsapres(),
      getPlanes({ limit: 6, sort: "precio_asc" }),
    ]);

    return {
      meta,
      isapres,
      plans: plansResponse.items,
      response: {
        total: plansResponse.total,
        price_min_clp: plansResponse.price_min_clp,
        price_max_clp: plansResponse.price_max_clp,
      },
    };
  } catch {
    return { meta, isapres: [], plans: [], response: null };
  }
}

export default async function CompararPlanesIsaprePage() {
  const related = [...HOME_SEO_GUIDES, ...SECONDARY_SEO_GUIDES].filter(
    (item) => item.href !== "/comparar-planes-isapre"
  );
  const data = await getCompareLandingData();

  return (
    <>
      <ServiceSchema
        name="Guía para comparar planes de Isapre"
        description="Guía de decisión para revisar precio, cobertura, red, modalidad y fuentes oficiales antes de cotizar un plan de Isapre."
        url={URL}
      />
      <FAQPageSchema
        items={FAQS}
        name="Preguntas frecuentes de la guía para comparar planes de Isapre"
        url={URL}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: "https://www.elige-tuplan.cl" },
          { name: "Guía para comparar planes de Isapre", url: URL },
        ]}
      />
      <ItemListSchema
        name="Guías por perfil relacionadas con la comparación de planes"
        url={URL}
        items={related.slice(0, 6).map((item) => ({
          name: item.title,
          url: `https://www.elige-tuplan.cl${item.href}`,
          description: item.description,
        }))}
      />

      <main className="bg-[#fbf8f3] text-[#1e2a2a]">
        <section className="bg-[#0f514b] text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-18 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
            <div>
              <nav className="mb-6 text-sm font-medium text-white/60">
                <Link href="/" className="no-underline hover:text-white">Inicio</Link>
                <span className="mx-2">/</span>
                <span className="text-white">Guía para comparar</span>
              </nav>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#14dcb4]/35 bg-[#14dcb4]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#14dcb4]">
                <CheckCircle className="h-3.5 w-3.5" />
                Guía de decisión
              </div>
              <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.04] tracking-tight sm:text-[50px]">
                Cómo comparar planes de Isapre antes de cotizar
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/82 sm:text-[18px]">
                Usa esta guía para ordenar precio en UF, 7%, cobertura, red, topes, modalidad y
                fuentes oficiales. Cuando tengas claros tus criterios, puedes abrir el comparador
                completo o pedir orientación gratuita.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <TrackedSeoLink
                  href="/comparar/isapres"
                  source="guide_landing"
                  label="Usar comparador de planes Isapre"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white no-underline shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
                >
                  Usar comparador de planes Isapre <ArrowRight className="h-5 w-5" />
                </TrackedSeoLink>
                <WhatsAppCTA
                  source="comparar"
                  message="Hola, quiero comparar planes de Isapre y necesito orientación."
                  label="Pedir orientación"
                />
              </div>
            </div>

            <aside className="rounded-[8px] border border-white/12 bg-white/8 p-6">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#14dcb4]">
                Checklist rápida
              </p>
              <ul className="space-y-4">
                {[
                  "Tu sueldo imponible y 7% aproximado.",
                  "Cargas familiares y edades.",
                  "Clínicas o prestadores que prefieres.",
                  "Uso esperado: consultas, exámenes, hospitalización.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-white/78">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#14dcb4]" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <MarketSnapshot
          meta={data.meta}
          isapres={data.isapres}
          filteredTotal={data.response?.total}
          priceMin={data.response?.price_min_clp}
          priceMax={data.response?.price_max_clp}
          filterLabel="planes activos"
        />

        <FeaturedPlans
          title="Planes de muestra para aplicar la guía"
          description="Ejemplos iniciales ordenados por precio base. La decisión final se revisa con filtros de Isapre, cobertura, clínica, modalidad y presupuesto."
          plans={data.plans}
          compareHref="/comparar/isapres"
          trackingSource="guide_landing"
        />

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
          <div className="mb-9 max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
              Criterios de comparación
            </p>
            <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
              No compares solo por precio
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POINTS.map((point) => (
              <div key={point.title} className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-[8px] bg-[#0f514b] text-[#14dcb4]">
                  <point.icon className="h-5 w-5" />
                </div>
                <h3 className="font-extrabold text-[#0f514b]">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.description}</p>
              </div>
            ))}
          </div>
        </section>

        <OfficialSourcesPanel />

        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
                  Rutas relacionadas
                </p>
                <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
                  También puedes comparar por perfil
                </h2>
              </div>
              <TrackedSeoLink
                href="/planes-isapre"
                source="guide_landing"
                label="Ver guías por perfil"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0f514b] no-underline hover:text-[#0f9d8a]"
              >
                Ver guías por perfil <ArrowRight className="h-4 w-4" />
              </TrackedSeoLink>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 6).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5 text-[#0f514b] no-underline transition-all hover:-translate-y-0.5 hover:border-[#14dcb4]/45"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0f9d8a]">{item.kicker}</p>
                  <h3 className="mt-2 font-extrabold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.question} className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-extrabold text-[#0f514b]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
