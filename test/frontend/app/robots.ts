import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin"],
      },
    ],
    sitemap: "https://www.elige-tuplan.cl/sitemap.xml",
    host: "https://www.elige-tuplan.cl",
  };
}
