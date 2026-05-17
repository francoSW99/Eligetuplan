import { STATS } from "@/lib/home-data";

const FACTS = [
  { v: STATS.plansTotal.toLocaleString("es-CL"), l: "planes verificados" },
  { v: "24 h",  l: "tiempo de respuesta" },
  { v: "100%",  l: "gratis · sin compromiso" },
  { v: "0",     l: "spam · llamadas no solicitadas" },
];

export default function TrustBand() {
  return (
    <section className="bg-[#0f514b] py-14 md:py-16 relative overflow-hidden text-white">
      <div
        className="absolute -top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,220,180,.12) 0%, transparent 60%)" }}
      />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 md:gap-12 items-center">
          <div>
            <div className="text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#14dcb4] mb-3">
              · Confianza verificable ·
            </div>
            <h2
              className="font-extrabold tracking-[-0.02em] leading-[1.1] max-w-[16ch]"
              style={{ fontSize: "clamp(26px,3.2vw,32px)" }}
            >
              Auditados por <span className="serif italic text-[#14dcb4] font-medium">la fuente oficial</span>.
            </h2>
          </div>

          <div className="hidden md:block h-24 w-px bg-white/15" />

          <div className="grid grid-cols-2 gap-5">
            {FACTS.map((f) => (
              <div key={f.l}>
                <div className="text-[36px] font-extrabold text-[#14dcb4] leading-none tabular-nums">{f.v}</div>
                <div className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/55 mt-1.5">{f.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-white/55">
          <span>
            Fuente:{" "}
            <a href="https://www.superdesalud.gob.cl/" target="_blank" rel="noopener noreferrer" className="text-[#14dcb4] font-semibold hover:underline no-underline">
              Superintendencia de Salud
            </a>{" "}
            ·{" "}
            <a href="https://www.isapresdechile.cl/" target="_blank" rel="noopener noreferrer" className="text-[#14dcb4] font-semibold hover:underline no-underline">
              AICH
            </a>{" "}
            · Actualizado al {STATS.lastUpdate}
          </span>
          <span className="font-mono text-[10.5px] tracking-wider text-white/35">
            UF · CLP · OFICIAL · LIVE
          </span>
        </div>
      </div>
    </section>
  );
}
