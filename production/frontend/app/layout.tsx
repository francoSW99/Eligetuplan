import type { Metadata } from "next";
import { Poppins, Fraunces } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/ui/site-header";
import SiteFooter from "@/components/ui/site-footer";
import WhatsAppFab from "@/components/ui/whatsapp-fab";

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
  title: "EligeTuPlan - Compara Planes de Salud en Chile",
  description: "Encuentra y compara tu plan de salud ideal entre todas las Isapres de Chile. 100% gratuito.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32" },
      { url: "/icon.png", sizes: "192x192" },
    ],
    apple: "/icon.png",
  },
  openGraph: {
    title: "EligeTuPlan - Compara Planes de Salud en Chile",
    description: "Encuentra y compara tu plan de salud ideal entre todas las Isapres de Chile. 100% gratuito.",
    url: "https://elige-tuplan.cl",
    siteName: "EligeTuPlan",
    images: [{ url: "/icon.png", width: 512, height: 512 }],
    type: "website",
  },
};

export const viewport = {
  themeColor: "#0f514b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`scroll-smooth ${fraunces.variable}`}>
      <head>
        <meta name="theme-color" content="#0f514b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${poppins.className} antialiased bg-[#fbf8f3] text-[#1e2a2a] min-h-screen flex flex-col`}>
        <SiteHeader />

        <main className="flex-grow">
          {children}
        </main>

        <WhatsAppFab />

        <SiteFooter />
      </body>
    </html>
  );
}
