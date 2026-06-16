import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { getAllArticles, getArticleBySlug, getRelatedArticles } from "@/lib/blog";

const SITE = "https://www.elige-tuplan.cl";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Artículo no encontrado" };

  const url = `${SITE}/blog/${slug}`;
  return {
    title: { absolute: `${article.title} — EligeTuPlan` },
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      images: article.cover ? [{ url: article.cover }] : undefined,
    },
  };
}

function formatDate(iso: string): string {
  if (!iso) return "";
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// Markdown → JSX con el diseño del sitio.
const mdComponents = {
  h2: (props: React.ComponentPropsWithoutRef<"h2">) => (
    <h2 className="text-2xl font-bold text-[#0f514b] tracking-[-0.01em] mt-10 mb-4" {...props} />
  ),
  h3: (props: React.ComponentPropsWithoutRef<"h3">) => (
    <h3 className="text-xl font-bold text-[#0f514b] mt-8 mb-3" {...props} />
  ),
  p: (props: React.ComponentPropsWithoutRef<"p">) => (
    <p className="text-[16px] leading-[1.75] text-slate-700 mb-5" {...props} />
  ),
  ul: (props: React.ComponentPropsWithoutRef<"ul">) => (
    <ul className="list-disc pl-6 space-y-2 mb-5 text-[16px] leading-[1.7] text-slate-700 marker:text-[#14dcb4]" {...props} />
  ),
  ol: (props: React.ComponentPropsWithoutRef<"ol">) => (
    <ol className="list-decimal pl-6 space-y-2 mb-5 text-[16px] leading-[1.7] text-slate-700 marker:text-[#0f9d8a] marker:font-bold" {...props} />
  ),
  li: (props: React.ComponentPropsWithoutRef<"li">) => <li className="pl-1" {...props} />,
  strong: (props: React.ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-[#0f514b]" {...props} />
  ),
  blockquote: (props: React.ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-l-4 border-[#14dcb4] bg-[#14dcb4]/[0.06] rounded-r-xl pl-5 pr-4 py-3 my-6 text-[15.5px] text-slate-700 italic" {...props} />
  ),
  a: ({ href = "", children, ...rest }: React.ComponentPropsWithoutRef<"a">) => {
    const internal = href.startsWith("/");
    if (internal) {
      return (
        <Link href={href} className="text-[#0f9d8a] font-semibold underline decoration-[#14dcb4]/40 underline-offset-2 hover:decoration-[#14dcb4]">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#0f9d8a] font-semibold underline decoration-[#14dcb4]/40 underline-offset-2 hover:decoration-[#14dcb4]" {...rest}>
        {children}
      </a>
    );
  },
  hr: () => <hr className="my-8 border-slate-200" />,
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const url = `${SITE}/blog/${slug}`;
  const imageUrl = article.cover ? `${SITE}${article.cover}` : `${SITE}/icon.png`;

  const related = getRelatedArticles(slug, 3);

  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      <ArticleSchema
        title={article.title}
        description={article.description}
        url={url}
        imageUrl={imageUrl}
        datePublished={article.date}
        dateModified={article.date}
        authorName={article.author}
        category={article.category}
        readingMinutes={article.readingMinutes}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: SITE },
          { name: "Blog", url: `${SITE}/blog` },
          { name: article.title, url },
        ]}
      />

      <article className="mx-auto max-w-[760px] px-5 sm:px-6 lg:px-8 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="text-[12px] font-medium text-slate-400 flex items-center gap-1.5 mb-6 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#0f9d8a] transition-colors no-underline">Inicio</Link>
          <span className="text-slate-300">/</span>
          <Link href="/blog" className="hover:text-[#0f9d8a] transition-colors no-underline">Blog</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-500 truncate max-w-[32ch]">{article.title}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#14dcb4] bg-[#14dcb4]/10 px-2.5 py-0.5 rounded-full">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-slate-400">
            <Clock className="w-3.5 h-3.5" /> {article.readingMinutes} min de lectura
          </span>
        </div>
        <h1 className="text-3xl md:text-[42px] font-extrabold text-[#0f514b] tracking-[-0.02em] leading-[1.08] mb-4">
          {article.title}
        </h1>
        <p className="text-[12.5px] text-slate-400 mb-8">
          Por {article.author} · {formatDate(article.date)}
        </p>

        {article.cover && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 mb-10 border border-slate-200">
            <Image src={article.cover} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 760px" priority />
          </div>
        )}

        {/* Cuerpo */}
        <div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {article.content}
          </ReactMarkdown>
        </div>

        {/* CTA final */}
        <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white p-7 md:p-9">
          <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            ¿Listo para encontrar tu plan?
          </h3>
          <p className="text-white/70 text-[15px] leading-relaxed mb-5 max-w-[52ch]">
            Compara los planes de salud de las 7 Isapres por precio, cobertura y clínica. Gratis y sin formularios.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/comparar/isapres"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[15px] text-white no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
            >
              Comparar planes <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/tu-mejor-plan"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[15px] text-white/90 bg-white/10 border border-white/20 no-underline hover:bg-white/15 transition-colors"
            >
              Plan ideal con IA
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1000px] px-5 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <h2 className="text-xl md:text-2xl font-bold text-[#0f514b] tracking-tight mb-6">Sigue leyendo</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((a) => (
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
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  </div>
                )}
                <div className="flex flex-col flex-grow p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#14dcb4] bg-[#14dcb4]/10 px-2 py-0.5 rounded-full">
                      {a.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" /> {a.readingMinutes} min
                    </span>
                  </div>
                  <h3 className="text-[16px] font-bold text-[#0f514b] leading-snug tracking-[-0.01em] mb-1.5 group-hover:text-[#0f9d8a] transition-colors line-clamp-2">
                    {a.title}
                  </h3>
                  <p className="text-[13.5px] text-slate-600 leading-relaxed line-clamp-2 flex-grow">
                    {a.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#0f9d8a]">
                    Leer <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
