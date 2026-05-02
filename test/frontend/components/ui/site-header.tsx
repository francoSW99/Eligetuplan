'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import MobileNav from './mobile-nav';

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

  // Home: hero has its own absolute-positioned header. No sticky bar.
  if (pathname === '/') return null;

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300 border-b border-[rgba(20,220,180,0.18)] shadow-[0_8px_24px_-12px_rgba(9,46,42,0.45)]"
      style={{
        background:
          'linear-gradient(180deg, rgba(9, 46, 42, 0.92) 0%, rgba(15, 81, 75, 0.92) 100%)',
        backdropFilter: 'blur(14px) saturate(160%)',
        WebkitBackdropFilter: 'blur(14px) saturate(160%)',
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-2 sm:py-2.5">
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
              className="h-9 w-auto drop-shadow-[0_8px_22px_rgba(20,220,180,0.2)] sm:h-10 md:h-11"
            />
          </Link>
          <Link
            href="/"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:border-[#14dcb4]/60 hover:bg-[#14dcb4]/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-9" aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? 'true' : undefined}
                className={`nav-link text-[17px] font-semibold tracking-tight ${
                  active ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block w-[120px]" />

        <MobileNav />
      </div>
    </header>
  );
}
