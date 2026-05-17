import { HelpCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "¿Es realmente 100% gratuito?",
      a: "Sí, nuestro servicio es completamente gratis para el usuario. Nosotros recibimos una comisión estándar directamente de las Isapres regulada por la ley, lo que no afecta el precio final de tu plan."
    },
    {
      q: "¿Cómo calculan el puntaje de los planes?",
      a: "Nuestro algoritmo de IA cruza el precio en pesos (calculado según la UF del día), el nivel de cobertura hospitalaria y ambulatoria, el tope anual en UF y tus clínicas de preferencia para rankear matemáticamente las mejores opciones."
    },
    {
      q: "¿Qué pasa con mis preexistencias médicas?",
      a: "Toda declaración de salud es evaluada directamente por la Isapre receptora. Sin embargo, nuestros asesores te orientarán sobre la viabilidad de aprobación antes de que envíes tu solicitud oficial."
    },
    {
      q: "¿El trámite se hace presencial?",
      a: "¡No! Todo el proceso de selección y firma de contratos se hace hoy en día 100% online y con firma electrónica avanzada."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-24">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex flex-col items-center mb-16">
          <div className="w-16 h-16 bg-brand-primary/20 text-brand-primary rounded-2xl flex items-center justify-center mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-brand-secondary text-center mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-slate-600 font-medium text-center text-lg">
            Resolvemos tus dudas sobre nuestro modelo y el sistema de salud privado.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-800 mb-3">{faq.q}</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
