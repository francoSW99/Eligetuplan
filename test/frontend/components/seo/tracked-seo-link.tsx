"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
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
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const shouldLetBrowserHandle =
      event.defaultPrevented ||
      event.button !== 0 ||
      target === "_blank" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;

    if (shouldLetBrowserHandle) {
      track.seoLandingClick({ source, target: href, label });
      return;
    }

    event.preventDefault();

    let navigated = false;
    const navigate = () => {
      if (navigated) return;
      navigated = true;

      if (href.startsWith("/") && !href.startsWith("//")) {
        router.push(href);
        return;
      }

      window.location.href = href;
    };

    track.seoLandingClick({
      source,
      target: href,
      label,
      eventCallback: navigate,
    });
  }

  return (
    <Link
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      aria-label={ariaLabel}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
