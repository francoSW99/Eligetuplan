'use client';

import { useState } from "react";
import { FAQS } from "@/lib/home-data";

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section id="faq" className="bg-[#fbf8f3] py-20 md:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
          <header className="lg:sticky lg:top-32 self-start">
            <div className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#0f9d8a] mb-3">
              · Preguntas frecuentes ·
            </div>
            <h2
              className="font-extrabold text-[#0f514b] tracking-[-0.02em] leading-[1.05] mb-4 text-balance"
              style={{ fontSize: "clamp(28px,4vw,44px)" }}
            >
              Lo que <span className="serif italic font-medium text-[#0f9d8a]">todos</span> nos preguntan.
            </h2>
            <p className="text-[15px] text-[#5a6b6a] leading-relaxed mb-6">
              Si hay algo que no quedó claro, un asesor responde por WhatsApp en menos de un minuto.
            </p>
            <a
              href="https://wa.me/56968319807?text=Hola%2C%20tengo%20una%20pregunta."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0f514b] text-white text-[13.5px] font-bold no-underline hover:-translate-y-0.5 transition-transform"
            >
              <svg className="w-4 h-4 text-[#14dcb4]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
              Preguntar por WhatsApp
            </a>
          </header>

          <div className="space-y-3">
            {FAQS.map((f, i) => {
              const open = openIdx === i;
              return (
                <div
                  key={i}
                  className={`rounded-2xl border transition-all ${
                    open
                      ? "bg-white border-[#14dcb4]/30 shadow-[0_18px_36px_-18px_rgba(15,81,75,0.2)]"
                      : "bg-white border-[#0f514b]/8 hover:border-[#0f514b]/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? -1 : i)}
                    className="w-full flex items-start justify-between gap-5 text-left p-6"
                    aria-expanded={open}
                  >
                    <span className="flex items-start gap-4">
                      <span className="shrink-0 mt-0.5 font-mono text-[11px] font-semibold text-[#0f9d8a] tracking-wider">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-bold text-[#0f514b] text-[16px] leading-snug pr-4">{f.q}</span>
                    </span>
                    <span
                      className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                        open ? "bg-[#14dcb4] border-[#14dcb4] text-[#0f514b]" : "border-[#0f514b]/15 text-[#0f514b]"
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 transition-transform ${open ? "rotate-45" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                  {open && (
                    <div className="px-6 pb-6 -mt-1 pl-[60px] pr-16 text-[15px] text-[#5a6b6a] leading-relaxed">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
