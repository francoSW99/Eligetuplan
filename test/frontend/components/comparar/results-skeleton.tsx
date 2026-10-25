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

      {/* Lista skeleton — un plan por fila (misma forma que PlanCard) */}
      <div className="grid grid-cols-1 gap-3.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <article
            key={i}
            className="bg-white rounded-2xl border border-[#0f514b]/10 grid lg:grid-cols-[minmax(0,210px)_minmax(0,1fr)_minmax(0,228px)]"
          >
            <div className="p-4 sm:p-5 space-y-2 lg:border-r border-[#0f514b]/8">
              <div className="h-8 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="px-4 sm:px-5 pb-4 lg:py-5 grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-1.5 w-full bg-slate-100 rounded-full animate-pulse" />
                <div className="h-5 w-2/3 bg-slate-50 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                <div className="h-1.5 w-full bg-slate-100 rounded-full animate-pulse" />
                <div className="h-5 w-2/3 bg-slate-50 rounded animate-pulse" />
              </div>
            </div>
            <div className="p-4 sm:p-5 space-y-2 lg:border-l border-[#0f514b]/8 border-t lg:border-t-0">
              <div className="h-3 w-20 bg-slate-100 rounded animate-pulse lg:mx-auto" />
              <div className="h-6 w-28 bg-slate-100 rounded animate-pulse lg:mx-auto" />
              <div className="h-9 w-full rounded-xl bg-slate-100 animate-pulse" />
              <div className="h-9 w-full rounded-xl bg-slate-50 animate-pulse" />
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
