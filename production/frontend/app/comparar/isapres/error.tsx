'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center px-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Error al cargar los planes</h2>
        <p className="text-slate-500 text-sm mb-6">
          No se pudo conectar con el servidor. Verifica que el backend este corriendo en el puerto 8000.
        </p>
        <button
          onClick={reset}
          className="bg-[#0f514b] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#0a3d38] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
