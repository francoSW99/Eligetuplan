import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Sparkles, Check, Users, ArrowRight } from "lucide-react";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import FaqAccordion, { type QA } from "@/components/faq/faq-accordion";

export const metadata: Metadata = {
  title: { absolute: "Quiénes somos — EligeTuPlan" },
  description:
    "Somos un comparador 100% gratuito de planes de salud Isapre en Chile, con datos oficiales de la Superintendencia. Conoce cómo trabajamos y resuelve tus dudas.",
  alternates: { canonical: "https://www.elige-tuplan.cl/faq" },
  openGraph: {
    title: "Quiénes somos — EligeTuPlan",
    description:
      "Comparador 100% gratuito de planes de salud Isapre con datos oficiales. Sin spam, sin letra chica.",
    url: "https://www.elige-tuplan.cl/faq",
    type: "website",
  },
};

const VALUES = [
  {
    icon: Sparkles,
    t: "100% gratis, de verdad",
    d: "No te cobramos nada. Recibimos una comisión regulada por ley directamente de la Isapre, y eso no cambia el precio de tu plan.",
  },
  {
    icon: Shield,
    t: "Datos oficiales",
    d: "Comparamos con información de la Superintendencia de Salud, actualizada periódicamente. Sin precios inventados ni letra chica.",
  },
  {
    icon: Check,
    t: "Sin spam ni presión",
    d: "Tú decides si quieres que un asesor te contacte. Nada de llamadas no solicitadas ni correos eternos.",
  },
  {
    icon: Users,
    t: "Asesoría humana cuando la necesitas",
    d: "Si te trabas, un asesor certificado te acompaña —gratis y online— hasta firmar. Tú mantienes el control.",
  },
];

const FAQS: QA[] = [
  {
    q: "¿Es realmente 100% gratuito?",
    a: "Sí, completamente gratis para ti. Recibimos una comisión estándar regulada por la ley directamente de las Isapres, lo que no afecta el precio final de tu plan.",
  },
  {
    q: "¿De dónde sacan los datos de los planes?",
    a: "De fuentes oficiales de la Superintendencia de Salud, el organismo que regula a las Isapres en Chile. Sincronizamos los planes vigentes de las 7 Isapres periódicamente para que compares con información real y actualizada.",
  },
  {
    q: "¿Cómo eligen qué plan me conviene?",
    a: "Nuestro algoritmo cruza el precio en pesos (calculado según la UF del día), la cobertura hospitalaria y ambulatoria, el tope anual y tus clínicas de preferencia para ordenar matemáticamente las mejores opciones según tu perfil.",
  },
  {
    q: "¿Puedo cambiarme de Isapre cuando quiera?",
    a: "En general sí, pero conviene revisar tu situación antes (permanencia, preexistencias y carencias). Te ayudamos a comparar tu plan actual con el resto del mercado para que decidas con datos, y un asesor puede orientarte sobre la viabilidad del cambio.",
  },
  {
    q: "¿Qué pasa con mis preexistencias médicas?",
    a: "Toda declaración de salud la evalúa la Isapre receptora. Nuestros asesores te orientan sobre la viabilidad de aprobación antes de que envíes tu solicitud oficial, para que no pierdas el tiempo.",
  },
  {
    q: "¿El trámite se hace presencial?",
    a: "No. Todo el proceso de selección y firma de contratos se hace 100% online, con firma electrónica avanzada.",
  },
  {
    q: "¿Me van a llamar o llenar de correos?",
    a: "Solo si tú lo pides. Puedes comparar planes y ver tus resultados sin entregar tus datos. El contacto con un asesor es opcional y bajo tu control.",
  },
];

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      <FAQPageSchema items={FAQS.map((f) => ({ question: f.q, answer: f.a }))} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white overflow-hidden">
        <div
          className="absolute -top-[30%] -right-[8%] w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(20,220,180,.16) 0%, transparent 60%)" }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[920px] px-5 sm:px-6 lg:px-10 py-3.5 md:py-5">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#14dcb4] mb-1">
            · Quiénes somos ·
          </div>
          <h1 className="text-xl md:text-[26px] font-extrabold tracking-[-0.02em] leading-[1.12] max-w-[26ch]">
            Comparar tu plan de salud, <span className="serif italic font-medium text-[#14dcb4]">sin letra chica</span>
          </h1>
          <p className="mt-1.5 text-white/65 text-[13px] md:text-[13.5px] leading-snug max-w-[640px]">
            EligeTuPlan es un comparador independiente de planes de las 7 Isapres de Chile. Reunimos los datos oficiales en un solo lugar para que elijas con información real.
          </p>
        </div>
      </section>

      {/* Valores */}
      <section className="mx-auto max-w-[1080px] px-5 sm:px-6 lg:px-10 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 gap-5">
          {VALUES.map(({ icon: Icon, t, d }) => (
            <div
              key={t}
              className="flex gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="shrink-0 w-11 h-11 rounded-xl bg-[#14dcb4]/12 border border-[#14dcb4]/25 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#0f9d8a]" />
              </div>
              <div>
                <h2 className="font-bold text-[#0f514b] text-[16px] mb-1.5">{t}</h2>
                <p className="text-slate-600 text-[14px] leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo se financia (transparencia) */}
      <section className="mx-auto max-w-[920px] px-5 sm:px-6 lg:px-10 pb-4">
        <div className="rounded-2xl bg-[#0f514b]/[0.04] border border-[#0f514b]/10 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-[#0f514b] tracking-tight mb-3">
            ¿Por qué es gratis? Te lo explicamos claro
          </h2>
          <p className="text-slate-600 text-[15px] leading-relaxed">
            Cuando contratas un plan a través de un asesor, la Isapre paga una comisión regulada por
            la ley —igual que en cualquier corredora—. Esa comisión la paga la Isapre, no tú, y{" "}
            <strong className="text-[#0f514b] font-semibold">no cambia el precio de tu plan</strong>.
            Por eso podemos ofrecerte la comparación y la asesoría sin costo. Nuestro incentivo es
            que quedes conforme y nos recomiendes.
          </p>
        </div>
      </section>

      {/* Preguntas */}
      <section className="mx-auto max-w-[920px] px-5 sm:px-6 lg:px-10 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f514b] tracking-tight mb-2">
          Preguntas frecuentes
        </h2>
        <p className="text-slate-500 text-[15px] mb-7">
          Las dudas más comunes sobre cómo trabajamos y el sistema de Isapres.
        </p>
        <FaqAccordion items={FAQS} />
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-6 lg:px-10 pb-16 md:pb-24">
        <div className="mx-auto max-w-[920px] rounded-2xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white p-7 md:p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            ¿Te quedó alguna duda?
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed mb-6 max-w-[48ch] mx-auto">
            Compara los planes tú mismo o escríbele a un asesor por WhatsApp. Sin compromiso.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/comparar/isapres"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[15px] text-white no-underline transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
            >
              Comparar planes <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/56968319807?text=Hola%2C%20tengo%20una%20pregunta."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-[15px] text-white/90 bg-white/10 border border-white/20 no-underline hover:bg-white/15 transition-colors"
            >
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
