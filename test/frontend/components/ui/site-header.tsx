'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Comparar Planes', href: '/comparar/isapres' },
  { label: 'Plan Perfecto para Ti', href: '/tu-mejor-plan' },
  { label: 'Cotiza con un Ejecutivo', href: '/buscar' },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0f514b]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="shrink-0 transition-transform hover:scale-[1.02]"
            aria-label="Volver a la página principal"
          >
            <Image
              src="/logos/mamag.png"
              alt="EligeTuPlan"
              width={1568}
              height={496}
              priority
              className="h-10 w-auto drop-shadow-[0_8px_22px_rgba(20,220,180,0.2)] md:h-12"
            />
          </Link>
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:border-[#14dcb4]/60 hover:bg-[#14dcb4]/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-base font-medium transition-colors ${
                  active
                    ? 'text-white'
                    : 'text-white/80 hover:text-[#14dcb4]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/tu-mejor-plan"
          className="inline-flex items-center justify-center rounded-full bg-[#14dcb4] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(20,220,180,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#12c9a4]"
        >
          Cotizar Gratis
        </Link>
      </div>
    </header>
  );
}