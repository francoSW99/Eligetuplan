import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

const URL = "https://www.elige-tuplan.cl/terminos";

export const metadata: Metadata = {
  title: "Términos y Condiciones | EligeTuPlan",
  description:
    "Condiciones generales de uso de EligeTuPlan como plataforma informativa para comparar planes de Isapre.",
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Términos y Condiciones | EligeTuPlan",
    description:
      "Condiciones generales de uso de EligeTuPlan y límites de la información publicada.",
    url: URL,
    type: "website",
  },
};

export default function TerminosPage() {
  return (
    <main className="bg-[#fbf8f3] text-[#1e2a2a]">
      <section className="bg-[#0f514b] px-5 py-16 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-6 text-sm font-medium text-white/60">
            <Link href="/" className="no-underline hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Términos y condiciones</span>
          </nav>
          <h1 className="text-[34px] font-extrabold leading-tight sm:text-[48px]">
            Términos y condiciones
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/72">
            Última actualización: 16 de junio de 2026.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Block title="Uso del sitio">
            <p>
              EligeTuPlan entrega información orientativa para comparar planes de salud Isapre,
              revisar criterios de decisión y solicitar contacto con un asesor cuando el usuario lo
              pide.
            </p>
          </Block>

          <Block title="Información de planes">
            <p>
              Los precios, coberturas, redes, topes y documentos publicados pueden cambiar. Antes de
              contratar, siempre debes validar la información final directamente con la Isapre
              correspondiente y revisar los documentos oficiales del contrato.
            </p>
          </Block>

          <Block title="Sin reemplazo de evaluación oficial">
            <p>
              EligeTuPlan no reemplaza la evaluación de declaración de salud, aceptación,
              contratación, continuidad, exclusiones o condiciones particulares que correspondan a
              cada Isapre.
            </p>
          </Block>

          <Block title="Contacto">
            <p>
              Para preguntas sobre el uso del sitio, escríbenos a{" "}
              <a className="font-semibold text-[#0f9d8a]" href="mailto:contacto@eligetuplan.cl">
                contacto@eligetuplan.cl
              </a>.
            </p>
          </Block>
        </div>
      </section>
    </main>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-extrabold text-[#0f514b]">{title}</h2>
      <div className="mt-3 text-[15px] leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}
