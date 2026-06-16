import { JsonLd } from "@/components/seo/JsonLd";

type Crumb = { name: string; url: string };

export function BreadcrumbSchema({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${items[items.length - 1]?.url ?? "https://www.elige-tuplan.cl"}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={schema} />;
}
