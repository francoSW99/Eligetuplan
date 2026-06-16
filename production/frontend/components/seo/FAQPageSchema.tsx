import { JsonLd } from "@/components/seo/JsonLd";

type FAQ = { question: string; answer: string };

type FAQPageSchemaProps = {
  items: FAQ[];
  name?: string;
  url?: string;
};

export function FAQPageSchema({ items, name, url }: FAQPageSchemaProps) {
  if (!items.length) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(url ? { "@id": `${url}#faq`, url } : {}),
    ...(name ? { name } : {}),
    inLanguage: "es-CL",
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };

  return <JsonLd data={schema} />;
}
