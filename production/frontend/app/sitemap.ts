import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog";
import { PROFILE_LANDING_SLUGS } from "@/lib/seo-landings";
import { ISAPRE_LANDING_SLUGS } from "@/lib/isapre-landings";
import {
  SITE_URL,
  STATIC_SITEMAP_ROUTES,
  UTILITY_ROUTES,
  absoluteUrl,
} from "@/lib/site-routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [...STATIC_SITEMAP_ROUTES, ...UTILITY_ROUTES].map(
    ({ path, priority, changeFrequency }) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  const isapreRoutes = ISAPRE_LANDING_SLUGS.map((slug) => ({
    url: `${SITE_URL}/isapres/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const profileRoutes = PROFILE_LANDING_SLUGS.map((slug) => ({
    url: `${SITE_URL}/planes-isapre/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.82,
  }));

  const blogRoutes = getAllArticles().map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.date ? new Date(a.date + "T00:00:00") : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...isapreRoutes, ...profileRoutes, ...blogRoutes].sort((a, b) =>
    a.url.localeCompare(b.url)
  );
}
