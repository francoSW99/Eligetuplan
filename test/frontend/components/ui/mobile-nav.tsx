'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

const NAV_ITEMS = [
  { label: 'Comparar Planes', href: '/comparar/isapres' },
  { label: 'Plan Perfecto para Ti', href: '/tu-mejor-plan' },
  { label: 'Cotiza con un Ejecutivo', href: '/buscar' },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>
      <SheetContent side="right" className="bg-[#0f514b] text-white w-[280px] p-0">
        <SheetHeader className="border-b border-white/10 px-5 py-4">
          <SheetTitle className="text-white text-left">Menú</SheetTitle>
          <SheetDescription className="sr-only">Navegación principal</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#14dcb4]/15 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 pt-2">
          <Link
            href="/comparar/isapres"
            onClick={() => setOpen(false)}
            className="block w-full px-6 py-3 rounded-full text-center font-bold text-white text-sm transition-all hover:scale-105 no-underline"
            style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}
          >
            Comparar Planes Ahora
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}