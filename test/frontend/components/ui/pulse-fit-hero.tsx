'use client';

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavigationItem {
  label: string;
  href?: string;
  hasDropdown?: boolean;
  onClick?: () => void;
}

interface PulseFitHeroProps {
  logo?: string;
  navigation?: NavigationItem[];
  ctaButton?: {
    label: string;
    onClick: () => void;
  };
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

export function PulseFitHero({
  logo = "PulseFit",
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
      <header
        className="relative z-20 flex flex-row justify-between items-center px-8 lg:px-16"
        style={{ paddingTop: "32px", paddingBottom: "32px" }}
      >
        <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "24px", color: "#ffffff" }}>
          {logo}
        </div>

        <nav className="hidden lg:flex flex-row items-center gap-8" aria-label="Main navigation">
          {navigation.map((item, index) => (
            <a
              key={index}
              href={item.href || "#"}
              onClick={item.onClick}
              className="flex flex-row items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ fontFamily: "Poppins, sans-serif", fontSize: "16px", fontWeight: 500, color: "rgba(255,255,255,0.85)", textDecoration: "none" }}
            >
              {item.label}
              {item.hasDropdown && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </a>
          ))}
        </nav>

        {ctaButton && (
          <button
            onClick={ctaButton.onClick}
            className="px-6 py-3 rounded-full transition-all hover:scale-105"
            style={{ background: "#14dcb4", border: "1px solid rgba(255,255,255,0.3)", fontFamily: "Poppins, sans-serif", fontSize: "16px", fontWeight: 600, color: "#ffffff", boxShadow: "0 2px 12px rgba(20,220,180,0.3)" }}
          >
            {ctaButton.label}
          </button>
        )}
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

            {/* Right: Image Collage — exact classes from hero-section-9 */}
            <div className="relative h-[400px] w-full sm:h-[500px] hidden lg:block">
              {/* Decorative Shapes */}
              <motion.div
                className="absolute -top-4 left-1/4 h-16 w-16 rounded-full bg-white/20"
                variants={floatingVariants}
                animate="animate"
              />
              <motion.div
                className="absolute bottom-0 right-1/4 h-12 w-12 rounded-lg bg-white/15"
                variants={floatingVariants2}
                animate="animate"
              />
              <motion.div
                className="absolute bottom-1/4 left-4 h-6 w-6 rounded-full bg-white/20"
                variants={floatingVariants3}
                animate="animate"
              />

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
