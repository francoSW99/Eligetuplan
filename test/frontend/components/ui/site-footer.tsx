import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/home-data";
import { ISAPRE_LANDING_INFO } from "@/lib/isapre-landings";

type FooterLink = { l: string; h: string; ext?: boolean };
type FooterCol = { t: string; items: FooterLink[] };

const COLS: FooterCol[] = [
  {
    t: "Comparador",
    items: [
      { l: "Comparar más de 2.000 planes", h: "/comparar/isapres" },
      { l: "Plan ideal con IA",     h: "/tu-mejor-plan" },
      { l: "Cotiza con asesor",     h: "/buscar" },
      { l: "Cómo funciona",         h: "/como-funciona" },
      { l: "Blog",                  h: "/blog" },
      { l: "Quiénes somos",         h: "/faq" },
    ],
  },
  {
    t: "Isapres",
    items: Object.values(ISAPRE_LANDING_INFO).map((i) => ({
      l: i.name,
      h: i.officialUrl,
      ext: true,
    })),
  },
  {
    t: "Fuentes oficiales",
    items: [
      { l: "Superintendencia de Salud", h: "https://www.superdesalud.gob.cl/", ext: true },
      { l: "Isapres de Chile (AICH)",   h: "https://www.isapresdechile.cl/",   ext: true },
      { l: "Ministerio de Salud",       h: "https://www.minsal.cl/",            ext: true },
      { l: "FONASA",                    h: "https://www.fonasa.cl/",            ext: true },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#04181a] text-white">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10 pt-16 pb-10">
        <div className="grid md:grid-cols-[1.4fr_repeat(3,1fr)] gap-10 md:gap-12">
          <div>
            <Image
              src={BRAND.logo}
              alt="EligeTuPlan"
              width={1568}
              height={496}
              className="h-9 w-auto mb-5"
            />
            <p className="text-[13.5px] text-white/55 leading-relaxed max-w-[320px] mb-6">
              La única plataforma 100% gratuita para comparar, cotizar y solicitar planes de salud de todas las Isapres de Chile.
            </p>
            <div className="space-y-2">
              <a
                href={`tel:${BRAND.phoneClean}`}
                className="flex items-center gap-2.5 text-[13.5px] text-white/75 hover:text-white transition-colors no-underline"
              >
                <svg className="w-4 h-4 text-[#14dcb4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {BRAND.phone}
              </a>
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-center gap-2.5 text-[13.5px] text-white/75 hover:text-white transition-colors no-underline"
              >
                <svg className="w-4 h-4 text-[#14dcb4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                {BRAND.email}
              </a>
              <div className="flex items-center gap-2.5 text-[13.5px] text-white/55">
                <svg className="w-4 h-4 text-[#14dcb4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.66 16.66L13.41 20.9a2 2 0 0 1-2.83 0L6.34 16.66A8 8 0 1 1 17.66 16.66z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Santiago, Chile
              </div>
            </div>
          </div>

          {COLS.map((c) => (
            <div key={c.t}>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#14dcb4] mb-5">
                {c.t}
              </h4>
              <ul className="space-y-2.5">
                {c.items.map((it) =>
                  it.ext ? (
                    <li key={it.l}>
                      <a
                        href={it.h}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-white/55 hover:text-white transition-colors no-underline"
                      >
                        {it.l}
                      </a>
                    </li>
                  ) : (
                    <li key={it.l}>
                      <Link
                        href={it.h}
                        className="text-[13px] text-white/55 hover:text-white transition-colors no-underline"
                      >
                        {it.l}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-white/45">
          <span>© 2026 EligeTuPlan · Todos los derechos reservados</span>
          <div className="flex items-center gap-5">
            <Link href="/privacidad" className="hover:text-white/80 transition-colors no-underline">
              Política de privacidad
            </Link>
            <Link href="/terminos" className="hover:text-white/80 transition-colors no-underline">
              Términos y condiciones
            </Link>
          </div>
        </div>

        <p className="mt-5 text-[11px] text-white/30 leading-relaxed max-w-[820px]">
          Este sitio es solo para información general y orientación sobre planes de Isapre. Toda la información está destinada a guiar al usuario. Ante cualquier duda, verificar desde el sitio oficial correspondiente. Cumple con la Ley 19.628 sobre Protección de la Vida Privada y la Ley 21.719 sobre Tratamiento de Datos Personales.
        </p>
      </div>
    </footer>
  );
}
