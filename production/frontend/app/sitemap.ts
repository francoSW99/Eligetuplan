import type { MetadataRoute } from "next";

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
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const isapreRoutes = ISAPRES.map((slug) => ({
    url: `${BASE}/comparar/isapres?isapre=${slug}`,
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

  return [...staticRoutes, ...isapreRoutes];
}
