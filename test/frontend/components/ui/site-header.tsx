'use client';

import { useEffect, useState } from 'react';
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
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showHeader = isHome ? scrolled : true;

  if (!showHeader) return null;

  return (
    <header className={`sticky top-0 z-50 backdrop-blur transition-all duration-300 ${isHome ? 'bg-[#0f514b]/95 border-b border-white/10 shadow-lg' : 'bg-[#0f514b]/95 border-b border-white/10'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {!isHome ? (
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
                className="h-8 w-auto drop-shadow-[0_8px_22px_rgba(20,220,180,0.2)] sm:h-10 md:h-12"
              />
            </Link>
            <Link
              href="/"
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/8 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:border-[#14dcb4]/60 hover:bg-[#14dcb4]/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" /> Volver al inicio
            </Link>
          </div>
        ) : (
          <Link href="/" className="shrink-0" aria-label="EligeTuPlan - Inicio">
            <Image
              src="/logos/mamag.png"
              alt="EligeTuPlan"
              width={1568}
              height={496}
              priority
              className="h-8 w-auto drop-shadow-[0_8px_22px_rgba(20,220,180,0.2)] sm:h-10 md:h-12"
            />
          </Link>
        )}

        <nav className={`${isHome ? 'mx-auto' : ''} hidden md:flex items-center gap-8`} aria-label="Navegación principal">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active ? 'true' : undefined}
                className={`nav-link text-sm font-medium ${
                  active
                    ? 'text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {!isHome && <div className="hidden md:block w-[120px]" />}

        <MobileNav />
      </div>
    </header>
  );
}