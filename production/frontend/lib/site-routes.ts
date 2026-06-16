export const SITE_URL = "https://www.elige-tuplan.cl";
export const SITE_CONTENT_LAST_MODIFIED = "2026-06-16T00:00:00-04:00";

export type SitemapRoute = {
  path: string;
  priority: number;
  lastModified?: string;
  changeFrequency:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
};

export const STATIC_SITEMAP_ROUTES: SitemapRoute[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/comparar/isapres", priority: 0.95, changeFrequency: "weekly" },
  { path: "/comparar-planes-isapre", priority: 0.92, changeFrequency: "weekly" },
  { path: "/planes-isapre", priority: 0.9, changeFrequency: "weekly" },
  { path: "/tu-mejor-plan", priority: 0.86, changeFrequency: "weekly" },
  { path: "/asesor-isapre", priority: 0.84, changeFrequency: "weekly" },
  { path: "/cambiar-isapre", priority: 0.84, changeFrequency: "weekly" },
  { path: "/pasar-fonasa-a-isapre", priority: 0.82, changeFrequency: "weekly" },
  { path: "/buscar", priority: 0.72, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.72, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.7, changeFrequency: "monthly" },
  { path: "/como-funciona", priority: 0.62, changeFrequency: "monthly" },
];

export const UTILITY_ROUTES: SitemapRoute[] = [
  { path: "/privacidad", priority: 0.25, changeFrequency: "yearly" },
  { path: "/terminos", priority: 0.25, changeFrequency: "yearly" },
];

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}
