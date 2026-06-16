import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Baby,
  BriefcaseBusiness,
  CheckCircle,
  HeartPulse,
  Search,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { InternalGuidesPanel } from "@/components/seo/internal-guides-panel";
import { FeaturedPlans, MarketSnapshot, OfficialSourcesPanel } from "@/components/seo/landing-data-panels";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import WhatsAppCTA from "@/components/landing/whatsapp-cta";
import { getIsapres, getPlanes, getSiteMeta, type Isapre, type Plan, type PlansResponse } from "@/lib/api";
import {
  getProfileLanding,
  PROFILE_LANDING_SLUGS,
  type ProfileLanding,
  type GuideIcon,
} from "@/lib/seo-landings";

const BASE = "https://www.elige-tuplan.cl";

const ICONS: Record<GuideIcon, LucideIcon> = {
  compare: Search,
  family: Users,
  pregnancy: Baby,
  independent: BriefcaseBusiness,
  young: HeartPulse,
  senior: ShieldCheck,
  switch: ShieldCheck,
  fonasa: HeartPulse,
};

type ProfileData = {
  meta: Awaited<ReturnType<typeof getSiteMeta>>;
  isapres: Isapre[];
  plans: Plan[];
  response: Pick<PlansResponse, "total" | "price_min_clp" | "price_max_clp"> | null;
};

async function getProfileData(landing: ProfileLanding): Promise<ProfileData> {
  const meta = await getSiteMeta();

  try {
    const [isapres, plansResponse] = await Promise.all([
      getIsapres(),
      getPlanes({ ...landing.planQuery.params, limit: 6 }),
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

export function generateStaticParams() {
  return PROFILE_LANDING_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const landing = getProfileLanding(slug);
  if (!landing) return {};

  const url = `${BASE}/planes-isapre/${landing.slug}`;

  return {
    title: landing.metaTitle,
    description: landing.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: landing.metaTitle,
      description: landing.metaDescription,
      url,
      type: "website",
    },
  };
}

export default async function ProfileLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const landing = getProfileLanding(slug);
  if (!landing) notFound();

  const url = `${BASE}/planes-isapre/${landing.slug}`;
  const Icon = ICONS[landing.icon];
  const data = await getProfileData(landing);

  return (
    <>
      <ServiceSchema
        name={landing.title}
        description={landing.metaDescription}
        url={url}
      />
      <FAQPageSchema
        items={landing.faqs}
        name={`Preguntas frecuentes sobre ${landing.title}`}
        url={url}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: BASE },
          { name: "Planes de Isapre", url: `${BASE}/planes-isapre` },
          { name: landing.shortTitle, url },
        ]}
      />

      <main className="bg-[#fbf8f3] text-[#1e2a2a]">
        <section className="bg-[#0f514b] text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-18 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
            <div>
              <nav className="mb-6 text-sm font-medium text-white/60">
                <Link href="/" className="no-underline hover:text-white">Inicio</Link>
                <span className="mx-2">/</span>
                <Link href="/planes-isapre" className="no-underline hover:text-white">Planes de Isapre</Link>
                <span className="mx-2">/</span>
                <span className="text-white">{landing.shortTitle}</span>
              </nav>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#14dcb4]/35 bg-[#14dcb4]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#14dcb4]">
                <Icon className="h-3.5 w-3.5" />
                {landing.eyebrow}
              </div>
              <h1 className="max-w-3xl text-[34px] font-extrabold leading-[1.04] tracking-tight sm:text-[50px]">
                {landing.title}
              </h1>
              <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/82 sm:text-[18px]">
                {landing.description}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/comparar/isapres"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white no-underline shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
                >
                  {landing.cta} <ArrowRight className="h-5 w-5" />
                </Link>
                <WhatsAppCTA
                  source="asesor_isapre"
                  message={landing.whatsappMessage}
                  label="Hablar con asesor"
                />
              </div>
            </div>

            <aside className="rounded-[8px] border border-white/12 bg-white/8 p-6">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#14dcb4]">
                Para quién es esta guía
              </p>
              <p className="text-[15px] leading-relaxed text-white/82">{landing.audience}</p>
              <div className="mt-6 grid gap-3">
                {landing.bullets.slice(0, 3).map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3 rounded-[8px] bg-white/9 p-3 text-sm leading-relaxed text-white/78">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#14dcb4]" />
                    {bullet}
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <MarketSnapshot
          meta={data.meta}
          isapres={data.isapres}
          filteredTotal={data.response?.total}
          priceMin={data.response?.price_min_clp}
          priceMax={data.response?.price_max_clp}
          filterLabel={landing.planQuery.label}
        />

        <FeaturedPlans
          title={`Planes de muestra para ${landing.shortTitle.toLowerCase()}`}
          description={landing.planQuery.description}
          plans={data.plans}
          compareHref={landing.planQuery.compareHref}
        />

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
          <div className="mb-9 max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
              Antes de cotizar
            </p>
            <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
              Qué deberías mirar en este perfil
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {landing.bullets.map((bullet) => (
              <div key={bullet} className="flex items-start gap-4 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#0f9d8a]" />
                <p className="text-sm leading-relaxed text-slate-700">{bullet}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-6 lg:px-10">
            <div className="mb-9 max-w-2xl">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
                Comparación práctica
              </p>
              <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
                Cómo tomar una decisión con menos ruido
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {landing.comparePoints.map((point) => (
                <div key={point.title} className="rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5">
                  <h3 className="font-extrabold text-[#0f514b]">{point.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <OfficialSourcesPanel />

        <InternalGuidesPanel
          title="Otras formas de comparar planes de Isapre"
          description="Cruza esta guía con otras rutas según presupuesto, grupo familiar o decisión de cambio para tomar una decisión más completa."
          currentHref={`/planes-isapre/${landing.slug}`}
        />

        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {landing.faqs.map((faq) => (
              <div key={faq.question} className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-extrabold text-[#0f514b]">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#0f514b] px-6 py-16 text-white lg:px-10">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <Icon className="mb-3 h-7 w-7 text-[#14dcb4]" />
              <h2 className="text-2xl font-extrabold sm:text-3xl">Quieres revisar este caso con datos reales?</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/72">
                Entra al comparador o habla con un asesor para cruzar precio, cobertura, red y tu situación.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/comparar/isapres"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-[#0f514b] no-underline hover:bg-white/90"
              >
                Comparar planes <ArrowRight className="h-5 w-5" />
              </Link>
              <WhatsAppCTA
                source="asesor_isapre"
                message={landing.whatsappMessage}
                label="Cotizar por WhatsApp"
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
