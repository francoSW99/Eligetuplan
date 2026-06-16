import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Phone, Search, FileText, HeartPulse } from "lucide-react";
import LeadCaptureForm from "@/components/ui/lead-capture-form";
import WhatsAppCTA from "@/components/landing/whatsapp-cta";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

const URL = "https://www.elige-tuplan.cl/asesor-isapre";

export const metadata: Metadata = {
  title: "Asesor Isapre Gratis — Te Llamamos en 24 Horas",
  description:
    "Asesor certificado de Isapre te contacta en menos de 24h. Sin spam, sin llamadas no solicitadas, 100% gratuito. Compara más de 2.000 planes con datos oficiales de la Superintendencia.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Asesor Isapre Gratis — Te Llamamos en 24 Horas",
    description:
      "Asesoría certificada para elegir tu plan de Isapre. Sin spam, 100% gratis, datos oficiales.",
    url: URL,
    type: "website",
  },
};

const FAQS = [
  {
    question: "¿Cuánto cuesta la asesoría?",
    answer:
      "Nada. Puedes pedir orientación sin costo para ti. Antes de contratar, valida siempre precio final, documentos y condiciones directamente con la Isapre correspondiente.",
  },
  {
    question: "¿En cuánto tiempo me contactan?",
    answer:
      "Un asesor certificado te contacta en menos de 24 horas por el canal que prefieras: WhatsApp, llamada o correo.",
  },
  {
    question: "¿Me van a llenar de llamadas o spam?",
    answer:
      "No. Solo te contactamos por el medio que tú elijas y para lo que pediste. Sin llamadas no solicitadas ni formularios eternos.",
  },
  {
    question: "¿Con qué Isapres trabajan?",
    answer:
      "Comparamos las 7 Isapres del sistema con datos oficiales de la Superintendencia de Salud: más de 2.000 planes vigentes que se actualizan periódicamente.",
  },
  {
    question: "¿Tengo que ir a una oficina?",
    answer:
      "No. Todo el proceso —comparar, elegir y firmar— se hace 100% online con firma electrónica avanzada. Tú decides el ritmo.",
  },
];

const PASOS = [
  {
    icon: FileText,
    title: "Cuéntanos tu situación",
    desc: "Tu edad, sueldo y cargas. Por WhatsApp o en un formulario corto. Toma menos de 2 minutos.",
  },
  {
    icon: Search,
    title: "Analizamos más de 2.000 planes",
    desc: "Cruzamos tu perfil con los planes vigentes de las 7 Isapres usando datos oficiales de la Superintendencia.",
  },
  {
    icon: ShieldCheck,
    title: "Un asesor te acompaña hasta la firma",
    desc: "Te explicamos las mejores opciones y resolvemos tus dudas. Si decides contratar, te guiamos en el proceso. Sin costo.",
  },
];

const DIFERENCIADORES = [
  "Comparamos las 7 Isapres, no te empujamos una sola marca",
  "Datos oficiales de la Superintendencia, no promesas de vendedor",
  "Sin spam ni llamadas no solicitadas: tú eliges cómo te contactamos",
  "Calculadora del 7% sin pedirte email ni datos",
  "Atención por WhatsApp, directo con una persona",
  "Puedes comparar y pedir orientación sin costo para ti",
];

const WA_MESSAGE = "Hola, quiero asesoría gratuita para elegir mi plan de Isapre.";

export default function AsesorIsaprePage() {
  return (
    <>
      <ServiceSchema
        name="Asesoría gratuita en planes de salud Isapre"
        description="Asesor certificado que compara las 7 Isapres con datos oficiales de la Superintendencia y te acompaña hasta la firma, sin costo."
        url={URL}
      />
      <FAQPageSchema
        items={FAQS}
        name="Preguntas frecuentes sobre asesoría Isapre"
        url={URL}
      />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: "https://www.elige-tuplan.cl" },
          { name: "Asesor Isapre", url: URL },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f514b] text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#14dcb4]/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <nav className="text-[13px] font-medium text-white/55 mb-6">
            <Link href="/" className="hover:text-white no-underline">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Asesor Isapre</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14dcb4]/15 border border-[#14dcb4]/40 text-[11px] font-bold tracking-[0.08em] uppercase text-[#14dcb4] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
            Asesoría 100% gratuita
          </div>

          <h1 className="text-[34px] sm:text-[48px] font-extrabold leading-[1.05] tracking-tight max-w-3xl">
            Asesor de Isapre gratis que te contacta en menos de 24 horas
          </h1>
          <p className="mt-5 text-[16px] sm:text-[18px] text-white/85 leading-relaxed max-w-2xl">
            Un asesor certificado compara las 7 Isapres por ti con datos oficiales de la
            Superintendencia y te acompaña hasta la firma. Sin spam, sin llamadas no
            solicitadas, sin costo.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <WhatsAppCTA source="asesor_isapre" message={WA_MESSAGE} label="Hablar con un asesor" />
            <a
              href="#cotizar"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base bg-white/10 border border-white/25 text-white hover:bg-white/15 transition-all no-underline"
            >
              Dejar mis datos
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/70">
            <span className="inline-flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#14dcb4]" /> Más de 2.000 planes comparados</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#14dcb4]" /> Respuesta en 24h</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-[#14dcb4]" /> Sin compromiso</span>
          </div>
        </div>
      </section>

      {/* Pasos */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] text-center mb-3">
            Cómo funciona, en 3 pasos
          </h2>
          <p className="text-center text-slate-500 max-w-xl mx-auto mb-14">
            Simple y transparente. Tú decides hasta dónde avanzar en cada etapa.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {PASOS.map((p, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 shadow-sm bg-white p-7 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-[#14dcb4]/15 text-[#0f9d8a] flex items-center justify-center mb-5">
                  <p.icon className="w-6 h-6" />
                </div>
                <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#14dcb4] mb-2">Paso {i + 1}</div>
                <h3 className="text-[18px] font-bold text-[#0f514b] mb-2">{p.title}</h3>
                <p className="text-[14px] text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué somos distintos */}
      <section className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14dcb4]/10 text-[#0f9d8a] text-[11px] font-bold tracking-[0.08em] uppercase mb-5">
                <HeartPulse className="w-3.5 h-3.5" /> En qué nos diferenciamos
              </div>
              <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] mb-4 leading-tight">
                No somos un vendedor de una sola Isapre
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Los corredores tradicionales suelen empujarte la marca que más les conviene.
                Nosotros partimos de los datos oficiales de las 7 Isapres y te mostramos lo que
                realmente calza con tu perfil y tu bolsillo.
              </p>
              <WhatsAppCTA source="asesor_isapre" message={WA_MESSAGE} label="Quiero que me asesoren" variant="solid" />
            </div>
            <ul className="space-y-3">
              {DIFERENCIADORES.map((d, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 py-3.5">
                  <CheckCircle className="w-5 h-5 text-[#14dcb4] shrink-0 mt-0.5" />
                  <span className="text-[14.5px] text-[#0f514b] font-medium">{d}</span>
                </li>
              ))}
            </ul>
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
                Habla con un asesor hoy
              </h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Déjanos tus datos y un asesor certificado te contacta en menos de 24 horas con
                las mejores opciones para tu perfil. O escríbenos directo por WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <WhatsAppCTA source="asesor_isapre" message={WA_MESSAGE} label="Escribir por WhatsApp" />
                <a href="tel:+56968319807" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base bg-white/10 border border-white/25 text-white hover:bg-white/15 transition-all no-underline">
                  <Phone className="w-5 h-5" /> +56 9 6831 9807
                </a>
              </div>
              <p className="text-[13px] text-white/55">
                Sin spam · Sin compromiso · 100% gratis
              </p>
            </div>
            <LeadCaptureForm formType="asesor" />
          </div>
        </div>
      </section>
    </>
  );
}
