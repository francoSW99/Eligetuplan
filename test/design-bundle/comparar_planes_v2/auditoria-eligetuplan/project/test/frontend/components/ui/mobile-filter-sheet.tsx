'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

type MobileFilterSheetProps = {
  children: React.ReactNode;
  activeFilterCount?: number;
};

export default function MobileFilterSheet({ children, activeFilterCount = 0 }: MobileFilterSheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-3 rounded-full shadow-lg text-white font-bold text-sm transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtrar planes
        {activeFilterCount > 0 && (
          <span className="ml-1 bg-white text-[#0f514b] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[320px] sm:w-[360px] bg-[#f8fafc] p-0 overflow-y-auto">
          <SheetHeader className="sticky top-0 bg-[#f8fafc] z-10 border-b border-slate-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[#0f514b] text-left">Filtros</SheetTitle>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <SheetDescription className="sr-only">Filtra los planes por precio, cobertura, isapre y más</SheetDescription>
          </SheetHeader>
          <div className="px-4 py-4 space-y-4">
            {children}
          </div>
          <div className="sticky bottom-0 bg-[#f8fafc] border-t border-slate-200 px-4 py-3">
            <button
              onClick={() => setOpen(false)}
              className="w-full py-3 rounded-xl font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}
            >
              Ver resultados
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}