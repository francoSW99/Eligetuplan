import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, X, Search, HeartPulse, ShieldCheck } from "lucide-react";
import LeadCaptureForm from "@/components/ui/lead-capture-form";
import WhatsAppCTA from "@/components/landing/whatsapp-cta";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

const URL = "https://www.elige-tuplan.cl/pasar-fonasa-a-isapre";

export const metadata: Metadata = {
  title: "¿Pasar de Fonasa a Isapre? Conviene o No — Calcúlalo Gratis",
  description:
    "¿Te conviene pasarte de Fonasa a Isapre? Comparamos ambos sistemas con datos reales y calculamos qué planes alcanzas con tu 7%. Asesoría 100% gratuita, sin compromiso.",
  alternates: { canonical: URL },
  openGraph: {
    title: "¿Pasar de Fonasa a Isapre? Conviene o No — Calcúlalo Gratis",
    description:
      "Comparamos Fonasa vs Isapre con datos reales y vemos qué planes alcanzas con tu sueldo. Gratis.",
    url: URL,
    type: "website",
  },
};

const FONASA = [
  { ok: true, t: "Gratis o de bajo costo en los tramos de menor ingreso" },
  { ok: true, t: "No te rechazan ni encarecen por preexistencias" },
  { ok: true, t: "Cubre a tus cargas sin costo adicional por cada una" },
  { ok: false, t: "Tiempos de espera más largos en la red pública" },
  { ok: false, t: "Menos libertad para elegir clínica o especialista" },
];

const ISAPRE = [
  { ok: true, t: "Acceso a clínicas privadas y atención más rápida" },
  { ok: true, t: "Planes a tu medida, con mejor cobertura según lo que pagues" },
  { ok: true, t: "Coberturas ambulatorias y hospitalarias más altas" },
  { ok: false, t: "Cuesta más: pagas un adicional sobre tu 7%" },
  { ok: false, t: "Hay declaración de salud y el precio sube con la edad" },
];

const SI = [
  "Tu 7% alcanza para un plan que mejore lo que tienes hoy",
  "Valoras atención en clínicas privadas y tiempos más cortos",
  "No tienes preexistencias que encarezcan mucho el plan",
  "Quieres cobertura de maternidad o un especialista específico",
];

const NO = [
  "Tu 7% no alcanza para un plan que supere tu cobertura actual",
  "Tienes preexistencias que disparan el precio del plan",
  "Estás cómodo con tu red de atención actual",
  "Prefieres no pagar un adicional mensual por sobre el 7%",
];

const FAQS = [
  {
    question: "¿Qué es el 7% y por qué importa?",
    answer:
      "La ley reserva el 7% de tu sueldo imponible para salud. En Fonasa va completo al sistema estatal. En una Isapre, ese 7% es la base de tu plan y, si quieres más cobertura, pagas un adicional por sobre ese monto.",
  },
  {
    question: "¿Me pueden rechazar al pasarme a una Isapre?",
    answer:
      "La Isapre evalúa tu declaración de salud. Algunas preexistencias pueden encarecer el plan o tener coberturas acotadas por un tiempo. Te orientamos antes para que sepas qué esperar en tu caso.",
  },
  {
    question: "¿Siempre conviene pasarse a Isapre?",
    answer:
      "No. Si tu 7% no alcanza para un plan que mejore tu cobertura actual, o tienes preexistencias que lo encarecen mucho, Fonasa puede ser la mejor opción. Te lo decimos con franqueza, sin empujarte a contratar.",
  },
  {
    question: "¿Cuánto cuesta que me asesoren?",
    answer:
      "Nada. Puedes evaluar alternativas y pedir orientación sin costo para ti. Antes de contratar, valida siempre precio final, documentos y condiciones directamente con la Isapre correspondiente.",
  },
];

const WA_MESSAGE = "Hola, estoy en Fonasa y quiero evaluar pasarme a una Isapre.";

export default function PasarFonasaIsaprePage() {
  return (
    <>
      <ServiceSchema
        name="Asesoría para pasar de Fonasa a Isapre"
        description="Comparamos Fonasa e Isapre con datos reales y calculamos qué planes alcanzas con tu 7%, sin costo y sin presión por contratar."
        url={URL}
      />
      <FAQPageSchema
        items={FAQS}
        name="Preguntas frecuentes sobre pasar de Fonasa a Isapre"
        url={URL}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: "https://www.elige-tuplan.cl" },
          { name: "Pasar de Fonasa a Isapre", url: URL },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f514b] text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#14dcb4]/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <nav className="text-[13px] font-medium text-white/55 mb-6">
            <Link href="/" className="hover:text-white no-underline">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Pasar de Fonasa a Isapre</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14dcb4]/15 border border-[#14dcb4]/40 text-[11px] font-bold tracking-[0.08em] uppercase text-[#14dcb4] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
            Comparación honesta
          </div>

          <h1 className="text-[34px] sm:text-[48px] font-extrabold leading-[1.05] tracking-tight max-w-3xl">
            ¿Te conviene pasarte de Fonasa a Isapre? Calculémoslo
          </h1>
          <p className="mt-5 text-[16px] sm:text-[18px] text-white/85 leading-relaxed max-w-2xl">
            No siempre conviene, y te lo decimos con franqueza. Comparamos ambos sistemas con
            datos reales y vemos qué planes alcanzas con tu 7%. Sin costo, sin presión.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <WhatsAppCTA source="fonasa_isapre" message={WA_MESSAGE} label="Evaluar mi caso" />
            <Link
              href="/comparar/isapres"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base bg-white/10 border border-white/25 text-white hover:bg-white/15 transition-all no-underline"
            >
              Ver qué planes alcanzo
            </Link>
          </div>
        </div>
      </section>

      {/* El 7% */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14dcb4]/10 text-[#0f9d8a] text-[11px] font-bold tracking-[0.08em] uppercase mb-5">
            <Search className="w-3.5 h-3.5" /> Lo primero: tu 7%
          </div>
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] mb-4 leading-tight">
            Todo parte de cuánto puedes destinar a salud
          </h2>
          <p className="text-slate-600 leading-relaxed mb-7">
            La ley reserva el <strong className="text-[#0f514b]">7% de tu sueldo imponible</strong> para
            salud. En Fonasa va completo al sistema estatal. En una Isapre, ese 7% es la base de
            tu plan: si quieres más cobertura, pagas un adicional. La pregunta clave es si tu 7%
            alcanza para un plan que mejore lo que ya tienes.
          </p>
          <Link
            href="/comparar/isapres"
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base text-white shadow-lg transition-all hover:-translate-y-0.5 no-underline"
            style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
          >
            Calcular qué planes alcanzo con mi sueldo
          </Link>
        </div>
      </section>

      {/* Comparación Fonasa vs Isapre */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] text-center mb-3">
            Fonasa vs Isapre, sin letra chica
          </h2>
          <p className="text-center text-slate-500 max-w-xl mx-auto mb-14">
            Cada sistema tiene lo suyo. Esto es lo que de verdad cambia para ti.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h3 className="text-[20px] font-extrabold text-[#0f514b] mb-5">Fonasa</h3>
              <ul className="space-y-3">
                {FONASA.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {item.ok ? (
                      <CheckCircle className="w-5 h-5 text-[#14dcb4] shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[14.5px] text-slate-700">{item.t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-[#14dcb4]/40 bg-white p-7 shadow-md">
              <h3 className="text-[20px] font-extrabold text-[#0f514b] mb-5">Isapre</h3>
              <ul className="space-y-3">
                {ISAPRE.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {item.ok ? (
                      <CheckCircle className="w-5 h-5 text-[#14dcb4] shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    )}
                    <span className="text-[14.5px] text-slate-700">{item.t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Cuándo sí / cuándo no */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[#14dcb4]/30 bg-[#14dcb4]/5 p-7">
              <div className="flex items-center gap-2 mb-5">
                <HeartPulse className="w-5 h-5 text-[#0f9d8a]" />
                <h3 className="text-[18px] font-extrabold text-[#0f514b]">Cuándo SÍ pasarte</h3>
              </div>
              <ul className="space-y-3">
                {SI.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#14dcb4] shrink-0 mt-0.5" />
                    <span className="text-[14.5px] text-[#0f514b] font-medium">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-7">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="w-5 h-5 text-slate-500" />
                <h3 className="text-[18px] font-extrabold text-[#0f514b]">Cuándo mejor NO</h3>
              </div>
              <ul className="space-y-3">
                {NO.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-[14.5px] text-slate-700">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-[16px] font-bold text-[#0f514b] mb-2">{faq.question}</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Form */}
      <section id="cotizar" className="bg-[#0f514b] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-10 items-center">
            <div className="text-white">
              <h2 className="text-[28px] sm:text-[34px] font-extrabold leading-tight mb-4">
                Resolvámoslo en tu caso concreto
              </h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Déjanos tus datos y un asesor calcula con tu sueldo si te conviene pasarte y a qué
                plan. Si Fonasa te conviene más, también te lo diremos. Sin presión.
              </p>
              <WhatsAppCTA source="fonasa_isapre" message={WA_MESSAGE} label="Escribir por WhatsApp" className="mb-6" />
              <p className="text-[13px] text-white/55">Sin spam · Sin compromiso · 100% gratis</p>
            </div>
            <LeadCaptureForm formType="asesor" />
          </div>
        </div>
      </section>
    </>
  );
}
