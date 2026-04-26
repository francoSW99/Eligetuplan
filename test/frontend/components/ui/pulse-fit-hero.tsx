'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

const floatingVariants2 = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const, delay: 0.5 },
  },
};

const floatingVariants3 = {
  animate: {
    y: [0, -6, 0],
    transition: { duration: 5, repeat: Infinity, ease: "easeInOut" as const, delay: 1 },
  },
};

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
  const hasImages = images.length >= 3;

  return (
    <section
      className={cn(
        "relative w-full flex flex-col overflow-hidden",
        hasImages ? "min-h-screen" : "min-h-screen",
        className
      )}
      style={{
        background: "linear-gradient(180deg, #0f514b 0%, #14dcb4 60%, #eef2f5 100%)",
      }}
 role="banner"
      aria-label="Hero section"
    >
{/* Header */}
      <header className="relative z-20 py-3 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="shrink-0">
            {logo}
          </div>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navigation.map((item, index) => (
              <a
                key={index}
                href={item.href || "#"}
                onClick={item.onClick}
                className="nav-link text-base font-medium text-white/60 hover:text-white"
              >
                {item.label}
                {item.hasDropdown && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: "inline", marginLeft: 4, verticalAlign: "middle" }}>
                    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {ctaButton && (
              ctaButton.onClick ? (
                <button
                  onClick={ctaButton.onClick}
                  className="hidden sm:inline-flex px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all hover:scale-105 text-sm sm:text-base"
                  style={{ background: "#14dcb4", border: "1px solid rgba(255,255,255,0.3)", fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#ffffff", boxShadow: "0 2px 12px rgba(20,220,180,0.3)" }}
                >
                  {ctaButton.label}
                </button>
              ) : ctaButton.href ? (
                <a
                  href={ctaButton.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all hover:scale-105 no-underline text-sm sm:text-base"
                  style={{ background: "#14dcb4", border: "1px solid rgba(255,255,255,0.3)", fontFamily: "Poppins, sans-serif", fontWeight: 600, color: "#ffffff", boxShadow: "0 2px 12px rgba(20,220,180,0.3)" }}
                >
                  {ctaButton.label}
                </a>
              ) : null
            )}

            <HeroMobileMenu navigation={navigation} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children ? (
        <div className="relative z-10 flex-1 flex items-center justify-center w-full">
          {children}
        </div>
      ) : hasImages ? (
        /* Two-column layout: text left, image collage right */
        <div className="relative z-10 flex-1 flex items-center px-8 lg:px-16 pb-16">
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text Content */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left" style={{ gap: "28px" }}>
              <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(32px, 5vw, 64px)", lineHeight: "1.1", color: "#ffffff", letterSpacing: "-0.02em" }}>
                {title}
              </h1>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: "clamp(15px, 1.8vw, 19px)", lineHeight: "1.6", color: "rgba(255,255,255,0.85)", maxWidth: "520px" }}>
                {subtitle}
              </p>

              {(primaryAction || secondaryAction) && (
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                  {primaryAction && (
                    <button
                      onClick={primaryAction.onClick}
                      className="flex flex-row items-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-105"
                      style={{ background: "#14dcb4", fontFamily: "Poppins, sans-serif", fontSize: "17px", fontWeight: 600, color: "#ffffff", boxShadow: "0 4px 20px rgba(20,220,180,0.35)" }}
                    >
                      {primaryAction.label}
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M7 10H13M13 10L10 7M13 10L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                  {secondaryAction && (
                    <button
                      onClick={secondaryAction.onClick}
                      className="px-8 py-4 rounded-full transition-all hover:scale-105"
                      style={{ background: "transparent", border: "2px solid rgba(255,255,255,0.5)", fontFamily: "Poppins, sans-serif", fontSize: "17px", fontWeight: 500, color: "#ffffff" }}
                    >
                      {secondaryAction.label}
                    </button>
                  )}
                </div>
              )}

              {disclaimer && (
                <p style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>
                  {disclaimer}
                </p>
              )}

              {socialProof && (
                <div className="flex flex-row items-center gap-3">
                  <div className="flex flex-row -space-x-2">
                    {socialProof.avatars.map((avatar, index) => (
                      <img key={index} src={avatar} alt={`User ${index + 1}`} className="rounded-full border-2 border-white" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>
                    {socialProof.text}
                  </span>
                </div>
              )}
            </div>

            {/* Right: Image Collage — responsive mobile + desktop */}
            <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[500px]">
              {/* Decorative Shapes */}
              <motion.div
                className="absolute -top-4 left-1/4 h-16 w-16 rounded-full bg-white/20 hidden sm:block"
                variants={floatingVariants}
                animate="animate"
              />
              <motion.div
                className="absolute bottom-0 right-1/4 h-12 w-12 rounded-lg bg-white/15 hidden sm:block"
                variants={floatingVariants2}
                animate="animate"
              />
              <motion.div
                className="absolute bottom-1/4 left-4 h-6 w-6 rounded-full bg-white/20 hidden sm:block"
                variants={floatingVariants3}
                animate="animate"
              />

              {/* Mobile: horizontal row of 3 small cards */}
              <div className="flex lg:hidden justify-center gap-3 h-full items-center px-2">
                {images.slice(0, 3).map((img, i) => {
                  const labels = ["Cirugía", "Kinesiología", "Familia"];
                  return (
                    <motion.div
                      key={i}
                      className="w-[30%] h-[75%] rounded-2xl bg-white/10 p-1.5 shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                    >
                      <img src={img} alt={labels[i]} className="h-full w-full rounded-xl object-cover" />
                    </motion.div>
                  );
                })}
              </div>

              {/* Desktop: overlapping collage */}
              <div className="hidden lg:block absolute inset-0">
                {/* Image 1 — top center */}
                <div
                  className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-2xl bg-white/10 p-2 shadow-lg sm:h-64 sm:w-64"
                  style={{ transformOrigin: "bottom center" }}
                >
                  <img src={images[0]} alt="Cirugía" className="h-full w-full rounded-xl object-cover" />
                </div>

                {/* Image 2 — right middle */}
                <div
                  className="absolute right-0 top-1/3 h-40 w-40 rounded-2xl bg-white/10 p-2 shadow-lg sm:h-56 sm:w-56"
                  style={{ transformOrigin: "left center" }}
                >
                  <img src={images[1]} alt="Kinesiología" className="h-full w-full rounded-xl object-cover" />
                </div>

                {/* Image 3 — bottom left */}
                <div
                  className="absolute bottom-0 left-8 h-44 w-44 rounded-2xl bg-white/10 p-2 shadow-lg sm:h-56 sm:w-56"
                  style={{ transformOrigin: "top right" }}
                >
                  <img src={images[2]} alt="Familia" className="h-full w-full rounded-xl object-cover" />
                </div>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Centered layout (no images) */
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4">
          <div className="flex flex-col items-center text-center max-w-4xl" style={{ gap: "32px" }}>
            <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(36px, 6vw, 72px)", lineHeight: "1.1", color: "#ffffff", letterSpacing: "-0.02em" }}>
              {title}
            </h1>
            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400, fontSize: "clamp(16px, 2vw, 20px)", lineHeight: "1.6", color: "rgba(255,255,255,0.85)", maxWidth: "600px" }}>
              {subtitle}
            </p>
            {(primaryAction || secondaryAction) && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {primaryAction && (
                  <button onClick={primaryAction.onClick} className="flex flex-row items-center gap-2 px-8 py-4 rounded-full transition-all hover:scale-105" style={{ background: "#14dcb4", fontFamily: "Poppins, sans-serif", fontSize: "18px", fontWeight: 600, color: "#ffffff", boxShadow: "0 4px 20px rgba(20,220,180,0.35)" }}>
                    {primaryAction.label}
                  </button>
                )}
                {secondaryAction && (
                  <button onClick={secondaryAction.onClick} className="px-8 py-4 rounded-full transition-all hover:scale-105" style={{ background: "transparent", border: "2px solid rgba(255,255,255,0.5)", fontFamily: "Poppins, sans-serif", fontSize: "18px", fontWeight: 500, color: "#ffffff" }}>
                    {secondaryAction.label}
                  </button>
                )}
              </div>
            )}
            {disclaimer && <p style={{ fontFamily: "Poppins, sans-serif", fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.65)", fontStyle: "italic" }}>{disclaimer}</p>}
            {socialProof && (
              <div className="flex flex-row items-center gap-3">
                <div className="flex flex-row -space-x-2">
                  {socialProof.avatars.map((avatar, index) => (
                    <img key={index} src={avatar} alt={`User ${index + 1}`} className="rounded-full border-2 border-white" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                  ))}
                </div>
                <span style={{ fontFamily: "Poppins, sans-serif", fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.9)" }}>{socialProof.text}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
