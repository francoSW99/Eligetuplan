import { JsonLd } from "@/components/seo/JsonLd";

type ItemListEntry = {
  name: string;
  url: string;
  description?: string;
  image?: string | null;
};

type ItemListSchemaProps = {
  name: string;
  url: string;
  items: ItemListEntry[];
};

export function ItemListSchema({ name, url, items }: ItemListSchemaProps) {
  if (!items.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#itemlist`,
    name,
    url,
    inLanguage: "es-CL",
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      item: {
        "@type": "WebPage",
        name: item.name,
        url: item.url,
        ...(item.description ? { description: item.description } : {}),
        ...(item.image ? { image: item.image } : {}),
      },
    })),
  };

  return <JsonLd data={schema} />;
}
