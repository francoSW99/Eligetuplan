'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PulseFitHero } from "@/components/ui/pulse-fit-hero";
import { InfiniteSlider } from "@/components/ui/infinite-slider";

const FEATURES = [
  {
    n: "01",
    kicker: "Catálogo",
    title: "Comparar Planes",
    desc: "Explora y compara planes de todas las Isapres. Filtra por precio, cobertura, modalidad y más para encontrar el que mejor se adapte a tu presupuesto.",
    cta: "Ver todos los planes",
    href: "/comparar/isapres",
    img: "/comparar-preview.png",
  },
  {
    n: "02",
    kicker: "IA Personalizada",
    title: "Plan Perfecto para Ti",
    desc: "Cuéntanos sobre tu plan actual y evaluaremos con IA cuál es el mejor plan para ti, personalizado según tus necesidades y presupuesto.",
    cta: "Encontrar mi plan",
    href: "/tu-mejor-plan",
    img: "/kine.jpeg",
  },
  {
    n: "03",
    kicker: "Asesoría Humana",
    title: "Cotiza con un Ejecutivo",
    desc: "Rellena un formulario para que un asesor certificado te contacte lo antes posible. O si prefieres, contacta directamente por WhatsApp.",
    cta: "Hablar con un asesor",
    href: "/buscar",
    img: "/familia.jpeg",
  },
];

const STATS = [
  { value: "7", label: "Isapres disponibles", suffix: "" },
  { value: "1.854", label: "Planes activos", suffix: "+" },
  { value: "16", label: "Regiones del país", suffix: "" },
  { value: "100", label: "En línea y gratis", suffix: "%" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="bg-[#f5f0e8]">
      {/* ===== HERO ===== */}
      <PulseFitHero
        logo={
          <Image
            src="/logos/mamag.png"
            alt="EligeTuPlan"
            width={1568}
            height={496}
            priority
            className="h-14 w-auto drop-shadow-[0_12px_28px_rgba(20,220,180,0.28)] sm:h-16 md:h-[72px] lg:h-20"
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
        images={["/cirugia.png", "/kine.jpeg", "/familia.jpeg"]}
      />

      {/* ===== Isapres Slider · cream background ===== */}
      <section className="relative bg-[#f5f0e8] py-12 md:py-16">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-[3px] bg-[#14dcb4]" aria-hidden />
        <div className="max-w-6xl mx-auto px-6 mb-7 text-center">
          <div className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#0f514b]/55 mb-3">
            · Las 7 Isapres del mercado ·
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f514b] tracking-tight leading-tight mb-2">
            Comparamos todas, sin excepciones.
          </h2>
          <p className="text-[15px] text-[#1e2a2a]/65 max-w-md mx-auto leading-relaxed">
            Datos en tiempo real desde la Superintendencia de Salud.
          </p>
        </div>
        <InfiniteSlider gap={64} duration={22} durationOnHover={50} className="py-3">
          <Image src="/logos/banmedica-logo.png" alt="Banmédica" width={180} height={90} className="h-[60px] w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/logo_consalud.png" alt="ConSalud" width={180} height={90} className="h-[60px] w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/logo_cruzblanca.png" alt="Cruz Blanca" width={180} height={90} className="h-[60px] w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/Logo-NMV.png" alt="Nueva Más Vida" width={180} height={90} className="h-[60px] w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/logos-col.png" alt="Colmena" width={180} height={90} className="h-[60px] w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/vida-tres.png" alt="Vida Tres" width={180} height={90} className="h-[60px] w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300" />
          <Image src="/logos/esencial.png" alt="Esencial" width={180} height={90} className="h-[60px] w-auto object-contain opacity-70 hover:opacity-100 transition-all duration-300" />
        </InfiniteSlider>
      </section>

      {/* ===== Feature Editorial · alternating rows on paper ===== */}
      <section className="bg-[#fbf8f3] px-5 md:px-8 py-14 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-14 max-w-xl mx-auto">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#14dcb4] mb-3.5">
              · 3 caminos · 1 plan ideal ·
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f514b] tracking-tight leading-tight mb-3.5">
              Todo lo que necesitas, en un solo lugar.
            </h2>
            <p className="text-[#1e2a2a]/70 text-[15px] md:text-base leading-relaxed">
              Tres formas de encontrar tu plan ideal. Elige la que mejor se ajuste a lo que buscas hoy.
            </p>
          </div>

          <div className="flex flex-col gap-7 md:gap-20">
            {FEATURES.map((f, i) => {
              const reversed = i % 2 === 1;
              return (
                <motion.div
                  key={f.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6 }}
                  className={`grid items-center gap-5 md:gap-14 ${
                    reversed ? "md:grid-cols-[1fr_1.05fr]" : "md:grid-cols-[1.05fr_1fr]"
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative aspect-[16/10] md:aspect-[4/3] rounded-3xl overflow-hidden ${
                      reversed ? "md:order-2" : "md:order-1"
                    }`}
                    style={{ boxShadow: "0 30px 60px -20px rgba(15,81,75,0.25)" }}
                  >
                    <Image
                      src={f.img}
                      alt={f.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className={`object-cover ${i === 0 ? "object-top" : ""}`}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: i === 0
                          ? "linear-gradient(180deg, transparent 70%, rgba(9,46,42,.18) 100%)"
                          : "linear-gradient(135deg, rgba(15,81,75,.15) 0%, transparent 50%, rgba(20,220,180,.12) 100%)",
                      }}
                    />
                    <div
                      className="absolute top-3.5 left-3.5 md:top-5 md:left-5 px-3.5 py-2 rounded-full text-[12px] font-extrabold tracking-[0.1em] text-[#14dcb4]"
                      style={{
                        background: "rgba(15,81,75,0.85)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      {f.n} · {f.kicker.toUpperCase()}
                    </div>
                  </div>

                  {/* Text */}
                  <div className={`px-0 md:px-2 ${reversed ? "md:order-1" : "md:order-2"}`}>
                    <h3 className="text-2xl md:text-[36px] font-bold text-[#0f514b] tracking-tight leading-[1.1] m-0">
                      {f.title}
                    </h3>
                    <div className="w-10 h-[3px] bg-[#14dcb4] mt-4 mb-4" aria-hidden />
                    <p className="text-[#1e2a2a]/75 text-[15px] md:text-[16.5px] leading-[1.65] mb-6">
                      {f.desc}
                    </p>
                    <button
                      onClick={() => router.push(f.href)}
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#0f514b] text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      {f.cta}
                      <span
                        className="inline-grid place-items-center text-[13px] font-extrabold text-[#0f514b]"
                        style={{ width: 22, height: 22, borderRadius: 99, background: "#14dcb4" }}
                      >
                        →
                      </span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Stats · deep teal gradient with decorative blurs ===== */}
      <section
        className="relative overflow-hidden py-16 md:py-24"
        style={{ background: "linear-gradient(180deg, #0f514b 0%, #092e2a 100%)" }}
      >
        <div
          className="pointer-events-none absolute -top-[20%] -right-[10%]"
          style={{
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,220,180,.15) 0%, transparent 60%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-[30%] -left-[15%]"
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20,220,180,.08) 0%, transparent 60%)",
          }}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-6xl mx-auto px-6"
        >
          <div className="text-center mb-10 md:mb-14">
            <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#14dcb4] mb-3.5">
              · Datos verificables ·
            </div>
            <h2 className="text-3xl md:text-[38px] font-bold text-white tracking-tight leading-tight mb-3">
              Los números que nos respaldan.
            </h2>
            <p className="text-white/65 text-[15px] max-w-md mx-auto leading-relaxed">
              Datos actualizados mes a mes desde la Superintendencia de Salud.
            </p>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-4 rounded-3xl overflow-hidden border"
            style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(20,220,180,0.15)", gap: 1 }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center px-4 md:px-6 py-7 md:py-10"
                style={{ background: "rgba(9,46,42,0.5)" }}
              >
                <div
                  className="font-extrabold text-[#14dcb4] leading-none mb-2.5 tracking-tight"
                  style={{ fontSize: "clamp(38px, 5vw, 56px)" }}
                >
                  {s.value}
                  <span className="text-[#14dcb4]/55">{s.suffix}</span>
                </div>
                <p className="text-white/70 text-xs md:text-sm font-medium m-0 tracking-wide">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ===== Testimonial Band · cream ===== */}
      <section className="bg-[#f5f0e8] px-5 md:px-8 py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="text-[#14dcb4] font-extrabold mb-4 leading-[0.8]"
            style={{ fontSize: 56, fontFamily: "Georgia, serif" }}
            aria-hidden
          >
            &ldquo;
          </div>
          <p className="text-xl md:text-[28px] font-medium text-[#0f514b] leading-[1.35] tracking-tight mb-7">
            Comparé sola por días sin entender nada. Acá en 5 minutos vi todo claro y un asesor me ayudó con la firma.{" "}
            <span className="text-[#14dcb4]">Pagué 38% menos</span> que mi plan anterior.
          </p>
          <div className="inline-flex items-center gap-3.5">
            <div
              className="grid place-items-center text-white font-bold text-lg rounded-full"
              style={{ width: 48, height: 48, background: "linear-gradient(135deg, #14dcb4, #0f514b)" }}
            >
              CM
            </div>
            <div className="text-left">
              <div className="font-bold text-[#0f514b] text-sm">Carolina M.</div>
              <div className="text-xs text-[#1e2a2a]/60">Profesora · Santiago · 38 años</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA · paper background ===== */}
      <section className="bg-[#fbf8f3] px-5 md:px-8 pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative overflow-hidden rounded-[32px] grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-10 items-center px-7 py-10 md:px-14 md:py-16"
            style={{
              background: "linear-gradient(180deg, #0f514b 0%, #092e2a 100%)",
              boxShadow: "0 30px 80px -20px rgba(15,81,75,0.4)",
              border: "1px solid rgba(20,220,180,0.15)",
            }}
          >
            <div
              className="pointer-events-none absolute -top-[30%] -right-[10%]"
              style={{
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(20,220,180,.18) 0%, transparent 60%)",
              }}
              aria-hidden
            />
            <div className="relative z-10">
              <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#14dcb4] mb-3.5">
                · Empieza ahora ·
              </div>
              <h2 className="text-3xl md:text-[38px] font-bold text-white tracking-tight leading-tight mb-3.5">
                Tu plan ideal está a 2 minutos de distancia.
              </h2>
              <p className="text-white/70 text-base leading-relaxed max-w-lg m-0">
                Sin formularios largos. Sin llamadas no deseadas. Solo el plan correcto al precio justo.
              </p>
            </div>
            <div className="relative z-10 flex flex-col gap-2.5">
              <button
                onClick={() => router.push("/comparar/isapres")}
                className="text-white font-bold text-base transition-all hover:-translate-y-0.5"
                style={{
                  padding: "17px 28px",
                  borderRadius: 16,
                  border: "none",
                  background: "linear-gradient(135deg, #14dcb4, #0f9d8a)",
                  boxShadow: "0 14px 30px rgba(20,220,180,0.4)",
                  cursor: "pointer",
                }}
              >
                Comparar Planes Ahora →
              </button>
              <a
                href="https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud."
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-white font-semibold text-sm transition-all hover:-translate-y-0.5 no-underline"
                style={{
                  padding: "15px 28px",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                Hablar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
