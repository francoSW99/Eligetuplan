import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "www.elige-tuplan.cl";

// Único host que genera contenido duplicado indexable en Google.
// - El apex (elige-tuplan.cl) ya lo redirige Vercel con 308.
// - Los previews de Vercel llevan noindex automático → no se tocan.
const VERCEL_HOST = "eligetuplan.vercel.app";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  if (host === VERCEL_HOST) {
    // 301 al dominio canónico preservando path + query.
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    url.port = "";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto assets estáticos.
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
