import type { Metadata } from "next";
import TuMejorPlanClient from "./tu-mejor-plan-client";

const URL = "https://www.elige-tuplan.cl/tu-mejor-plan";

export const metadata: Metadata = {
  title: "Encuentra tu Mejor Plan de Isapre con IA | EligeTuPlan",
  description:
    "Responde unas preguntas y encuentra el plan de Isapre que mejor calza con tu sueldo, edad, cargas y cobertura actual. Gratis y con datos oficiales.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Encuentra tu Mejor Plan de Isapre con IA | EligeTuPlan",
    description:
      "Compara tu plan actual contra alternativas del mercado y recibe una recomendación personalizada en minutos.",
    url: URL,
    type: "website",
  },
};

export default function TuMejorPlanPage() {
  return <TuMejorPlanClient />;
}
