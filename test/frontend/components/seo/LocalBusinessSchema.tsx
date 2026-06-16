import { BRAND } from "@/lib/home-data";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = "https://www.elige-tuplan.cl";
const LOGO_URL = `${SITE_URL}${BRAND.logo}`;

export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}#localbusiness`,
    name: "EligeTuPlan",
    image: LOGO_URL,
    url: SITE_URL,
    telephone: BRAND.phoneClean,
    email: BRAND.email,
    priceRange: "Sin costo para el usuario",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santiago",
      addressRegion: "RM",
      addressCountry: "CL",
    },
    areaServed: { "@type": "Country", name: "Chile" },
    description:
      "Servicio de orientación para comparar planes de salud Isapre en Chile y contactar un asesor cuando el usuario lo solicita.",
    parentOrganization: { "@id": `${SITE_URL}#organization` },
  };

  return <JsonLd data={schema} />;
}
