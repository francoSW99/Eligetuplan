import type { Metadata } from "next";
import BuscarClient from "./buscar-client";

const URL = "https://www.elige-tuplan.cl/buscar";

export const metadata: Metadata = {
  title: "Cotiza un Plan de Isapre con Asesor Gratis | EligeTuPlan",
  description:
    "Déjanos tus datos y un asesor certificado te contacta en menos de 24 horas para cotizar planes de Isapre. Sin costo, sin spam y sin compromiso.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Cotiza un Plan de Isapre con Asesor Gratis | EligeTuPlan",
    description:
      "Asesoría gratuita para cotizar planes de Isapre según tu sueldo, edad, región y cargas.",
    url: URL,
    type: "website",
  },
};

export default function BuscarPage() {
  return <BuscarClient />;
}
