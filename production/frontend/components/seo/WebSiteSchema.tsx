import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = "https://www.elige-tuplan.cl";

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}#website`,
    name: "EligeTuPlan",
    url: SITE_URL,
    inLanguage: "es-CL",
    publisher: { "@id": `${SITE_URL}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target:
        `${SITE_URL}/comparar/isapres?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return <JsonLd data={schema} />;
}
