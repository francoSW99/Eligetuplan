'use client';

export type Chip = {
  k: string;
  l: string;
  clear: () => void;
};

export default function FilterChips({
  chips,
  clearAll,
}: {
  chips: Chip[];
  clearAll: () => void;
}) {
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a]">
        Filtros activos:
      </span>
      {chips.map((c) => (
        <button
          key={c.k}
          onClick={c.clear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#14dcb4]/12 border border-[#14dcb4]/30 text-[12px] font-semibold text-[#0f514b] hover:bg-[#14dcb4]/20 transition-colors"
        >
          {c.l}
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M6 18L18 6" />
          </svg>
        </button>
      ))}
      <button onClick={clearAll} className="text-[11.5px] font-bold text-[#0f9d8a] hover:underline ml-1">
        Limpiar todo
      </button>
    </div>
  );
}
