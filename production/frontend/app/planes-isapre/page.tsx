import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Baby,
  BriefcaseBusiness,
  HeartPulse,
  Search,
  ShieldCheck,
  Shuffle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { MarketSnapshot, OfficialSourcesPanel } from "@/components/seo/landing-data-panels";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { getIsapres, getPlanes, getSiteMeta, type Isapre, type PlansResponse } from "@/lib/api";
import { ALL_SEO_GUIDES, type GuideIcon } from "@/lib/seo-landings";

const URL = "https://www.elige-tuplan.cl/planes-isapre";

export const metadata: Metadata = {
  title: "Planes de Isapre por Perfil | Guías para Elegir Mejor",
  description:
    "Encuentra guías de planes de Isapre por perfil y necesidad: familias, embarazo, independientes, jóvenes, adultos mayores, cambio desde Fonasa y cambio de Isapre.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Planes de Isapre por Perfil | Guías para Elegir Mejor",
    description:
      "Guías públicas para revisar planes de Isapre según perfil, etapa de vida, presupuesto o decisión de cambio.",
    url: URL,
    type: "website",
  },
};

const ICONS: Record<GuideIcon, LucideIcon> = {
  compare: Search,
  family: Users,
  pregnancy: Baby,
  independent: BriefcaseBusiness,
  young: HeartPulse,
  senior: ShieldCheck,
  switch: Shuffle,
  fonasa: HeartPulse,
};

type HubData = {
  meta: Awaited<ReturnType<typeof getSiteMeta>>;
  isapres: Isapre[];
  response: Pick<PlansResponse, "total" | "price_min_clp" | "price_max_clp"> | null;
};

async function getHubData(): Promise<HubData> {
  const meta = await getSiteMeta();

  try {
    const [isapres, plansResponse] = await Promise.all([
      getIsapres(),
      getPlanes({ limit: 1, sort: "precio_asc" }),
    ]);

    return {
      meta,
      isapres,
      response: {
        total: plansResponse.total,
        price_min_clp: plansResponse.price_min_clp,
        price_max_clp: plansResponse.price_max_clp,
      },
    };
  } catch {
    return { meta, isapres: [], response: null };
  }
}

export default async function PlanesIsapreHubPage() {
  const data = await getHubData();

  return (
    <>
      <ServiceSchema
        name="Guías de planes de Isapre por perfil"
        description="Centro de guías para revisar planes de Isapre según perfil, etapa de vida, presupuesto o decisión de cambio."
        url={URL}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: "https://www.elige-tuplan.cl" },
          { name: "Planes de Isapre", url: URL },
        ]}
      />
      <ItemListSchema
        name="Guías de planes de Isapre por perfil"
        url={URL}
        items={ALL_SEO_GUIDES.map((guide) => ({
          name: guide.title,
          url: `https://www.elige-tuplan.cl${guide.href}`,
          description: guide.description,
        }))}
      />

      <main className="bg-[#fbf8f3] text-[#1e2a2a]">
        <section className="bg-[#0f514b] text-white">
          <div className="mx-auto max-w-6xl px-6 py-18 sm:py-24 lg:px-10">
            <nav className="mb-6 text-sm font-medium text-white/60">
              <Link href="/" className="no-underline hover:text-white">Inicio</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Planes de Isapre</span>
            </nav>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#14dcb4]/35 bg-[#14dcb4]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#14dcb4]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Guías por perfil
            </div>
            <h1 className="max-w-4xl text-[34px] font-extrabold leading-[1.04] tracking-tight sm:text-[50px]">
              Planes de Isapre por perfil, etapa de vida y necesidad
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/82 sm:text-[18px]">
              No todos comparan desde el mismo punto de partida. Estas guías ordenan la búsqueda
              según familia, embarazo, presupuesto, edad, cargas o cambio de sistema.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/comparar/isapres"
                className="inline-flex items-center justify-center gap-2 rounded-2xl px-7 py-4 text-base font-bold text-white no-underline shadow-lg transition-all hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
              >
                Abrir comparador completo <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/comparar-planes-isapre"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-7 py-4 text-base font-bold text-white no-underline transition-all hover:bg-white/15"
              >
                Leer guía para comparar
              </Link>
            </div>
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

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
          <div className="mb-9 max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
              Guías por intención
            </p>
            <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
              Elige la guía que calza con tu búsqueda
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_SEO_GUIDES.map((guide) => {
              const Icon = ICONS[guide.icon];

              return (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="group flex min-h-[238px] flex-col rounded-[8px] border border-slate-200 bg-white p-5 text-[#1e2a2a] no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#14dcb4]/45 hover:shadow-md"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <span className="rounded-full bg-[#14dcb4]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0f9d8a]">
                      {guide.kicker}
                    </span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#0f514b] text-[#14dcb4]">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="text-[20px] font-extrabold leading-tight text-[#0f514b]">{guide.title}</h3>
                  <p className="mt-3 flex-1 text-[14px] leading-relaxed text-slate-600">
                    {guide.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[13.5px] font-bold text-[#0f514b]">
                    {guide.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <OfficialSourcesPanel />

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
                Mapa de decisión
              </p>
              <h2 className="text-2xl font-extrabold leading-tight text-[#0f514b] sm:text-3xl">
                Cada ruta responde una necesidad distinta
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Este centro ordena las búsquedas para que no tengas que partir siempre desde cero.
                Puedes revisar una guía por perfil, pasar a la guía principal o abrir el comparador
                cuando ya tengas claro qué filtros usar.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Perfil", "Familia, embarazo, independientes, jóvenes y adultos mayores."],
                ["Decisión", "Cambio de Isapre o paso desde Fonasa."],
                ["Comparador", "Cuando tengas criterios claros, filtra planes reales."],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5">
                  <h3 className="font-extrabold text-[#0f514b]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
