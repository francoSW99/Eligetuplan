import Link from "next/link";
import { useMeta } from "@/lib/meta-context";

type Props = {
  totalShowing: number;
  totalFiltered: number;
  totalGlobal: number;
};

export default function PageHeader({ totalShowing, totalFiltered, totalGlobal }: Props) {
  const { lastUpdate } = useMeta();
  return (
    <section className="relative bg-gradient-to-br from-[#0f514b] to-[#092e2a] text-white py-3 sm:py-3.5 overflow-hidden">
      <div
        className="absolute -top-12 -right-6 w-[200px] h-[200px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(20,220,180,.12) 0%, transparent 60%)" }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#14dcb4]" aria-hidden />

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <div className="min-w-0 flex items-baseline gap-3 flex-wrap">
            <nav className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45 flex items-center gap-1.5" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#14dcb4] transition-colors no-underline">
                Inicio
              </Link>
              <svg className="w-2 h-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M9 6l6 6-6 6" />
              </svg>
              <span className="text-white/75">Comparar planes</span>
            </nav>
            <h1 className="text-[15px] sm:text-[16px] md:text-[17px] font-extrabold tracking-[-0.01em] leading-tight">
              Compara los{" "}
              <span className="text-[#14dcb4] serif font-medium italic">
                {totalGlobal.toLocaleString("es-CL")}
              </span>{" "}
              planes vigentes
            </h1>
          </div>

          <div className="shrink-0 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/8 backdrop-blur-md border border-[#14dcb4]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse shrink-0" />
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-extrabold text-white tabular-nums leading-none">
                {totalShowing}
              </span>
              <span className="text-[10.5px] text-white/45 tabular-nums">
                / {totalFiltered.toLocaleString("es-CL")}
              </span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#14dcb4]/80">
              filtrados
            </span>
            <span className="hidden sm:inline-block w-px h-3.5 bg-white/15" />
            <span className="hidden sm:inline text-[9.5px] text-white/45 leading-none">
              al {lastUpdate}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
