import Link from "next/link";
import { STATS } from "@/lib/home-data";

type Props = {
  totalShowing: number;
  totalFiltered: number;
  totalGlobal: number;
};

export default function PageHeader({ totalShowing, totalFiltered, totalGlobal }: Props) {
  return (
    <section className="relative bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white pt-8 pb-5 md:pt-10 overflow-hidden">
      <div
        className="absolute -top-20 -right-10 w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,220,180,.14) 0%, transparent 60%)" }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#14dcb4]" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          <div className="min-w-0">
            <nav className="text-[11px] text-white/55 mb-1.5 flex items-center gap-1.5 font-medium" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#14dcb4] transition-colors no-underline">
                Inicio
              </Link>
              <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M9 6l6 6-6 6" />
              </svg>
              <span className="text-white/85">Comparar planes</span>
            </nav>
            <h1 className="text-[20px] md:text-[24px] font-extrabold tracking-[-0.02em] leading-[1.15] text-balance">
              Compara los{" "}
              <span className="text-[#14dcb4] serif font-medium italic">
                {totalGlobal.toLocaleString("es-CL")}
              </span>{" "}
              planes vigentes del mercado.
            </h1>
          </div>

          <div className="shrink-0 flex items-center gap-3 self-stretch md:self-auto">
            <div className="flex-1 md:flex-none flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/8 backdrop-blur-md border border-[#14dcb4]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse shrink-0" />
              <div className="min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[22px] font-extrabold text-white tabular-nums leading-none">
                    {totalShowing}
                  </span>
                  <span className="text-[12px] text-white/45 tabular-nums">
                    / {totalFiltered.toLocaleString("es-CL")}
                  </span>
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#14dcb4]/85 mt-0.5">
                  Planes filtrados
                </div>
              </div>
              <div className="hidden md:block w-px h-7 bg-white/15" />
              <div className="hidden md:block text-[10px] text-white/55 leading-tight">
                <div className="font-mono text-[#14dcb4]/80 mb-0.5">LIVE</div>
                <div>al {STATS.lastUpdate}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
