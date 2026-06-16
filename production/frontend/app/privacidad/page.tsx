import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

const URL = "https://www.elige-tuplan.cl/privacidad";

export const metadata: Metadata = {
  title: "Política de Privacidad | EligeTuPlan",
  description:
    "Conoce qué datos puede solicitar EligeTuPlan, para qué se usan y cómo pedir información sobre su tratamiento.",
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Política de Privacidad | EligeTuPlan",
    description:
      "Información sobre uso de datos de contacto y solicitudes de orientación en EligeTuPlan.",
    url: URL,
    type: "website",
  },
};

export default function PrivacidadPage() {
  return (
    <main className="bg-[#fbf8f3] text-[#1e2a2a]">
      <section className="bg-[#0f514b] px-5 py-16 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-6 text-sm font-medium text-white/60">
            <Link href="/" className="no-underline hover:text-white">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Política de privacidad</span>
          </nav>
          <h1 className="text-[34px] font-extrabold leading-tight sm:text-[48px]">
            Política de privacidad
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/72">
            Última actualización: 16 de junio de 2026.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <Block title="Qué datos podemos solicitar">
            <p>
              Cuando usas formularios, WhatsApp o herramientas de orientación, podemos solicitar
              datos de contacto y antecedentes necesarios para responder tu consulta, como nombre,
              teléfono, correo, edad, renta aproximada, cargas o preferencias de cobertura.
            </p>
          </Block>

          <Block title="Para qué usamos esos datos">
            <p>
              Usamos la información para responder solicitudes, orientar la comparación de planes,
              mejorar la experiencia del sitio y mantener registros operativos de contacto. No debes
              enviar datos médicos sensibles si no son necesarios para la orientación solicitada.
            </p>
          </Block>

          <Block title="Fuentes y servicios externos">
            <p>
              El sitio puede usar herramientas de analítica, medición de campañas y formularios para
              operar correctamente. Las condiciones finales de contratación siempre deben revisarse
              con la Isapre correspondiente.
            </p>
          </Block>

          <Block title="Cómo contactarnos">
            <p>
              Para consultar por tus datos o pedir información sobre su tratamiento, escríbenos a{" "}
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
