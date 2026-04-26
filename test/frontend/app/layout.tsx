import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import SiteHeader from "@/components/ui/site-header";
import WhatsAppFab from "@/components/ui/whatsapp-fab";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "EligeTuPlan - Compara Planes de Salud en Chile",
  description: "Encuentra y compara tu plan de salud ideal entre todas las Isapres de Chile. 100% gratuito.",
};

export const viewport = {
  themeColor: "#0f514b",
};

const ISAPRES = [
  { name: "Banmédica", href: "/comparar/isapres?isapre=banmedica" },
  { name: "Consalud", href: "/comparar/isapres?isapre=consalud" },
  { name: "Colmena Golden Cross", href: "/comparar/isapres?isapre=colmena" },
  { name: "Cruz Blanca", href: "/comparar/isapres?isapre=cruzblanca" },
  { name: "Vida Tres", href: "/comparar/isapres?isapre=vidatres" },
  { name: "Nueva Más Vida", href: "/comparar/isapres?isapre=nuevamasvida" },
  { name: "Esencial", href: "/comparar/isapres?isapre=esencial" },
];

const SITIOS = [
  { name: "Superintendencia de Salud", href: "https://www.superdesalud.gob.cl/" },
  { name: "Ministerio de Salud", href: "https://www.minsal.cl/" },
  { name: "Isapres de Chile (AICH)", href: "https://www.isapresdechile.cl/" },
  { name: "FONASA", href: "https://www.fonasa.cl/" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#0f514b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${poppins.className} antialiased bg-[#eef2f5] text-slate-900 min-h-screen flex flex-col`}>
        <SiteHeader />

        <main className="flex-grow">
          {children}
        </main>

        <WhatsAppFab />

        <footer className="bg-[#092e2a] text-white mt-16">
          <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10">

              <div>
                <Image
                  src="/logos/mamag.png"
                  alt="EligeTuPlan"
                  width={1568}
                  height={496}
                  className="h-8 w-auto mb-4 brightness-0 invert"
                />
                <p className="text-[13px] text-white/50 leading-relaxed mb-5">
                  La única plataforma 100% gratuita que te permite comparar, cotizar y solicitar planes de salud de todas las Isapres de Chile.
                </p>
                <div className="flex items-center gap-3">
                  <a href="https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud." target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-[#25D366] hover:text-white transition-colors no-underline" aria-label="WhatsApp">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.725-1.228A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.317 0-4.46-.744-6.207-2.004l-.433-.324-3.462.902.924-3.369-.354-.467A9.96 9.96 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
                  </a>
                  <a href="mailto:contacto@eligetuplan.cl" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-[#14dcb4] hover:text-white transition-colors no-underline" aria-label="Email">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </a>
                  <a href="tel:+56968319807" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:bg-[#14dcb4] hover:text-white transition-colors no-underline" aria-label="Teléfono">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#14dcb4] mb-4">Isapres</h4>
                <ul className="space-y-2">
                  {ISAPRES.map((isapre) => (
                    <li key={isapre.href}>
                      <Link href={isapre.href} className="text-[13px] text-white/50 hover:text-white transition-colors no-underline">
                        {isapre.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#14dcb4] mb-4">Sitios de Interés</h4>
                <ul className="space-y-2">
                  {SITIOS.map((sitio) => (
                    <li key={sitio.href}>
                      <a href={sitio.href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-white/50 hover:text-white transition-colors no-underline">
                        {sitio.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#14dcb4] mb-4">EligeTuPlan</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="tel:+56968319807" className="text-[13px] text-white/50 hover:text-white transition-colors no-underline inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      +56 9 6831 9807
                    </a>
                  </li>
                  <li>
                    <a href="mailto:contacto@eligetuplan.cl" className="text-[13px] text-white/50 hover:text-white transition-colors no-underline inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      contacto@eligetuplan.cl
                    </a>
                  </li>
                  <li>
                    <span className="text-[13px] text-white/50 inline-flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Santiago, Chile
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          <div className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-[12px] text-white/35">
                © 2026 EligeTuPlan. Todos los derechos reservados.
              </p>
              <button className="text-[12px] text-white/35 hover:text-white/70 transition-colors bg-transparent border-none cursor-pointer no-underline">
                Política de Privacidad
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 pb-5">
            <p className="text-[11px] text-white/25 leading-relaxed">
              Descargo de responsabilidad: Este sitio web es solo para información general y orientación sobre planes de Isapre. Toda la información está destinada a guiar al usuario. Si tiene alguna duda, verifique desde el sitio oficial correspondiente.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}