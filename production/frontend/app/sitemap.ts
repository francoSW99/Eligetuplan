import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/blog";
import { PROFILE_LANDING_SLUGS } from "@/lib/seo-landings";

const BASE = "https://www.elige-tuplan.cl";

const ISAPRES = [
  "banmedica",
  "consalud",
  "cruzblanca",
  "nuevamasvida",
  "colmena",
  "vidatres",
  "esencial",
];

const STATIC_ROUTES = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/comparar/isapres", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/tu-mejor-plan", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/buscar", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/como-funciona", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
  // Landings SEO
  { path: "/planes-isapre", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/comparar-planes-isapre", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/asesor-isapre", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/cambiar-isapre", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/pasar-fonasa-a-isapre", priority: 0.9, changeFrequency: "weekly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const isapreRoutes = ISAPRES.map((slug) => ({
    url: `${BASE}/isapres/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  const staticRoutes = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const profileRoutes = PROFILE_LANDING_SLUGS.map((slug) => ({
    url: `${BASE}/planes-isapre/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.82,
  }));

  const blogRoutes = getAllArticles().map((a) => ({
    url: `${BASE}/blog/${a.slug}`,
    lastModified: a.date ? new Date(a.date + "T00:00:00") : now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...isapreRoutes, ...profileRoutes, ...blogRoutes];
}
