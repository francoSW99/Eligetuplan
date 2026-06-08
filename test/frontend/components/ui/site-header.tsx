'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NAV_ITEMS, BRAND } from '@/lib/home-data';
import { useMeta } from '@/lib/meta-context';

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const { ufValueCLP, lastUpdate } = useMeta();

  const [scrolled, setScrolled] = useState(!isHome);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Bloquear scroll del body cuando el drawer está abierto.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const positionClass = isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0';
  const showTrustStrip = isHome && !scrolled;

  const baseBg = scrolled
    ? 'bg-[#0f514b]/95 backdrop-blur-md shadow-[0_8px_24px_-12px_rgba(9,46,42,0.4)]'
    : 'bg-transparent';

  const calcHref = isHome ? '#calc' : '/#calc';

  return (
    <>
      <header
        className={`${positionClass} z-50 transition-all duration-300 ${baseBg} ${
          scrolled ? 'border-b border-[#14dcb4]/15' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-[60px] sm:h-[68px] items-center justify-between gap-3 sm:gap-6">
            <Link href="/" className="shrink-0 flex items-center gap-3 group" aria-label="EligeTuPlan inicio">
              <Image
                src={BRAND.logo}
                alt="EligeTuPlan"
                width={1568}
                height={496}
                priority
                className="h-8 sm:h-9 lg:h-10 w-auto drop-shadow-[0_8px_22px_rgba(20,220,180,0.22)] transition-transform group-hover:scale-[1.02]"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href !== '/' && (pathname === item.href || pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative px-4 py-2 text-[14.5px] font-semibold text-white/75 hover:text-white transition-colors group"
                  >
                    {item.label}
                    <span
                      className={`absolute left-4 right-4 -bottom-0.5 h-[2px] bg-[#14dcb4] origin-center transition-transform ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Abrir menú"
                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/10 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {showTrustStrip && (
          <div className="hidden md:block border-t border-white/8 bg-black/15">
            <div className="mx-auto max-w-[1280px] px-6 lg:px-10 py-2 flex items-center justify-between text-[11.5px] font-medium text-white/55">
              <div className="flex items-center gap-5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14dcb4] animate-pulse" />
                  Datos actualizados al {lastUpdate}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  UF de hoy:&nbsp;<strong className="text-white/80 font-semibold">${ufValueCLP.toLocaleString('es-CL')}</strong>
                </span>
                <span className="hidden lg:inline-flex items-center gap-1.5">
                  Fuente:&nbsp;<strong className="text-white/80 font-semibold">Superintendencia de Salud</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5"><span className="text-[#14dcb4]">✓</span> 100% gratis</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-[#14dcb4]">✓</span> Sin compromiso</span>
                <span className="inline-flex items-center gap-1.5"><span className="text-[#14dcb4]">✓</span> 24h respuesta</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {mounted && mobileOpen
        ? createPortal(
            <MobileDrawer
              pathname={pathname}
              calcHref={calcHref}
              onClose={() => setMobileOpen(false)}
            />,
            document.body
          )
        : null}
    </>
  );
}

function MobileDrawer({
  pathname,
  calcHref,
  onClose,
}: {
  pathname: string;
  calcHref: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menú principal"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-[#06201d]/70 backdrop-blur-sm"
        style={{ animation: 'fade-in 0.2s ease-out' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-[88vw] max-w-[340px] bg-[#0f514b] shadow-[0_0_60px_rgba(0,0,0,0.6)] flex flex-col"
        style={{ animation: 'slide-in-right 0.3s cubic-bezier(.2,.8,.2,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/10">
          <Image
            src={BRAND.logo}
            alt="EligeTuPlan"
            width={1568}
            height={496}
            className="h-8 w-auto"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-white/85 hover:bg-white/10 active:bg-white/15 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1"
          aria-label="Navegación principal"
        >
          {NAV_ITEMS.map((item) => {
            const active =
              item.href !== '/' && (pathname === item.href || pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`px-4 py-3.5 rounded-xl text-[15px] font-semibold transition-colors no-underline ${
                  active
                    ? 'bg-[#14dcb4]/15 text-[#14dcb4]'
                    : 'text-white/85 hover:bg-white/8 active:bg-white/12 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <div className="my-3 h-px bg-white/10" />

          <a
            href={`${BRAND.whatsappBase}?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud.`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-[14px] font-semibold text-white/75 hover:bg-white/8 active:bg-white/12 transition-colors no-underline flex items-center gap-2.5"
          >
            <svg className="w-4 h-4 text-[#14dcb4]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.638l4.725-1.228A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
            WhatsApp directo
          </a>
        </nav>

        <div className="px-5 pb-6 pt-3 border-t border-white/10">
          <Link
            href={calcHref}
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-[14px] font-bold text-[#0f514b] bg-[#14dcb4] hover:bg-[#1ee5be] shadow-[0_10px_22px_rgba(20,220,180,0.35)] transition-all no-underline"
          >
            Calcular mi 7% legal
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 10h10M11 6l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
