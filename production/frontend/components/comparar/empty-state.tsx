'use client';

import { BRAND } from "@/lib/home-data";

export default function EmptyState({
  onClearAll,
  activeFiltersCount,
}: {
  onClearAll: () => void;
  activeFiltersCount: number;
}) {
  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-[#0f514b]/15 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[#14dcb4]/12 text-[#0f9d8a] flex items-center justify-center mx-auto mb-5">
        <svg
          className="w-8 h-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.3-4.3" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h3 className="text-[22px] md:text-[26px] font-extrabold text-[#0f514b] tracking-tight mb-3">
        No encontramos planes con esos filtros.
      </h3>
      <p className="text-[15px] text-[#5a6b6a] leading-relaxed mb-7 max-w-md mx-auto">
        Tienes <strong className="text-[#0f514b]">{activeFiltersCount} filtros activos</strong>. Prueba relajando alguno o pídele a un asesor que te encuentre alternativas similares.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={onClearAll}
          className="px-6 py-3 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f514b] font-bold text-[14px] shadow-[0_8px_20px_rgba(20,220,180,0.3)] hover:-translate-y-0.5 transition-all"
        >
          Limpiar todos los filtros
        </button>
        <a
          href={`${BRAND.whatsappBase}?text=Hola%2C%20busco%20alternativas%20de%20planes%20de%20salud`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-[#25D366] text-white font-bold text-[14px] hover:-translate-y-0.5 transition-all no-underline inline-flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
          Pedir alternativas por WhatsApp
        </a>
      </div>
    </div>
  );
}
