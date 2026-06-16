'use client';

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export type QA = { q: string; a: string };

export default function FaqAccordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 sm:py-5"
              aria-expanded={isOpen}
            >
              <span className="font-semibold text-[#0f514b] text-[15px] sm:text-[16px] leading-snug">
                {item.q}
              </span>
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  isOpen ? 'bg-[#14dcb4] text-white' : 'bg-[#14dcb4]/10 text-[#0f9d8a]'
                }`}
              >
                {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="px-5 sm:px-6 pb-5 text-slate-600 leading-relaxed text-[14.5px]">
                  {item.a}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
