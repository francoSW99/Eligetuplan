'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  href?: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}

interface CtaButtonConfig {
  label: string;
  onClick?: () => void;
  href?: string;
}

interface PulseFitHeroProps {
  logo?: React.ReactNode;
  navigation?: NavigationItem[];
  ctaButton?: CtaButtonConfig;
  title: string;
  subtitle: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  disclaimer?: string;
  socialProof?: {
    avatars: string[];
    text: string;
  };
  images?: string[];
  className?: string;
  children?: React.ReactNode;
}

const SLIDE_DURATION = 5500;

function HeroMobileMenu({ navigation }: { navigation: NavigationItem[] }) {
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
          {navigation.map((item, index) => {
            const href = item.href || "#";
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={index}
                href={href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition-colors no-underline ${
                  active ? 'bg-[#14dcb4]/15 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
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
            style={{ background: "linear-gradient(135deg, #14dcb4, #0f9d8a)" }}
          >
            Comparar Planes Ahora
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function PulseFitHero({
  logo = (
    <Image
      src="/logos/mamag.png"
      alt="EligeTuPlan"
      width={1568}
      height={496}
      priority
      className="h-10 w-auto drop-shadow-[0_10px_24px_rgba(20,220,180,0.24)] sm:h-12 lg:h-14"
    />
  ),
  navigation = [],
  ctaButton,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  disclaimer,
  socialProof,
  images = [],
  className,
  children,
}: PulseFitHeroProps) {
  const slides = images.length > 0 ? images : ["/cirugia.png", "/kine.jpeg", "/familia.jpeg"];
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setActive((v) => (v + 1) % slides.length), SLIDE_DURATION);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section
      className={cn("relative w-full overflow-hidden", className)}
      style={{ background: "#0f514b", minHeight: "min(720px, 100vh)" }}
      role="banner"
      aria-label="Hero section"
    >
      {/* Rotating background slideshow */}
      <div className="absolute inset-0">
        {slides.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity"
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: i === active ? 1 : 0,
              transform: i === active ? "scale(1.05)" : "scale(1)",
              transition: "opacity 1.2s ease, transform 6.5s linear",
            }}
          />
        ))}
        {/* Lateral overlay: deep teal → softer */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(110deg, rgba(15,81,75,.88) 0%, rgba(15,81,75,.55) 50%, rgba(15,81,75,.25) 100%)",
          }}
        />
        {/* Bottom fade to deepDark for connection with cream section */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 60%, rgba(9,46,42,.92) 100%)",
          }}
        />
      </div>

      {/* Internal header — fixed-height bar; logo can overflow for "sticker" effect */}
      <header
        className="relative z-20 h-14 sm:h-[60px] border-b overflow-visible"
        style={{
          background: "rgba(15, 81, 75, 0.55)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          borderColor: "rgba(20, 220, 180, 0.15)",
        }}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 overflow-visible">
          <div className="shrink-0 translate-y-3 sm:translate-y-5">{logo}</div>

          <nav className="hidden md:flex items-center gap-9" aria-label="Main navigation">
            {navigation.map((item, index) => (
              <a
                key={index}
                href={item.href || "#"}
                onClick={item.onClick}
                className="nav-link text-[17px] font-semibold tracking-tight text-white/90 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {ctaButton && (
              ctaButton.onClick ? (
                <button
                  onClick={ctaButton.onClick}
                  className="hidden sm:inline-flex px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all hover:-translate-y-0.5 text-sm sm:text-base"
                  style={{
                    background: "#14dcb4",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    color: "#0f514b",
                    boxShadow: "0 6px 16px rgba(20,220,180,0.3)",
                  }}
                >
                  {ctaButton.label}
                </button>
              ) : ctaButton.href ? (
                <a
                  href={ctaButton.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all hover:-translate-y-0.5 no-underline text-sm sm:text-base"
                  style={{
                    background: "#14dcb4",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 700,
                    color: "#0f514b",
                    boxShadow: "0 6px 16px rgba(20,220,180,0.3)",
                  }}
                >
                  {ctaButton.label}
                </a>
              ) : null
            )}

            <HeroMobileMenu navigation={navigation} />
          </div>
        </div>
      </header>

      {/* Main content — overlay text on slideshow */}
      {children ? (
        <div className="relative z-10 flex items-center justify-center w-full pt-8 pb-20 sm:pt-12 sm:pb-24">
          {children}
        </div>
      ) : (
        <div className="relative z-10 px-6 sm:px-8 lg:px-12 pt-8 pb-24 sm:pt-12 sm:pb-32 lg:pt-16 lg:pb-36">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start gap-5 max-w-[720px] text-white">
              {/* Pulse badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full"
                style={{
                  padding: "7px 14px",
                  background: "rgba(20,220,180,0.18)",
                  border: "1px solid rgba(20,220,180,0.4)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#14dcb4",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 99,
                    background: "#14dcb4",
                    animation: "hero-pulse 1.5s infinite",
                  }}
                />
                Comparador 100% gratuito
              </div>

              <h1
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(36px, 5.5vw, 60px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  color: "#fff",
                }}
              >
                {title}
              </h1>

              <p
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 400,
                  fontSize: "clamp(15px, 1.8vw, 18px)",
                  lineHeight: 1.55,
                  color: "rgba(255,255,255,0.85)",
                  margin: 0,
                  maxWidth: 540,
                }}
              >
                {subtitle}
              </p>

              {(primaryAction || secondaryAction) && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2">
                  {primaryAction && (
                    <button
                      onClick={primaryAction.onClick}
                      className="inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                      style={{
                        padding: "15px 28px",
                        borderRadius: 16,
                        border: "none",
                        background: "linear-gradient(135deg, #14dcb4, #0f9d8a)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        boxShadow: "0 12px 28px rgba(20,220,180,0.35)",
                      }}
                    >
                      {primaryAction.label}
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M7 10H13M13 10L10 7M13 10L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                  {secondaryAction && (
                    <button
                      onClick={secondaryAction.onClick}
                      className="transition-all hover:-translate-y-0.5"
                      style={{
                        padding: "15px 28px",
                        borderRadius: 16,
                        background: "rgba(255,255,255,0.1)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.25)",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 15,
                        cursor: "pointer",
                      }}
                    >
                      {secondaryAction.label}
                    </button>
                  )}
                </div>
              )}

              {disclaimer && (
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: 0, marginTop: 4 }}>
                  {disclaimer}
                </p>
              )}

              {socialProof && (
                <div className="flex flex-row items-center gap-3 mt-2">
                  <div className="flex flex-row -space-x-2">
                    {socialProof.avatars.map((avatar, index) => (
                      <img
                        key={index}
                        src={avatar}
                        alt={`User ${index + 1}`}
                        className="rounded-full border-2 border-white"
                        style={{ width: 40, height: 40, objectFit: "cover" }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                    {socialProof.text}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Slide indicators */}
          {slides.length > 1 && (
            <div
              className="absolute z-10 flex gap-1.5"
              style={{
                bottom: 22,
                left: "max(24px, 5vw)",
                right: "max(24px, 5vw)",
                maxWidth: 280,
                opacity: 0.55,
              }}
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="flex-1 cursor-pointer relative overflow-hidden"
                  style={{
                    height: 1.5,
                    borderRadius: 2,
                    background: "rgba(255,255,255,0.18)",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(255,255,255,0.7)",
                      transformOrigin: "left",
                      transform: i < active ? "scaleX(1)" : "scaleX(0)",
                      animation: i === active ? `hero-progress ${SLIDE_DURATION}ms linear forwards` : "none",
                      transition: i < active ? "transform .3s" : "none",
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes hero-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes hero-progress { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>
    </section>
  );
}
