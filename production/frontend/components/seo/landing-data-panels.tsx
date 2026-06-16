import Link from "next/link";
import { ArrowRight, ExternalLink, FileText, ShieldCheck } from "lucide-react";
import { formatCLP, formatUF, type Isapre, type Plan, type SiteMeta } from "@/lib/api";
import { ISAPRE_LANDING_INFO } from "@/lib/isapre-landings";

type MarketSnapshotProps = {
  meta: SiteMeta;
  isapres: Isapre[];
  filteredTotal?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  filterLabel?: string;
};

const OFFICIAL_SOURCES = [
  {
    label: "Superintendencia de Salud",
    href: "https://www.superdesalud.gob.cl/",
    desc: "Orientación, fiscalización, GES, CAEC y materias de Isapres.",
  },
  {
    label: "Cómo elegir una Isapre",
    href: "https://www.superdesalud.gob.cl/orientacion-en-salud/debes-elegir-una-isapre/",
    desc: "Criterios oficiales: presupuesto, 7%, necesidades de salud y prestadores.",
  },
  {
    label: "Fonasa o Isapre",
    href: "https://www.superdesalud.gob.cl/orientacion-en-salud/fonasa-o-isapre/",
    desc: "Diferencias base entre cotizar en Fonasa o en una Isapre.",
  },
  {
    label: "Isapres de Chile (AICH)",
    href: "https://www.isapresdechile.cl/",
    desc: "Información gremial y orientación general sobre asesoría y planes de Isapre.",
  },
  {
    label: "Ministerio de Salud",
    href: "https://www.minsal.cl/",
    desc: "Información sanitaria pública y normativa del sistema de salud.",
  },
  {
    label: "FONASA",
    href: "https://www.fonasa.cl/",
    desc: "Seguro público de salud y trámites oficiales.",
  },
];

export function MarketSnapshot({
  meta,
  isapres,
  filteredTotal,
  priceMin,
  priceMax,
  filterLabel = "planes que calzan con esta guía",
}: MarketSnapshotProps) {
  const totalIsapres = isapres.length || 7;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
            Datos reales del comparador
          </p>
          <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
            Esta guía se apoya en planes vigentes, no en ejemplos inventados
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Los números vienen de la misma base que alimenta el comparador de EligeTuPlan. Las
            condiciones finales siempre deben validarse con la Isapre correspondiente antes de contratar.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Planes activos" value={meta.plansTotal.toLocaleString("es-CL")} detail="Base completa" />
          <StatCard label="Isapres comparadas" value={totalIsapres.toString()} detail="Mercado abierto" />
          <StatCard label={filterLabel} value={filteredTotal != null ? filteredTotal.toLocaleString("es-CL") : "N/D"} detail="Filtro inicial" />
          <StatCard
            label="Rango de precios"
            value={priceMin != null && priceMax != null ? `${formatCLP(priceMin)} - ${formatCLP(priceMax)}` : "N/D"}
            detail={`UF ${formatCLP(meta.ufValueCLP)} · ${meta.lastUpdate}`}
          />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-[22px] font-extrabold leading-tight text-[#0f514b]">{value}</p>
      <p className="mt-2 text-[12.5px] font-medium text-slate-500">{detail}</p>
    </div>
  );
}

export function FeaturedPlans({
  title,
  description,
  plans,
  compareHref,
}: {
  title: string;
  description: string;
  plans: Plan[];
  compareHref: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
            Muestra del catálogo
          </p>
          <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
        </div>
        <Link
          href={compareHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#14dcb4]/40 px-5 py-3 text-sm font-bold text-[#0f514b] no-underline hover:bg-[#14dcb4]/10"
        >
          Abrir comparador con filtros <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {plans.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FileText className="mx-auto mb-3 h-8 w-8 text-[#14dcb4]" />
          <h3 className="text-lg font-extrabold text-[#0f514b]">No pudimos cargar planes en este momento</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
            La página sigue disponible, pero la muestra de planes depende de la API del comparador.
          </p>
        </div>
      )}
    </section>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f9d8a]">
            {plan.isapre_name}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[16px] font-extrabold uppercase leading-snug text-[#0f514b]">
            {plan.name}
          </h3>
          {plan.codigo_plan && <p className="mt-1 font-mono text-[11px] text-slate-400">{plan.codigo_plan}</p>}
        </div>
        {plan.modalidad && (
          <span className="shrink-0 rounded-[8px] bg-[#14dcb4]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0f9d8a]">
            {plan.modalidad}
          </span>
        )}
      </div>

      <div className="mb-4 rounded-[8px] bg-[#fbf8f3] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Precio base</p>
        <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0f514b]">
          UF {formatUF(plan.base_plan_uf ?? plan.price_uf)}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">{formatCLP(plan.price_clp)} aprox.</p>
      </div>

      <dl className="grid grid-cols-2 gap-3">
        <div className="rounded-[8px] border border-slate-100 p-3">
          <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Hosp.</dt>
          <dd className="mt-1 text-xl font-extrabold text-[#0f514b]">
            {plan.hospital_coverage != null ? `${plan.hospital_coverage}%` : "N/D"}
          </dd>
        </div>
        <div className="rounded-[8px] border border-slate-100 p-3">
          <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Amb.</dt>
          <dd className="mt-1 text-xl font-extrabold text-[#0f514b]">
            {plan.ambulatory_coverage != null ? `${plan.ambulatory_coverage}%` : "N/D"}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
        {plan.zona_nombre && <span className="rounded-full bg-slate-100 px-2.5 py-1">{plan.zona_nombre}</span>}
        {plan.con_parto ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Con parto</span> : null}
      </div>

      {plan.pdf_url && (
        <a
          href={plan.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#0f514b] no-underline hover:text-[#0f9d8a]"
        >
          Ver ficha PDF <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}
    </article>
  );
}

export function OfficialSourcesPanel() {
  const isapres = Object.values(ISAPRE_LANDING_INFO);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#14dcb4]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f9d8a]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fuentes oficiales
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
            Contrasta siempre antes de contratar
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            El comparador ayuda a ordenar alternativas, pero la contratación, red final, beneficios,
            GES, CAEC y documentos contractuales deben revisarse en fuentes oficiales.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {OFFICIAL_SOURCES.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5 text-[#0f514b] no-underline transition-all hover:-translate-y-0.5 hover:border-[#14dcb4]/45"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-extrabold">{source.label}</span>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#0f9d8a]" />
                </span>
                <span className="mt-2 block text-sm leading-relaxed text-slate-600">{source.desc}</span>
              </a>
            ))}
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5">
            <h3 className="font-extrabold text-[#0f514b]">Sitios oficiales de Isapres</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Úsalos para validar canales, documentos, redes, simuladores y condiciones finales.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {isapres.map((isapre) => (
                <a
                  key={isapre.slug}
                  href={isapre.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-[8px] bg-white px-4 py-3 text-sm font-bold text-[#0f514b] no-underline hover:text-[#0f9d8a]"
                >
                  {isapre.name}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
