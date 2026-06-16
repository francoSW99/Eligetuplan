"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { track, type SeoLandingSource } from "@/lib/analytics";

type TrackedSeoLinkProps = {
  href: string;
  source: SeoLandingSource;
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  target?: string;
  rel?: string;
  "aria-label"?: string;
};

export function TrackedSeoLink({
  href,
  source,
  label,
  children,
  className,
  style,
  target,
  rel,
  "aria-label": ariaLabel,
}: TrackedSeoLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onClick={() => track.seoLandingClick({ source, target: href, label })}
    >
      {children}
    </Link>
  );
}
