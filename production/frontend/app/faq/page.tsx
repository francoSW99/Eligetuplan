import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Database,
  ExternalLink,
  FileText,
  HeartPulse,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { InternalGuidesPanel } from "@/components/seo/internal-guides-panel";
import FaqAccordion, { type QA } from "@/components/faq/faq-accordion";
import { formatCLP, getSiteMeta } from "@/lib/api";
import { ISAPRE_LANDING_INFO } from "@/lib/isapre-landings";

export const metadata: Metadata = {
  title: { absolute: "Metodología, Fuentes y Preguntas Frecuentes | EligeTuPlan" },
  description:
    "Conoce cómo EligeTuPlan compara planes de Isapre, de dónde vienen los datos, cómo se actualizan, qué fuentes oficiales usamos y cuáles son los límites de la información.",
  alternates: { canonical: "https://www.elige-tuplan.cl/faq" },
  openGraph: {
    title: "Metodología, Fuentes y Preguntas Frecuentes | EligeTuPlan",
    description:
      "Transparencia sobre datos, fuentes oficiales, actualización de planes, asesoría gratuita y metodología de comparación.",
    url: "https://www.elige-tuplan.cl/faq",
    type: "website",
  },
};

const VALUES = [
  {
    icon: Sparkles,
    t: "Gratis para el usuario",
    d: "Puedes comparar planes y pedir orientación sin costo para ti. Si avanzas con una cotización, revisa siempre las condiciones oficiales antes de contratar.",
  },
  {
    icon: Database,
    t: "Datos trazables",
    d: "Mostramos planes, precios en UF, coberturas, modalidad, zona y documentos cuando están disponibles en nuestra base operativa.",
  },
  {
    icon: Shield,
    t: "Fuentes oficiales visibles",
    d: "Enlazamos a Superintendencia de Salud, MINSAL, FONASA y sitios oficiales de cada Isapre para validar información crítica.",
  },
  {
    icon: Users,
    t: "Asesoría humana opcional",
    d: "El contacto con un asesor ocurre solo si lo solicitas. Puedes navegar y comparar sin entregar tus datos.",
  },
];

const METHOD_STEPS = [
  {
    n: "01",
    title: "Recopilamos planes vigentes",
    text: "La base reúne planes activos de las Isapres abiertas de Chile y normaliza campos como precio base, modalidad, zona, cobertura y ficha PDF cuando existe.",
  },
  {
    n: "02",
    title: "Convertimos UF a pesos",
    text: "El precio de los planes suele estar expresado en UF. Para facilitar la comparación, calculamos una referencia en pesos usando la UF vigente que reporta la app.",
  },
  {
    n: "03",
    title: "Ordenamos por criterios comparables",
    text: "El comparador permite revisar precio, cobertura hospitalaria, cobertura ambulatoria, modalidad, Isapre, zona, clínicas y cobertura con parto.",
  },
  {
    n: "04",
    title: "Marcamos límites y fuentes",
    text: "Antes de contratar, el usuario debe validar red final, topes, exclusiones, GES, CAEC, declaración de salud y documentos contractuales con la Isapre.",
  },
];

const COMPARED_FIELDS = [
  "Precio base en UF y referencia en pesos",
  "Cobertura hospitalaria y ambulatoria",
  "Modalidad: preferente, libre elección o cerrado",
  "Isapre, zona y prestadores asociados",
  "Cobertura con parto cuando el dato está disponible",
  "Ficha PDF del plan cuando existe en la base",
];

const LIMITS = [
  "No reemplazamos el contrato oficial ni las condiciones particulares de cada Isapre.",
  "No podemos garantizar aceptación de una declaración de salud o cambio de Isapre.",
  "Las coberturas, topes, redes y beneficios pueden cambiar; deben validarse antes de contratar.",
  "Los precios en pesos son referenciales porque dependen de la UF vigente y de condiciones del afiliado.",
];

const OFFICIAL_SOURCES = [
  {
    label: "Superintendencia de Salud",
    href: "https://www.superdesalud.gob.cl/",
    text: "Fiscalización, orientación, regulación, trámites y datos públicos del sistema de salud.",
  },
  {
    label: "Cómo elegir una Isapre",
    href: "https://www.superdesalud.gob.cl/orientacion-en-salud/debes-elegir-una-isapre/",
    text: "Guía oficial para evaluar necesidades de salud, presupuesto, 7%, modalidades y coberturas.",
  },
  {
    label: "Fonasa o Isapre",
    href: "https://www.superdesalud.gob.cl/orientacion-en-salud/fonasa-o-isapre/",
    text: "Comparación oficial entre sistema público y privado, cotización del 7%, afiliación y modalidades.",
  },
  {
    label: "CAEC",
    href: "https://www.superdesalud.gob.cl/orientacion-en-salud/caec-un-seguro-adicional-solo-para-beneficiarios-de-isapres/",
    text: "Orientación oficial sobre cobertura adicional para enfermedades catastróficas en Isapres.",
  },
  {
    label: "Ministerio de Salud",
    href: "https://www.minsal.cl/",
    text: "Información sanitaria pública y normativa general del sistema de salud chileno.",
  },
  {
    label: "FONASA",
    href: "https://www.fonasa.cl/",
    text: "Trámites e información oficial del seguro público de salud.",
  },
];

const FAQS: QA[] = [
  {
    q: "¿Es realmente gratis usar EligeTuPlan?",
    a: "Sí. Puedes comparar planes y pedir orientación sin costo para ti. Antes de contratar, valida siempre precio final, documentos y condiciones directamente con la Isapre correspondiente.",
  },
  {
    q: "¿De dónde salen los datos de los planes?",
    a: "Trabajamos con una base operativa de planes activos de Isapres y mantenemos visibles las fuentes oficiales para validar información sensible. La Superintendencia de Salud, los sitios oficiales de las Isapres, MINSAL y FONASA son referencias clave para confirmar condiciones finales.",
  },
  {
    q: "¿Cada cuánto se actualizan los datos?",
    a: "La app muestra una fecha de última actualización y usa metadatos vivos del backend. Aun así, antes de contratar conviene validar precio, red, topes y documentos directamente con la Isapre.",
  },
  {
    q: "¿Qué significa el precio en pesos?",
    a: "Es una referencia calculada desde el precio en UF usando la UF vigente que maneja la app. El valor final puede cambiar por la UF, GES, cargas, edad, declaración de salud y condiciones particulares del contrato.",
  },
  {
    q: "¿Cómo ordenan o recomiendan planes?",
    a: "Cruzamos precio, cobertura hospitalaria, cobertura ambulatoria, modalidad, red y datos del perfil cuando el usuario los entrega. La recomendación es una ayuda comparativa, no una decisión médica ni una aprobación de la Isapre.",
  },
  {
    q: "¿Qué pasa con preexistencias o declaración de salud?",
    a: "La evaluación de declaración de salud corresponde a la Isapre receptora. EligeTuPlan puede orientar y ordenar alternativas, pero no puede aprobar ni reemplazar esa evaluación.",
  },
  {
    q: "¿La información de la página reemplaza el contrato de salud?",
    a: "No. Esta información es orientativa. El contrato, condiciones generales, arancel, GES, CAEC, topes, exclusiones y red final deben revisarse en los documentos oficiales de la Isapre.",
  },
  {
    q: "¿Me van a contactar si uso el comparador?",
    a: "No necesariamente. Puedes navegar y comparar sin pedir contacto. Solo te contactamos si solicitas asesoría, cotización o dejas tus datos en un formulario.",
  },
];

export default async function QuienesSomosPage() {
  const meta = await getSiteMeta();
  const isapres = Object.values(ISAPRE_LANDING_INFO);

  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: "https://www.elige-tuplan.cl" },
          { name: "Metodología y preguntas frecuentes", url: "https://www.elige-tuplan.cl/faq" },
        ]}
      />
      <FAQPageSchema items={FAQS.map((f) => ({ question: f.q, answer: f.a }))} />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white">
        <div
          className="pointer-events-none absolute -right-[8%] -top-[30%] h-[420px] w-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(20,220,180,.16) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[1080px] px-5 py-16 sm:px-6 md:py-20 lg:px-10">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#14dcb4]">
            · Metodología y fuentes ·
          </div>
          <h1 className="max-w-4xl text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] sm:text-[50px]">
            Cómo comparamos planes de Isapre y qué fuentes usamos
          </h1>
          <p className="mt-5 max-w-3xl text-[16px] leading-relaxed text-white/76 sm:text-[18px]">
            Transparencia sobre datos, actualización, criterios de comparación, límites de la
            información y fuentes oficiales. La idea es que puedas comparar con contexto, no solo
            mirar un precio.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <HeroStat label="Planes activos" value={meta.plansTotal.toLocaleString("es-CL")} />
            <HeroStat label="UF usada" value={formatCLP(meta.ufValueCLP)} />
            <HeroStat label="Última actualización" value={meta.lastUpdate} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1080px] px-5 py-12 sm:px-6 md:py-16 lg:px-10">
        <div className="grid gap-5 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="flex gap-4 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-[#14dcb4]/25 bg-[#14dcb4]/12">
                <Icon className="h-5 w-5 text-[#0f9d8a]" />
              </div>
              <div>
                <h2 className="mb-1.5 text-[16px] font-bold text-[#0f514b]">{t}</h2>
                <p className="text-[14px] leading-relaxed text-slate-600">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1080px] px-5 sm:px-6 lg:px-10">
          <div className="mb-9 max-w-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
              Nuestro método
            </p>
            <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
              De una base de planes a una comparación entendible
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              El objetivo no es decir que existe un plan perfecto para todos, sino ayudarte a
              comparar alternativas con criterios consistentes.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {METHOD_STEPS.map((step) => (
              <div key={step.n} className="flex gap-4 rounded-[8px] border border-slate-200 bg-[#fbf8f3] p-5">
                <div className="text-[22px] font-extrabold tabular-nums text-[#14dcb4]">{step.n}</div>
                <div>
                  <h3 className="font-extrabold text-[#0f514b]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1080px] gap-8 px-5 py-16 sm:px-6 lg:grid-cols-2 lg:px-10">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#0f9d8a]" />
            <h2 className="text-2xl font-extrabold text-[#0f514b]">Qué comparamos</h2>
          </div>
          <div className="grid gap-3">
            {COMPARED_FIELDS.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[8px] border border-slate-200 bg-white p-4">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#0f9d8a]" />
                <p className="text-sm font-semibold leading-relaxed text-[#0f514b]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-5 flex items-center gap-3">
            <Scale className="h-6 w-6 text-[#0f9d8a]" />
            <h2 className="text-2xl font-extrabold text-[#0f514b]">Límites de la información</h2>
          </div>
          <div className="grid gap-3">
            {LIMITS.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-[8px] border border-amber-200 bg-amber-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                <p className="text-sm font-semibold leading-relaxed text-amber-950">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-[1080px] px-5 sm:px-6 lg:px-10">
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#14dcb4]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0f9d8a]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Fuentes oficiales
            </div>
            <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
              Dónde validar información sensible
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Usamos estas fuentes como referencia pública y dejamos enlaces visibles para que el
              usuario pueda contrastar información relevante antes de firmar.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                <span className="mt-2 block text-sm leading-relaxed text-slate-600">{source.text}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1080px] px-5 py-16 sm:px-6 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
            Sitios de Isapres
          </p>
          <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">
            Valida condiciones con cada institución
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            EligeTuPlan ayuda a comparar. La red final, documentos, canales oficiales y firma del
            contrato pertenecen a cada Isapre.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {isapres.map((isapre) => (
            <a
              key={isapre.slug}
              href={isapre.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#0f514b] no-underline hover:border-[#14dcb4]/45 hover:text-[#0f9d8a]"
            >
              {isapre.name}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[920px] px-5 py-12 sm:px-6 md:py-16 lg:px-10">
        <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-[#0f514b] md:text-3xl">
          Preguntas frecuentes
        </h2>
        <p className="mb-7 text-[15px] text-slate-500">
          Las dudas más comunes sobre cómo trabajamos, los datos y el sistema de Isapres.
        </p>
        <FaqAccordion items={FAQS} />
      </section>

      <InternalGuidesPanel
        title="Guías para seguir comparando"
        description="Si ya revisaste nuestra metodología, estas rutas te ayudan a llevar esa información a una decisión concreta."
        currentHref="/faq"
      />

      <section className="px-5 pb-16 sm:px-6 md:pb-24 lg:px-10">
        <div className="mx-auto max-w-[920px] rounded-[8px] bg-gradient-to-br from-[#0f514b] to-[#092e2a] p-7 text-center text-white md:p-10">
          <HeartPulse className="mx-auto mb-4 h-8 w-8 text-[#14dcb4]" />
          <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">
            ¿Te quedó alguna duda?
          </h2>
          <p className="mx-auto mb-6 max-w-[48ch] text-[15px] leading-relaxed text-white/70">
            Compara los planes tú mismo o escríbele a un asesor por WhatsApp. Sin compromiso.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/comparar/isapres"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[15px] font-bold text-white no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
            >
              Comparar planes <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/56968319807?text=Hola%2C%20tengo%20una%20pregunta."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-[15px] font-semibold text-white/90 no-underline transition-colors hover:bg-white/15"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/12 bg-white/8 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-white">{value}</p>
    </div>
  );
}
