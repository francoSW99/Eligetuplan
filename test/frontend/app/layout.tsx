import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "EligeTuPlan - Compara Planes de Salud en Chile",
  description: "Encuentra y compara tu plan de salud ideal entre todas las Isapres de Chile. 100% gratuito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${poppins.className} antialiased bg-[#eef2f5] text-slate-900 min-h-screen flex flex-col`}>

        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#dde3e8] border-t border-slate-300 py-12 text-slate-600">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">

              {/* Social icons + About */}
              <div className="max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-5 h-5 text-brand-secondary hover:text-brand-primary cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  <svg className="w-5 h-5 text-brand-secondary hover:text-brand-primary cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <svg className="w-5 h-5 text-brand-secondary hover:text-brand-primary cursor-pointer transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </div>
                <h4 className="font-bold text-brand-secondary mb-2">About Us</h4>
                <p className="text-sm leading-relaxed">
                  Plataforma independiente para comparar y elegir tu seguro de salud de forma inteligente y gratuita en Chile.
                </p>
              </div>

              {/* Legal links */}
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <Link href="#" className="text-brand-primary hover:underline font-medium">Política de Servicio</Link>
                <Link href="#" className="text-brand-primary hover:underline font-medium">Política de Precio</Link>
                <Link href="#" className="text-brand-primary hover:underline font-medium">Términos de Servicio</Link>
              </div>
            </div>

            <div className="border-t border-slate-300 pt-6 text-center text-xs text-slate-500">
              © 2026 EligeTuPlan. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
