import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ShieldCheck, HeartPulse, Search, User, Calendar, Phone } from "lucide-react";
import LeadCaptureForm from "@/components/ui/lead-capture-form";
import WhatsAppCTA from "@/components/landing/whatsapp-cta";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { FAQPageSchema } from "@/components/seo/FAQPageSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

const URL = "https://www.elige-tuplan.cl/cambiar-isapre";

export const metadata: Metadata = {
  title: "Cómo Cambiar de Isapre — Guía y Asesoría Gratis",
  description:
    "Cámbiate de Isapre sin líos. Te acompañamos paso a paso y comparamos más de 2.000 planes con datos oficiales para que no pierdas cobertura. Asesoría 100% gratuita.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Cómo Cambiar de Isapre — Guía y Asesoría Gratis",
    description:
      "Te acompañamos paso a paso para cambiarte de Isapre sin perder cobertura. 100% gratis.",
    url: URL,
    type: "website",
  },
};

const ESCENARIOS = [
  {
    icon: Search,
    title: "Te subieron el precio del plan",
    desc: "Si tu plan subió y ya no calza con tu 7%, comparamos alternativas equivalentes para ver si hay algo mejor a tu precio.",
  },
  {
    icon: HeartPulse,
    title: "Viene un bebé en camino",
    desc: "La cobertura de maternidad varía mucho entre planes. Conviene revisar antes de que llegue para no quedar corto.",
  },
  {
    icon: User,
    title: "Sumaste cargas a tu grupo",
    desc: "Cónyuge o hijos cambian el factor de tu plan. A veces conviene reestructurar para cubrir a todo el grupo mejor.",
  },
  {
    icon: Calendar,
    title: "Cambió tu sueldo o etapa",
    desc: "Un nuevo trabajo, independencia o la jubilación cambian lo que puedes destinar a salud. Vale la pena recalcular.",
  },
];

const PASOS = [
  { n: "01", t: "Reúne tu plan actual", d: "Tu cartola o contrato vigente. Con eso vemos qué cobertura tienes hoy y cuánto pagas." },
  { n: "02", t: "Comparamos alternativas", d: "Cruzamos tu perfil con más de 2.000 planes vigentes de las 7 Isapres, datos oficiales de la Superintendencia." },
  { n: "03", t: "Cotizas con la nueva Isapre", d: "Te mostramos las mejores opciones a tu precio y resolvemos tus dudas, sin compromiso." },
  { n: "04", t: "Declaración de salud", d: "La nueva Isapre evalúa tu declaración. Te orientamos antes para que sepas qué esperar y evites sorpresas." },
  { n: "05", t: "Firma y traspaso", d: "Firmas online y la nueva Isapre gestiona el cambio. Nosotros te acompañamos hasta el final. Sin costo." },
];

const FAQS = [
  {
    question: "¿Puedo cambiarme de Isapre cuando quiera?",
    answer:
      "Existe un período mínimo de permanencia en tu plan actual antes de poder cambiarte. Un asesor te confirma si ya estás habilitado según tu caso y la normativa vigente.",
  },
  {
    question: "¿Pierdo cobertura al cambiarme?",
    answer:
      "La nueva Isapre evalúa tu declaración de salud. Por eso te orientamos antes de mover nada, para que elijas un plan que mantenga o mejore tu cobertura sin sorpresas.",
  },
  {
    question: "¿El trámite es complicado?",
    answer:
      "No. Te acompañamos en cada paso y todo se hace 100% online con firma electrónica. La nueva Isapre se encarga del traspaso desde la anterior.",
  },
  {
    question: "¿Me conviene cambiarme si me subieron el plan?",
    answer:
      "Depende de tu caso. Comparamos tu plan actual con las alternativas del mercado a tu mismo precio; si hay algo mejor, te lo mostramos. Si no, te lo decimos con franqueza.",
  },
  {
    question: "¿Tiene costo cambiarse con ustedes?",
    answer:
      "No, es 100% gratis. Recibimos una comisión regulada de la Isapre cuando contratas, lo que no afecta el precio de tu plan.",
  },
];

const WA_MESSAGE = "Hola, quiero cambiarme de Isapre y necesito asesoría.";

export default function CambiarIsaprePage() {
  return (
    <>
      <ServiceSchema
        name="Asesoría para cambiar de Isapre"
        description="Te acompañamos paso a paso para cambiarte de Isapre sin perder cobertura, comparando más de 2.000 planes con datos oficiales. Sin costo."
        url={URL}
      />
      <FAQPageSchema items={FAQS} />
      <BreadcrumbSchema
        items={[
          { name: "Inicio", url: "https://www.elige-tuplan.cl" },
          { name: "Cambiar de Isapre", url: URL },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f514b] text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#14dcb4]/15 blur-3xl pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <nav className="text-[13px] font-medium text-white/55 mb-6">
            <Link href="/" className="hover:text-white no-underline">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white/80">Cambiar de Isapre</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14dcb4]/15 border border-[#14dcb4]/40 text-[11px] font-bold tracking-[0.08em] uppercase text-[#14dcb4] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
            Te acompañamos paso a paso
          </div>

          <h1 className="text-[34px] sm:text-[48px] font-extrabold leading-[1.05] tracking-tight max-w-3xl">
            Cambia de Isapre sin líos y sin perder cobertura
          </h1>
          <p className="mt-5 text-[16px] sm:text-[18px] text-white/85 leading-relaxed max-w-2xl">
            Comparamos tu plan actual con más de 2.000 planes vigentes y te acompañamos en todo el
            proceso, de principio a fin. Datos oficiales de la Superintendencia. 100% gratis.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <WhatsAppCTA source="cambiar_isapre" message={WA_MESSAGE} label="Quiero cambiarme" />
            <Link
              href="/comparar/isapres"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base bg-white/10 border border-white/25 text-white hover:bg-white/15 transition-all no-underline"
            >
              Ver más de 2.000 planes
            </Link>
          </div>
        </div>
      </section>

      {/* Cuándo conviene */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] text-center mb-3">
            ¿Cuándo conviene cambiarse?
          </h2>
          <p className="text-center text-slate-500 max-w-xl mx-auto mb-14">
            Si te identificas con alguna de estas situaciones, vale la pena revisar tus opciones.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {ESCENARIOS.map((e, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 shadow-sm bg-white p-7 hover:shadow-md transition-shadow flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#14dcb4]/15 text-[#0f9d8a] flex items-center justify-center shrink-0">
                  <e.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0f514b] mb-1.5">{e.title}</h3>
                  <p className="text-[14px] text-slate-600 leading-relaxed">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tus opciones / derechos */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14dcb4]/10 text-[#0f9d8a] text-[11px] font-bold tracking-[0.08em] uppercase mb-5">
            <ShieldCheck className="w-3.5 h-3.5" /> Conoce tus opciones
          </div>
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] mb-4 leading-tight">
            Cambiarte de Isapre es tu derecho
          </h2>
          <p className="text-slate-600 leading-relaxed">
            Puedes cambiar de Isapre cumpliendo el período de permanencia de tu plan actual. La
            nueva Isapre evalúa tu declaración de salud según la normativa vigente. Como las
            condiciones y plazos cambian, un asesor te confirma exactamente qué aplica a tu caso
            antes de que tomes cualquier decisión, para que no te lleves sorpresas.
          </p>
        </div>
      </section>

      {/* Proceso 5 pasos */}
      <section className="bg-[#f8fafc] py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] text-center mb-14">
            El proceso, en 5 pasos
          </h2>
          <div className="space-y-4">
            {PASOS.map((p) => (
              <div key={p.n} className="flex items-start gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="text-[22px] font-extrabold text-[#14dcb4] tabular-nums shrink-0 w-10">{p.n}</div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0f514b] mb-1.5">{p.t}</h3>
                  <p className="text-[14px] text-slate-600 leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#0f514b] text-center mb-12">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-[#f8fafc] p-6 rounded-2xl border border-slate-200">
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
                Empieza tu cambio hoy
              </h2>
              <p className="text-white/80 leading-relaxed mb-6">
                Déjanos tus datos y un asesor te contacta en menos de 24 horas para revisar tu
                plan actual y mostrarte si hay algo mejor. O escríbenos directo por WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <WhatsAppCTA source="cambiar_isapre" message={WA_MESSAGE} label="Escribir por WhatsApp" />
                <a href="tel:+56968319807" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold text-base bg-white/10 border border-white/25 text-white hover:bg-white/15 transition-all no-underline">
                  <Phone className="w-5 h-5" /> +56 9 6831 9807
                </a>
              </div>
              <p className="text-[13px] text-white/55">Sin spam · Sin compromiso · 100% gratis</p>
            </div>
            <LeadCaptureForm formType="asesor" />
          </div>
        </div>
      </section>
    </>
  );
}
