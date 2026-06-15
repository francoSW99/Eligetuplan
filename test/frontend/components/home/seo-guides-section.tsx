import Link from "next/link";
import {
  ArrowRight,
  Baby,
  BriefcaseBusiness,
  HeartPulse,
  Search,
  Shuffle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { HOME_SEO_GUIDES, type GuideIcon } from "@/lib/seo-landings";

const ICONS: Record<GuideIcon, LucideIcon> = {
  compare: Search,
  family: Users,
  pregnancy: Baby,
  independent: BriefcaseBusiness,
  young: HeartPulse,
  senior: HeartPulse,
  switch: Shuffle,
  fonasa: HeartPulse,
};

const INTENT_STYLES = {
  principal: "border-[#14dcb4]/45 bg-[#14dcb4]/8 text-[#0f514b]",
  perfil: "border-sky-200 bg-sky-50 text-sky-900",
  decision: "border-amber-200 bg-amber-50 text-amber-950",
};

export default function SeoGuidesSection() {
  return (
    <section id="guias-isapre" className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mb-8 md:mb-11 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <header className="max-w-2xl">
            <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#0f9d8a]">
              · Guías por necesidad ·
            </div>
            <h2
              className="font-extrabold leading-[1.05] tracking-[-0.02em] text-[#0f514b] text-balance"
              style={{ fontSize: "clamp(28px,3.8vw,42px)" }}
            >
              Encuentra planes según tu perfil.
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#5a6b6a] md:text-[16px]">
              Atajos útiles para quienes están comparando por etapa de vida, presupuesto o decisión
              específica. Cada guía conecta con el comparador y asesoría gratis.
            </p>
          </header>

          <Link
            href="/planes-isapre"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0f514b]/15 px-5 py-3 text-[14px] font-bold text-[#0f514b] no-underline transition-colors hover:bg-[#0f514b]/5"
          >
            Ver todas las guías
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HOME_SEO_GUIDES.map((guide) => {
            const Icon = ICONS[guide.icon];

            return (
              <Link
                key={guide.href}
                href={guide.href}
                className="group flex min-h-[236px] flex-col rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5 text-[#1e2a2a] no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#14dcb4]/45 hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      INTENT_STYLES[guide.intent]
                    }`}
                  >
                    {guide.kicker}
                  </div>
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#0f514b] text-[#14dcb4] shadow-[0_10px_22px_-14px_rgba(15,81,75,0.6)]">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>

                <h3 className="text-[20px] font-extrabold leading-tight tracking-[-0.01em] text-[#0f514b]">
                  {guide.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[#5a6b6a]">
                  {guide.description}
                </p>

                <div className="mt-5 inline-flex items-center gap-2 text-[13.5px] font-bold text-[#0f514b]">
                  {guide.cta}
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#14dcb4]/20 text-[#0f514b] transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
