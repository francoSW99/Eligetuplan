'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Search, Handshake } from "lucide-react";
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
        ctaButton={{
          label: "Cotizar Gratis",
          onClick: () => router.push("/tu-mejor-plan"),
        }}
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
        socialProof={{
          avatars: [
            "https://i.pravatar.cc/150?img=32",
            "https://i.pravatar.cc/150?img=44",
            "https://i.pravatar.cc/150?img=47",
            "https://i.pravatar.cc/150?img=12",
          ],
          text: "Más de 10.000 chilenos ya compararon con nosotros",
        }}
        images={[
          "/cirugia.png",
          "/kine.jpeg",
          "/familia.jpeg",
        ]}
        className="min-h-[auto]"
      />

      {/* ===== Isapre Logos Infinite Slider ===== */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6 mb-10">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-[#0f514b]">
            Compara todas las Isapres del mercado
          </h2>
          <p className="text-center text-slate-500 mt-3 max-w-lg mx-auto">
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
        </InfiniteSlider>
      </section>

      {/* ===== Feature Cards Section ===== */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(15, 81, 75, 0.15)" }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-10 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-[#14dcb4]/10 flex items-center justify-center" style={{ width: 72, height: 72 }}>
                <Shield className="w-9 h-9 text-[#14dcb4]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#14dcb4] mb-3">Encuentra tu plan</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Encuentra tu plan ideal según tus necesidades de cobertura, presupuesto y cantidad de cargas médicas.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(15, 81, 75, 0.15)" }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-10 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-[#14dcb4]/10 flex items-center justify-center" style={{ width: 72, height: 72 }}>
                <Search className="w-9 h-9 text-[#14dcb4]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#14dcb4] mb-3">Compara opciones</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Compara los diferentes tipos de planes, beneficios y precios de todas las Isapres del mercado en un solo lugar.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(15, 81, 75, 0.15)" }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-10 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-[#14dcb4]/10 flex items-center justify-center" style={{ width: 72, height: 72 }}>
                <Handshake className="w-9 h-9 text-[#14dcb4]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#14dcb4] mb-3">Asesoría gratuita</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Recibe asesoría personalizada de nuestros expertos certificados sin ningún costo para ti.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="bg-[#0f514b] py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center text-white"
        >
          <div>
            <div className="text-5xl font-extrabold text-[#14dcb4] mb-3">+500</div>
            <p className="text-slate-300 font-medium">Planes de Isapre actualizados</p>
          </div>
          <div>
            <div className="text-5xl font-extrabold text-[#14dcb4] mb-3">100%</div>
            <p className="text-slate-300 font-medium">Gratuito y objetivo para usuarios</p>
          </div>
          <div>
            <div className="text-5xl font-extrabold text-[#14dcb4] mb-3">$45k</div>
            <p className="text-slate-300 font-medium">Ahorro mensual promedio</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
