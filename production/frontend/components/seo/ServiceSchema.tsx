type ServiceProps = {
  name: string;
  description: string;
  url: string;
};

export function ServiceSchema({ name, description, url }: ServiceProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Asesoría en Planes de Salud Isapre",
    provider: {
      "@type": "Organization",
      name: "EligeTuPlan",
      url: "https://www.elige-tuplan.cl",
    },
    areaServed: { "@type": "Country", name: "Chile" },
    name,
    description,
    url,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CLP" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
