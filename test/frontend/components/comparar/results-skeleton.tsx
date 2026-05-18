export default function ResultsSkeleton() {
  return (
    <div className="space-y-5">
      {/* Toolbar skeleton */}
      <div className="bg-white rounded-2xl border border-[#0f514b]/10 p-3.5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="w-full sm:w-48 h-11 rounded-xl bg-slate-100 animate-pulse" />
      </div>

      {/* Result count line skeleton */}
      <div className="h-4 w-56 bg-slate-100 rounded animate-pulse" />

      {/* Grid skeleton — 6 plan cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <article
            key={i}
            className="bg-white rounded-2xl border border-[#0f514b]/10 p-4 sm:p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-9 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="shrink-0 text-right space-y-1.5">
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse ml-auto" />
                <div className="h-6 w-20 bg-slate-100 rounded animate-pulse ml-auto" />
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse ml-auto" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-4">
              <div className="h-24 rounded-xl bg-slate-50 border border-[#0f514b]/8 animate-pulse" />
              <div className="h-24 rounded-xl bg-slate-50 border border-[#0f514b]/8 animate-pulse" />
            </div>
            <div className="pt-4 border-t border-[#0f514b]/8 grid grid-cols-2 gap-2.5">
              <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#0f514b]/10 px-4 py-3.5 flex items-center gap-3"
        >
          <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-100 animate-pulse" />
          <div className="flex-1 h-4 bg-slate-100 rounded animate-pulse" />
          <div className="w-4 h-4 bg-slate-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
