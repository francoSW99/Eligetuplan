import { STEPS } from "@/lib/home-data";

export default function HowItWorks() {
  return (
    <section className="bg-[#f5f0e8] py-14 md:py-20 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,81,75,1) 1px, transparent 1px), linear-gradient(90deg, rgba(15,81,75,1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <header className="max-w-xl mb-11 md:mb-14">
          <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0f9d8a] mb-3">
            · El proceso ·
          </div>
          <h2
            className="font-extrabold text-[#0f514b] tracking-[-0.02em] leading-[1.05] mb-3"
            style={{ fontSize: "clamp(28px,3.8vw,40px)" }}
          >
            Diseñado para no perder tu tiempo.
          </h2>
          <p className="text-[15.5px] md:text-[16px] text-[#5a6b6a] leading-relaxed">
            Tres pasos. Cero llamadas no solicitadas. Datos transparentes en cada momento.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-7 md:gap-9">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-[36px] left-[92px] right-[-32px] h-[2px]">
                  <div
                    className="h-full"
                    style={{
                      background:
                        "repeating-linear-gradient(90deg, rgba(15,81,75,0.18) 0 6px, transparent 6px 12px)",
                    }}
                  />
                </div>
              )}

              <div className="relative flex items-start gap-5">
                <div className="shrink-0 w-[72px] h-[72px] rounded-2xl bg-[#0f514b] text-[#14dcb4] flex items-center justify-center font-extrabold text-[26px] tracking-tight shadow-[0_12px_28px_-8px_rgba(15,81,75,0.45)]">
                  {s.n}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-[19px] md:text-[20px] font-bold text-[#0f514b] mb-2 leading-snug">{s.t}</h3>
                  <p className="text-[14.5px] text-[#5a6b6a] leading-relaxed">{s.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-11 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-[#0f514b]/10 text-[13px] text-[#0f514b] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
          Tiempo promedio: <strong>4 minutos</strong> desde el inicio hasta el plan firmado
        </div>
      </div>
    </section>
  );
}
