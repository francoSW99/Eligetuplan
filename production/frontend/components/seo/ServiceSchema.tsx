import { JsonLd } from "@/components/seo/JsonLd";

type ServiceProps = {
  name: string;
  description: string;
  url: string;
};

const SITE_URL = "https://www.elige-tuplan.cl";

export function ServiceSchema({ name, description, url }: ServiceProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    serviceType: "Asesoría en Planes de Salud Isapre",
    provider: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "EligeTuPlan",
      url: SITE_URL,
    },
    areaServed: { "@type": "Country", name: "Chile" },
    name,
    description,
    url,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CLP" },
  };

  return <JsonLd data={schema} />;
}
