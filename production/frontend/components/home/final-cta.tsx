export default function FinalCTA() {
  return (
    <section id="asesor" className="bg-[#fbf8f3] px-5 sm:px-6 lg:px-10 pb-16 sm:pb-24">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] grid md:grid-cols-[1.4fr_1fr] gap-6 sm:gap-8 md:gap-12 items-center px-6 py-10 sm:px-8 sm:py-12 md:px-14 md:py-16 bg-gradient-to-br from-[#0f514b] to-[#092e2a] border border-[#14dcb4]/15 shadow-[0_30px_80px_-20px_rgba(15,81,75,0.45)]">
          <div
            className="absolute -top-[40%] -right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(20,220,180,.2) 0%, transparent 60%)" }}
          />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative text-white">
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#14dcb4] mb-3">
              · Listo para empezar ·
            </div>
            <h2
              className="font-extrabold tracking-[-0.022em] leading-[1.05] mb-4 text-balance"
              style={{ fontSize: "clamp(28px,3.8vw,42px)" }}
            >
              Tu plan ideal está a{" "}
              <span className="serif italic font-medium text-[#14dcb4]">90 segundos</span>{" "}
              de distancia.
            </h2>
            <p className="text-[15px] md:text-[16px] text-white/72 leading-relaxed max-w-[480px]">
              Sin formularios eternos, sin llamadas no solicitadas. Solo el plan correcto al precio justo — el que tu 7% puede pagar.
            </p>
          </div>

          <div className="relative flex flex-col gap-3">
            <a
              href="#calc"
              className="px-7 py-4 rounded-2xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] font-bold text-[15px] shadow-[0_14px_30px_rgba(20,220,180,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 no-underline"
            >
              Calcular mi 7% legal
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a
              href="https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud."
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-2xl bg-white/8 border border-white/18 text-white font-semibold text-[14px] hover:bg-white/12 transition-colors flex items-center justify-center gap-2 no-underline backdrop-blur-md"
            >
              <svg className="w-4 h-4 text-[#14dcb4]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
              Prefiero hablar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
