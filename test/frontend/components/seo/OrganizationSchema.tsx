export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "EligeTuPlan",
    url: "https://www.elige-tuplan.cl",
    logo: "https://www.elige-tuplan.cl/logos/mamag.png",
    telephone: "+56968319807",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santiago",
      addressRegion: "RM",
      addressCountry: "CL",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+56968319807",
        contactType: "customer service",
        availableLanguage: ["Spanish"],
        areaServed: "CL",
      },
    ],
    sameAs: [],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
