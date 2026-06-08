// Capa de acceso al contenido del blog.
//
// HOY: lee archivos markdown de content/blog/*.md (con frontmatter).
// MAÑANA (migración a Supabase): reemplazar SOLO la implementación de estas
// funciones por queries a una tabla `articulos`. Las páginas (/blog y /blog/[slug])
// no cambian porque consumen esta misma interfaz.

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;          // ISO yyyy-mm-dd
  category: string;
  cover: string | null;  // ruta en /public
  author: string;
  readingMinutes: number;
}

export interface Article extends ArticleMeta {
  content: string;       // cuerpo en markdown
}

function readingMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function toMeta(slug: string, data: Record<string, unknown>, content: string): ArticleMeta {
  return {
    slug,
    title: (data.title as string) ?? slug,
    description: (data.description as string) ?? "",
    date: (data.date as string) ?? "",
    category: (data.category as string) ?? "Guías",
    cover: (data.cover as string) ?? null,
    author: (data.author as string) ?? "Equipo EligeTuPlan",
    readingMinutes: readingMinutes(content),
  };
}

/** Lista de artículos (metadata), más reciente primero. */
export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((file) => {
      const slug = file.replace(/\.mdx?$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
      const { data, content } = matter(raw);
      return toMeta(slug, data, content);
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Un artículo completo (con cuerpo markdown) o null si no existe. */
export function getArticleBySlug(slug: string): Article | null {
  const candidates = [
    path.join(BLOG_DIR, `${slug}.md`),
    path.join(BLOG_DIR, `${slug}.mdx`),
  ];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  return { ...toMeta(slug, data, content), content };
}
