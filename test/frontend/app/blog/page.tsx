import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calculator, ClipboardCheck, Clock, ShieldCheck } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { getAllArticles, type ArticleMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: { absolute: "Blog de Isapres y Planes de Salud — EligeTuPlan" },
  description:
    "Guías y novedades sobre Isapres y planes de salud en Chile: qué es una Isapre, cómo cambiarse, beneficios y cómo elegir el plan que más te conviene.",
  alternates: { canonical: "https://www.elige-tuplan.cl/blog" },
  openGraph: {
    title: "Blog de Isapres y Planes de Salud — EligeTuPlan",
    description:
      "Guías claras sobre Isapres y planes de salud en Chile para tomar mejores decisiones.",
    url: "https://www.elige-tuplan.cl/blog",
    type: "website",
  },
};

const topicClusters = [
  {
    key: "compare",
    icon: ClipboardCheck,
    eyebrow: "Ruta 1",
    title: "Estoy comparando opciones",
    question: "No tengo claro si me conviene Fonasa, Isapre o seguir buscando.",
    description: "Parte aqui si quieres entender diferencias, precio mensual y criterios para elegir con calma.",
    tags: ["Fonasa vs Isapre", "Precio", "Decision"],
    slugs: [
      "fonasa-vs-isapre-cual-conviene",
      "como-elegir-isapre-plan-salud",
      "cuanto-cuesta-isapre-chile",
    ],
  },
  {
    key: "contract",
    icon: Calculator,
    eyebrow: "Ruta 2",
    title: "Estoy por contratar o cambiarme",
    question: "Ya estoy mirando planes y necesito saber que revisar antes de firmar.",
    description: "Esta ruta te ayuda a calcular tu 7%, ordenar documentos y evitar errores con preexistencias.",
    tags: ["7% de salud", "Cambio", "Preexistencias"],
    slugs: [
      "que-es-7-por-ciento-salud-isapre",
      "preexistencias-isapre-declaracion-salud",
      "como-cambiarse-de-isapre",
    ],
  },
  {
    key: "coverage",
    icon: ShieldCheck,
    eyebrow: "Ruta 3",
    title: "Quiero entender la cobertura real",
    question: "Me preocupa que el plan se vea bueno, pero no cubra bien cuando lo use.",
    description: "Revisa aqui topes, GES, CAEC, red de atencion y diferencias entre cobertura normal y especial.",
    tags: ["Cobertura", "GES", "CAEC"],
    slugs: [
      "ges-caec-isapre-guia-practica",
      "que-cubre-plan-isapre-ges-caec",
      "que-es-una-isapre",
    ],
  },
] as const;

function formatDate(iso: string): string {
  if (!iso) return "";
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

function articlesForSlugs(articles: ArticleMeta[], slugs: readonly string[]): ArticleMeta[] {
  const bySlug = new Map(articles.map((article) => [article.slug, article]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((article): article is ArticleMeta => Boolean(article));
}

const SITE = "https://www.elige-tuplan.cl";

export default function BlogIndexPage() {
  const articles = getAllArticles();
  const clusters = topicClusters.map((cluster) => ({
    ...cluster,
    articles: articlesForSlugs(articles, cluster.slugs),
  }));

  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      <ItemListSchema
        name="Artículos del blog de EligeTuPlan"
        url={`${SITE}/blog`}
        items={articles.map((a) => ({
          name: a.title,
          url: `${SITE}/blog/${a.slug}`,
          description: a.description,
          image: a.cover ? `${SITE}${a.cover}` : `${SITE}/icon.png`,
        }))}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: SITE },
          { name: "Blog", url: `${SITE}/blog` },
        ]}
      />
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white overflow-hidden">
        <div
          className="absolute -top-[30%] -right-[8%] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(20,220,180,.16) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-10 py-3.5 md:py-5">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#14dcb4] mb-1">
            · Blog ·
          </div>
          <h1 className="text-xl md:text-[25px] font-extrabold tracking-[-0.02em] leading-[1.12] max-w-[24ch]">
            Todo sobre <span className="serif italic font-medium text-[#14dcb4]">Isapres</span> y planes de salud
          </h1>
          <p className="mt-1.5 text-white/65 text-[13px] md:text-[13.5px] leading-snug max-w-[600px]">
            Guías claras y novedades para que entiendas tu plan, sepas cómo cambiarte y elijas con información real.
          </p>
        </div>
      </section>

      {/* Grid de artículos */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-10 py-10 md:py-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-7">
            <div>
              <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#0f9d8a] mb-1">
                Elige por donde partir
              </div>
              <h2 className="text-2xl md:text-[30px] font-extrabold text-[#0f514b] tracking-[-0.02em] leading-tight">
                Guias ordenadas segun la duda que tienes hoy
              </h2>
              <p className="mt-2 max-w-[680px] text-[14px] leading-relaxed text-slate-600">
                Si estas comparando planes, estas tres rutas te ayudan a partir por el tema correcto: decidir sistema, revisar antes de firmar o entender la cobertura.
              </p>
            </div>
            <Link
              href="/comparar/isapres"
              className="inline-flex items-center gap-2 self-start md:self-auto rounded-lg bg-[#0f514b] px-4 py-2.5 text-[13px] font-bold text-white no-underline transition-colors hover:bg-[#0d423d]"
            >
              Comparar planes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {clusters.map((cluster) => {
              const Icon = cluster.icon;
              return (
                <section
                  key={cluster.key}
                  className="rounded-lg border border-slate-200 bg-[#fbf8f3] p-5 shadow-sm"
                  aria-labelledby={`cluster-${cluster.key}`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#14dcb4]/12 text-[#0f9d8a]">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="rounded-full border border-[#14dcb4]/30 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0f9d8a]">
                      {cluster.eyebrow}
                    </span>
                  </div>
                  <h3 id={`cluster-${cluster.key}`} className="text-[18px] font-extrabold leading-snug text-[#0f514b]">
                    {cluster.title}
                  </h3>
                  <p className="mt-2 text-[14px] font-semibold leading-snug text-slate-700">
                    {cluster.question}
                  </p>
                  <p className="mt-2 mb-4 text-[13.5px] leading-relaxed text-slate-600">
                    {cluster.description}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {cluster.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 ring-1 ring-slate-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="divide-y divide-slate-200">
                    {cluster.articles.map((article, index) => (
                      <Link
                        key={article.slug}
                        href={`/blog/${article.slug}`}
                        className="group flex items-start justify-between gap-3 py-3 text-[#0f514b] no-underline first:pt-0 last:pb-0"
                      >
                        <span className="min-w-0">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            {index === 0 ? "Parte por aqui" : `Paso ${index + 1}`}
                          </span>
                          <span className="block text-[14px] font-semibold leading-snug group-hover:text-[#0f9d8a]">
                            {article.title}
                          </span>
                        </span>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9d8a] transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="mb-7">
          <div className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#0f9d8a] mb-1">
            Todas las guias
          </div>
          <h2 className="text-2xl md:text-[30px] font-extrabold text-[#0f514b] tracking-[-0.02em] leading-tight">
            Articulos recientes
          </h2>
        </div>
        {articles.length === 0 ? (
          <p className="text-slate-500">Pronto publicaremos nuestros primeros artículos.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <Link
                key={a.slug}
                href={`/blog/${a.slug}`}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden no-underline"
              >
                {a.cover && (
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                    <Image
                      src={a.cover}
                      alt={a.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-grow p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#14dcb4] bg-[#14dcb4]/10 px-2 py-0.5 rounded-full">
                      {a.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" /> {a.readingMinutes} min
                    </span>
                  </div>
                  <h2 className="text-[17px] font-bold text-[#0f514b] leading-snug tracking-[-0.01em] mb-2 group-hover:text-[#0f9d8a] transition-colors">
                    {a.title}
                  </h2>
                  <p className="text-[14px] text-slate-600 leading-relaxed line-clamp-3 flex-grow">
                    {a.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[12px] text-slate-400">{formatDate(a.date)}</span>
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#0f9d8a]">
                      Leer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
