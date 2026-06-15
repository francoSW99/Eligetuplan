export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "EligeTuPlan",
    url: "https://www.elige-tuplan.cl",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://www.elige-tuplan.cl/comparar/isapres?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
