import { HeartPulse, Search, ShieldCheck } from "lucide-react";

export default function ComoFuncionaPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-8 text-center text-brand-secondary">
          ¿Cómo Funciona Eligetuplan?
        </h1>
        <p className="text-lg text-slate-600 text-center mb-16 max-w-2xl mx-auto font-medium">
          Diseñamos un proceso simple transparente, como debe ser la salud.
          Nuestra plataforma compara, cotiza y te asesora en 3 simples pasos.
        </p>
        
        <div className="space-y-12">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold">1</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Cuéntanos sobre ti</h3>
              <p className="text-slate-600 leading-relaxed">
                Ingresa tus datos básicos como tu edad, sueldo líquido y cantidad de cargas médicas en nuestra calculadora. Esto permite que el algoritmo limite los planes a los que realmente puedes aplicar.
              </p>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold">2</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Compara resultados precisos</h3>
              <p className="text-slate-600 leading-relaxed">
                Nuestra IA analiza instantáneamente más de 500 planes actualizados y te muestra una lista ordenada con las mejores opciones de cobertura y clínicas de tu preferencia.
              </p>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
            <div className="w-20 h-20 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center shrink-0">
              <span className="text-3xl font-extrabold">3</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Contrata con tranquilidad</h3>
              <p className="text-slate-600 leading-relaxed">
                Cuando elijas el plan, un asesor certificado te ayudará con el proceso de firma de contrato final directo con la Isapre, sin ningún costo adicional para ti.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
