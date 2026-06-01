import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = "www.elige-tuplan.cl";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Dejar pasar localhost (dev) y el host canónico.
  if (host === CANONICAL_HOST || host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return NextResponse.next();
  }

  // Cualquier otro host (eligetuplan.vercel.app, previews de Vercel, etc.):
  // 301 al dominio canónico preservando path + query.
  const url = request.nextUrl.clone();
  url.host = CANONICAL_HOST;
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: [
    // Aplicar a todas las rutas excepto assets estáticos.
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
