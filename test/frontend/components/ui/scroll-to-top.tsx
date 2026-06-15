'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Fuerza el scroll al tope en cada cambio de ruta. El App Router de Next a veces
 * no resetea el scroll al navegar (sobre todo cuando el layout no cambia o hay
 * streaming), dejando al usuario a mitad/fondo de la página nueva.
 *
 * Respeta las anclas (#calc, etc.): si la URL trae hash, no interfiere para que
 * el navegador haga su scroll al ancla. Usa behavior 'instant' para no animar en
 * cambios de página (el `scroll-smooth` global sí aplica a las anclas).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return null;
}
