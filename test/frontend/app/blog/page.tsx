import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { getAllArticles } from "@/lib/blog";

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

function formatDate(iso: string): string {
  if (!iso) return "";
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`;
}

export default function BlogIndexPage() {
  const articles = getAllArticles();

  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white overflow-hidden">
        <div
          className="absolute -top-[30%] -right-[8%] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(20,220,180,.16) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-10 py-6 md:py-8">
          <div className="text-[10.5px] font-bold tracking-[0.2em] uppercase text-[#14dcb4] mb-1.5">
            · Blog ·
          </div>
          <h1 className="text-2xl md:text-[30px] font-extrabold tracking-[-0.02em] leading-[1.1] max-w-[22ch]">
            Todo sobre <span className="serif italic font-medium text-[#14dcb4]">Isapres</span> y planes de salud
          </h1>
          <p className="mt-2 text-white/70 text-[14px] md:text-[15px] leading-relaxed max-w-[600px]">
            Guías claras y novedades para que entiendas tu plan, sepas cómo cambiarte y elijas con información real.
          </p>
        </div>
      </section>

      {/* Grid de artículos */}
      <section className="mx-auto max-w-[1100px] px-5 sm:px-6 lg:px-10 py-12 md:py-16">
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
