'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Números a mostrar: 1 … p-1 p p+1 … N (o todos si son pocos). */
function paginas(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, page - 1, page, page + 1].filter((p) => p >= 1 && p <= total));
  if (page <= 3) [2, 3, 4].forEach((p) => set.add(p));
  if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => set.add(p));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

const btnBase =
  'h-9 min-w-9 px-2 rounded-lg border text-[13px] font-bold tabular-nums transition-colors inline-flex items-center justify-center';

export default function Pagination({
  page,
  totalPages,
  onChange,
  className = '',
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;
  const prev = () => page > 1 && onChange(page - 1);
  const next = () => page < totalPages && onChange(page + 1);

  return (
    <nav aria-label="Páginas de resultados" className={`flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={prev}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={`pressable ${btnBase} border-[#0f514b]/12 bg-white text-[#0f514b] hover:border-[#14dcb4] disabled:opacity-35 disabled:cursor-not-allowed`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Celular: "3 / 67" */}
      <span className="sm:hidden px-2 text-[13px] font-bold text-[#0f514b] tabular-nums">
        {page} / {totalPages}
      </span>

      {/* Escritorio: números */}
      <div className="hidden sm:flex items-center gap-1.5">
        {paginas(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="px-1 text-[13px] text-[#5a6b6a]" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Página ${p}`}
              className={`pressable ${btnBase} ${
                p === page
                  ? 'bg-[#0f514b] border-[#0f514b] text-white'
                  : 'bg-white border-[#0f514b]/12 text-[#0f514b] hover:border-[#14dcb4]'
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={next}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
        className={`pressable ${btnBase} border-[#0f514b]/12 bg-white text-[#0f514b] hover:border-[#14dcb4] disabled:opacity-35 disabled:cursor-not-allowed`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
