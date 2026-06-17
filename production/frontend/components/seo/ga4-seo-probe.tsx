"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

export function Ga4SeoProbe() {
  const pathname = usePathname();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get("ga4_probe") !== "seo") return;

    const timeout = window.setTimeout(() => {
      track.seoLandingClick({
        source: "seo_landing",
        target: pathname || window.location.pathname,
        label: "GA4 probe",
      });
    }, 1500);

    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return null;
}
