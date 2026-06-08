import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import SiteHeader from "@/components/ui/site-header";
import SiteFooter from "@/components/ui/site-footer";
import WhatsAppFab from "@/components/ui/whatsapp-fab";
import { MetaProvider } from "@/lib/meta-context";
import { getSiteMeta } from "@/lib/api";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { WebSiteSchema } from "@/components/seo/WebSiteSchema";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["italic", "normal"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.elige-tuplan.cl"),
  title: {
    default: "EligeTuPlan - Compara Planes de Salud Isapre en Chile",
    template: "%s | EligeTuPlan",
  },
  description:
    "Compara 2.072 planes de las 7 Isapres con datos oficiales de la Superintendencia. Asesoría 100% gratuita, sin spam, sin formularios eternos.",
  keywords: [
    "planes de salud",
    "isapres chile",
    "comparar isapres",
    "cambiar isapre",
    "cotizar isapre",
    "asesor isapre",
    "fonasa o isapre",
    "calculadora 7%",
  ],
  authors: [{ name: "EligeTuPlan" }],
  creator: "EligeTuPlan",
  publisher: "EligeTuPlan",
  // Verificación de Search Console: la propiedad es de tipo "Dominio"
  // (sc-domain:elige-tuplan.cl), que se verifica por DNS (TXT), no por meta tag.
  // Por eso NO se usa `verification.google` aquí.
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "https://www.elige-tuplan.cl",
    siteName: "EligeTuPlan",
    title: "EligeTuPlan - Compara Planes de Salud Isapre en Chile",
    description:
      "Compara 2.072 planes de las 7 Isapres con datos oficiales. Asesoría 100% gratis.",
    images: [
      { url: "/icon.png", width: 512, height: 512, alt: "EligeTuPlan" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "EligeTuPlan - Compara Planes de Salud Isapre en Chile",
    description:
      "Compara 2.072 planes con datos oficiales. Asesoría gratis por WhatsApp.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "https://www.elige-tuplan.cl" },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192" },
    ],
    apple: "/icon.png",
  },
};

export const viewport = {
  themeColor: "#0f514b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // UF del día + stats en vivo desde app_meta (fallback a STATS si el backend falla).
  const meta = await getSiteMeta();

  return (
    <html lang="es" className={`scroll-smooth ${fraunces.variable}`}>
      <head>
        <meta name="theme-color" content="#0f514b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${poppins.className} antialiased bg-[#fbf8f3] text-[#1e2a2a] min-h-screen flex flex-col`}>
        <MetaProvider value={meta}>
          <OrganizationSchema />
          <WebSiteSchema />
          <LocalBusinessSchema />

          <SiteHeader />

          <main className="flex-grow">
            {children}
          </main>

          <WhatsAppFab />

          <SiteFooter />

          {process.env.NEXT_PUBLIC_GA_ID && (
            <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
          )}
        </MetaProvider>
      </body>
    </html>
  );
}
