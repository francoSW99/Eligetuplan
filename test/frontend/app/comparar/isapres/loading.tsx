export default function Loading() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero skeleton */}
      <section className="bg-[#0f514b] py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="h-6 w-48 bg-white/10 rounded-full mx-auto mb-4 animate-pulse" />
          <div className="h-10 w-96 bg-white/10 rounded-lg mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-80 bg-white/10 rounded-lg mx-auto animate-pulse" />
        </div>
      </section>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-5 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
          {/* Grid skeleton */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 h-64 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
