import { JsonLd } from "@/components/seo/JsonLd";

type ArticleSchemaProps = {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  category?: string;
  readingMinutes?: number;
};

const SITE_URL = "https://www.elige-tuplan.cl";
const ORGANIZATION_ID = `${SITE_URL}#organization`;

export function ArticleSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
  category,
  readingMinutes,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    image: {
      "@type": "ImageObject",
      url: imageUrl,
      contentUrl: imageUrl,
    },
    datePublished,
    dateModified: dateModified ?? datePublished,
    inLanguage: "es-CL",
    ...(category ? { articleSection: category } : {}),
    ...(readingMinutes ? { timeRequired: `PT${readingMinutes}M` } : {}),
    author: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: "EligeTuPlan",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logos/mamag.png`,
        contentUrl: `${SITE_URL}/logos/mamag.png`,
      },
    },
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: "Blog de Isapres y Planes de Salud",
      url: `${SITE_URL}/blog`,
    },
  };

  return <JsonLd data={schema} />;
}
