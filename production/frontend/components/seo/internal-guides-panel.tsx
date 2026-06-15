import Link from "next/link";
import { ArrowRight } from "lucide-react";

type GuideLink = {
  title: string;
  href: string;
  description: string;
};

const DEFAULT_GUIDES: GuideLink[] = [
  {
    title: "Comparar planes de Isapre",
    href: "/comparar-planes-isapre",
    description: "Guía principal para ordenar precio, cobertura, red y modalidad antes de cotizar.",
  },
  {
    title: "Planes de Isapre para familias",
    href: "/planes-isapre/familia",
    description: "Qué mirar si cotizas con hijos, cargas o pareja.",
  },
  {
    title: "Planes de Isapre para embarazo",
    href: "/planes-isapre/embarazada",
    description: "Cobertura de maternidad, parto, clínicas y condiciones a revisar.",
  },
  {
    title: "Planes para independientes",
    href: "/planes-isapre/independiente",
    description: "Opciones para ingresos variables, 7% y presupuesto mensual.",
  },
  {
    title: "Cambiarse de Isapre",
    href: "/cambiar-isapre",
    description: "Pasos y cuidados antes de mover tu contrato actual.",
  },
  {
    title: "Pasar de Fonasa a Isapre",
    href: "/pasar-fonasa-a-isapre",
    description: "Evalúa si tu 7% alcanza para una alternativa privada.",
  },
];

export function InternalGuidesPanel({
  title = "Guías útiles para seguir comparando",
  description = "Estas rutas conectan las búsquedas más comunes con el comparador y ayudan a revisar el plan desde más de un ángulo.",
  currentHref,
  items = DEFAULT_GUIDES,
}: {
  title?: string;
  description?: string;
  currentHref?: string;
  items?: GuideLink[];
}) {
  const links = items.filter((item) => item.href !== currentHref).slice(0, 6);

  return (
    <section className="bg-[#fbf8f3] py-16">
      <div className="mx-auto max-w-6xl px-6 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0f9d8a]">
              Interlinking útil
            </p>
            <h2 className="text-2xl font-extrabold text-[#0f514b] sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
          <Link
            href="/planes-isapre"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#0f514b] no-underline hover:text-[#0f9d8a]"
          >
            Ver todas las guías <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-[8px] border border-slate-200 bg-white p-5 text-[#0f514b] no-underline shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#14dcb4]/45 hover:shadow-md"
            >
              <h3 className="font-extrabold leading-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold text-[#0f514b]">
                Revisar guía
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
