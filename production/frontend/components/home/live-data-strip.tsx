'use client';

import { STATS } from "@/lib/home-data";
import { useMeta } from "@/lib/meta-context";

export default function LiveDataStrip() {
  const { plansTotal, ufValueCLP, lastUpdate } = useMeta();

  const ITEMS = [
    { v: plansTotal.toLocaleString("es-CL"),       l: "Planes vigentes" },
    { v: String(STATS.isapres),                    l: "Isapres comparadas" },
    { v: String(STATS.regiones),                   l: "Regiones cubiertas" },
    { v: `$${ufValueCLP.toLocaleString("es-CL")}`, l: "UF de hoy" },
  ];

  return (
    <section className="relative bg-[#f5f0e8] border-y border-[#0f514b]/10">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4">
          {ITEMS.map((it, i) => (
            <div
              key={it.l}
              className={`flex items-baseline gap-3 md:gap-4 px-3 md:px-5 ${
                i > 0 ? "md:border-l border-[#0f514b]/10" : ""
              }`}
            >
              <span className="text-[26px] md:text-[28px] font-extrabold text-[#0f514b] tabular-nums tracking-tight leading-none">
                {it.v}
              </span>
              <span className="text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5a6b6a]">
                {it.l}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[#0f514b]/10 flex flex-wrap items-center justify-between gap-2 text-[12px] text-[#5a6b6a]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
            <span>
              Datos oficiales · Superintendencia de Salud · actualizado al{" "}
              <strong className="text-[#0f514b] font-semibold">{lastUpdate}</strong>
            </span>
          </div>
          <a
            href="https://www.superdesalud.gob.cl/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0f514b] font-semibold hover:text-[#0f9d8a] transition-colors no-underline"
          >
            Verificar fuente →
          </a>
        </div>
      </div>
    </section>
  );
}
