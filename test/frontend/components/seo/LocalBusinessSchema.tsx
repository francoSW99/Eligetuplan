export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "EligeTuPlan - Asesoría en Planes de Salud Isapre",
    image: "https://www.elige-tuplan.cl/logos/mamag.png",
    "@id": "https://www.elige-tuplan.cl",
    url: "https://www.elige-tuplan.cl",
    telephone: "+56968319807",
    priceRange: "Gratis",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santiago",
      addressRegion: "RM",
      addressCountry: "CL",
    },
    areaServed: { "@type": "Country", name: "Chile" },
    description:
      "Asesoría 100% gratuita para comparar y elegir tu plan de Isapre. Datos oficiales de la Superintendencia de Salud.",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
