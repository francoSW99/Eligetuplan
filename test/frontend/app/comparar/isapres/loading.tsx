import ResultsSkeleton, { SidebarSkeleton } from "@/components/comparar/results-skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fbf8f3]">
      {/* PageHeader skeleton — matches the real PageHeader layout */}
      <section className="relative bg-gradient-to-br from-[#0f514b] to-[#092e2a] pt-8 pb-5 md:pt-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-[#14dcb4]" aria-hidden />
        <div className="relative mx-auto max-w-[1280px] px-5 sm:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
            <div className="min-w-0 space-y-2">
              <div className="h-3 w-32 bg-white/15 rounded animate-pulse" />
              <div className="h-6 w-72 sm:w-96 bg-white/15 rounded animate-pulse" />
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <div className="h-14 w-44 rounded-2xl bg-white/8 border border-[#14dcb4]/20 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10 py-4 sm:py-5 md:py-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-4 sm:gap-6 lg:gap-8">
          <aside className="hidden lg:block">
            <SidebarSkeleton />
          </aside>
          <ResultsSkeleton />
        </div>
      </section>
    </div>
  );
}
