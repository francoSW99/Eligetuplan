import { BRAND } from "@/lib/home-data";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = "https://www.elige-tuplan.cl";
const LOGO_URL = `${SITE_URL}${BRAND.logo}`;
const SAME_AS: string[] = [];

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: "EligeTuPlan",
    alternateName: "Elige Tu Plan",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}#logo`,
      url: LOGO_URL,
      contentUrl: LOGO_URL,
    },
    image: LOGO_URL,
    email: BRAND.email,
    telephone: BRAND.phoneClean,
    areaServed: {
      "@type": "Country",
      name: "Chile",
      identifier: "CL",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Santiago",
      addressRegion: "RM",
      addressCountry: "CL",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BRAND.phoneClean,
        email: BRAND.email,
        contactType: "customer service",
        availableLanguage: ["es-CL", "Spanish"],
        areaServed: "CL",
      },
    ],
    ...(SAME_AS.length ? { sameAs: SAME_AS } : {}),
  };

  return <JsonLd data={schema} />;
}
