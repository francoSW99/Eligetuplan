'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart3, Sparkles, MessageCircle } from "lucide-react";
import { PulseFitHero } from "@/components/ui/pulse-fit-hero";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-[#eef2f5]">
      {/* ===== HERO using PulseFitHero component ===== */}
      <PulseFitHero
        logo={
          <Image
            src="/logos/mamag.png"
            alt="EligeTuPlan"
            width={1568}
            height={496}
            priority
            className="h-16 w-auto drop-shadow-[0_10px_24px_rgba(20,220,180,0.24)] md:h-20 lg:h-24"
          />
        }
        navigation={[
          { label: "Comparar Planes", href: "/comparar/isapres" },
          { label: "Plan Perfecto para Ti", href: "/tu-mejor-plan" },
          { label: "Cotiza con un Ejecutivo", href: "/buscar" },
        ]}
        title="¿Cuál es tu Plan de Salud Ideal?"
        subtitle="Comparamos más de 500 planes vigentes de todas las Isapres para mostrarte los máximos beneficios al menor costo. 100% online y gratuito."
        primaryAction={{
          label: "Comparar Planes Ahora",
          onClick: () => router.push("/comparar/isapres"),
        }}
        secondaryAction={{
          label: "¿Cómo funciona?",
          onClick: () => router.push("/como-funciona"),
        }}
        disclaimer="*Sin costo, sin compromisos. 100% gratuito."
        
        images={[
          "/cirugia.png",
          "/kine.jpeg",
          "/familia.jpeg",
        ]}
        className="min-h-[auto]"
      />

      {/* ===== Isapre Logos Infinite Slider ===== */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#0f514b]">
            Compara todas las Isapres del mercado
          </h2>
          <p className="text-center text-slate-500 mt-2 max-w-lg mx-auto">
            Trabajamos con todas las Isapres vigentes en Chile para darte la comparación más completa.
          </p>
        </div>
        <InfiniteSlider gap={64} duration={18} durationOnHover={40} className="py-4">
          <Image src="/logos/banmedica-logo.png" alt="Banmédica" width={180} height={90} className="h-[70px] w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/logo_consalud.png" alt="ConSalud" width={180} height={90} className="h-[70px] w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/logo_cruzblanca.png" alt="Cruz Blanca" width={180} height={90} className="h-[70px] w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/Logo-NMV.png" alt="Nueva Más Vida" width={180} height={90} className="h-[70px] w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/logos-col.png" alt="Colmena" width={180} height={90} className="h-[70px] w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/vida-tres.png" alt="Vida Tres" width={180} height={90} className="h-[70px] w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/esencial.png" alt="Esencial" width={180} height={90} className="h-[70px] w-auto object-contain opacity-60 hover:opacity-100 transition-all duration-300" />
        </InfiniteSlider>
      </section>

      {/* ===== Feature Rows Section ===== */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f514b] mb-3">Todo lo que necesitas en un solo lugar</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Tres formas de encontrar tu plan ideal. Elige la que mejor se ajuste a lo que buscas.</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Row 1 — Comparar Planes */}
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(15, 81, 75, 0.12)" }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
          >
            <div className="flex items-center gap-5 md:min-w-[280px]">
              <div className="relative flex-shrink-0">
                <span className="text-6xl font-extrabold text-[#14dcb4]/15 select-none leading-none">01</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-[#14dcb4]/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-[#14dcb4]" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f514b]">Comparar Planes</h3>
                <p className="text-sm text-slate-400 hidden md:block">Explora y compara</p>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed flex-1 text-sm md:text-base">
              Explora y compara los planes de todas las Isapres. Filtra por precio, cobertura, modalidad y más para encontrar el que mejor se adapte a tu presupuesto.
            </p>
            <button
              onClick={() => router.push("/comparar/isapres")}
              className="flex-shrink-0 px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:-translate-y-0.5 shadow-md no-underline"
              style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
            >
              Ver todos los planes
            </button>
          </motion.div>

          {/* Row 2 — Plan Perfecto para Ti */}
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(15, 81, 75, 0.12)" }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
          >
            <div className="flex items-center gap-5 md:min-w-[280px]">
              <div className="relative flex-shrink-0">
                <span className="text-6xl font-extrabold text-[#14dcb4]/15 select-none leading-none">02</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-[#14dcb4]/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#14dcb4]" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f514b]">Plan Perfecto para Ti</h3>
                <p className="text-sm text-slate-400 hidden md:block">Recomendación inteligente</p>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed flex-1 text-sm md:text-base">
              Cuéntanos sobre tu plan actual y evaluaremos con IA cuál es el mejor plan para ti, personalizado según tus necesidades y presupuesto.
            </p>
            <button
              onClick={() => router.push("/tu-mejor-plan")}
              className="flex-shrink-0 px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:-translate-y-0.5 shadow-md no-underline"
              style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
            >
              Encontrar mi plan
            </button>
          </motion.div>

          {/* Row 3 — Cotiza con un Ejecutivo */}
          <motion.div
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(15, 81, 75, 0.12)" }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-10"
          >
            <div className="flex items-center gap-5 md:min-w-[280px]">
              <div className="relative flex-shrink-0">
                <span className="text-6xl font-extrabold text-[#14dcb4]/15 select-none leading-none">03</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-[#14dcb4]/10 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#14dcb4]" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0f514b]">Cotiza con un Ejecutivo</h3>
                <p className="text-sm text-slate-400 hidden md:block">Asesoría personalizada</p>
              </div>
            </div>
            <p className="text-slate-500 leading-relaxed flex-1 text-sm md:text-base">
              Rellena un formulario para que un asesor certificado te contacte lo antes posible. O si prefieres, contacta directamente por WhatsApp.
            </p>
            <button
              onClick={() => router.push("/buscar")}
              className="flex-shrink-0 px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:-translate-y-0.5 shadow-md no-underline"
              style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
            >
              Hablar con un asesor
            </button>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="bg-[#0f514b] py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto px-6"
        >
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Los números que nos respaldan</h2>
            <p className="text-slate-300 max-w-xl mx-auto">Datos actualizados mes a mes desde la Superintendencia de Salud.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: "7", label: "Isapres disponibles", suffix: "" },
              { value: "1.854", label: "Planes activos", suffix: "+" },
              { value: "16", label: "Regiones del país", suffix: "" },
              { value: "100", label: "En línea y gratis", suffix: "%" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
              >
                <div className="text-4xl md:text-5xl font-extrabold text-[#14dcb4] mb-2">
                  {stat.value}<span className="text-[#14dcb4]/70">{stat.suffix}</span>
                </div>
                <p className="text-slate-300 font-medium text-sm md:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
