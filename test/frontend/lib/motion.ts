'use client';

import { useReducedMotion } from 'framer-motion';

// Movimiento del comparador (criterios de Emil Kowalski). Las curvas son las mismas que
// --ease-out / --ease-drawer en globals.css. Se anima `transform` como texto (no x/y)
// para que corra fuera del hilo principal: estas hojas se cierran justo cuando la lista
// se vuelve a cargar. Como framer no apaga ese `transform` con "reducir movimiento",
// cada preset lo resuelve aquí y en ese caso solo funde.

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

// Al cerrar, todo deja de recibir toques en el acto: así un toque rápido justo después
// de cerrar llega a la página y no a la capa que se está yendo.
const SIN_TOQUES = 'none' as const;

const SOLO_FUNDIDO = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, pointerEvents: SIN_TOQUES, transition: { duration: 0.12 } },
};

/** Contenedor de una hoja (sin animación propia): deja pasar los toques mientras se cierra. */
export const CONTENEDOR_MOTION = { exit: { pointerEvents: SIN_TOQUES } };

/** Fondo oscuro detrás de hojas y modales. */
export const FONDO_MOTION = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2, ease: EASE_OUT } },
  exit: { opacity: 0, pointerEvents: SIN_TOQUES, transition: { duration: 0.15, ease: EASE_OUT } },
};

/** Hoja que entra desde un borde. Entra con la curva de "drawer" y sale más rápido. */
export function useHojaMotion(desde: 'abajo' | 'derecha') {
  const reducir = useReducedMotion();
  if (reducir) return SOLO_FUNDIDO;
  const fuera = desde === 'abajo' ? 'translateY(100%)' : 'translateX(100%)';
  const dentro = desde === 'abajo' ? 'translateY(0%)' : 'translateX(0%)';
  return {
    initial: { transform: fuera },
    animate: { transform: dentro, transition: { duration: 0.4, ease: EASE_DRAWER } },
    exit: { transform: fuera, pointerEvents: SIN_TOQUES, transition: { duration: 0.22, ease: EASE_OUT } },
  };
}

/** Modal centrado: sube un poco y aparece; al cerrar, sale más rápido de lo que entró. */
export function useModalMotion() {
  const reducir = useReducedMotion();
  if (reducir) return SOLO_FUNDIDO;
  return {
    initial: { opacity: 0, transform: 'translateY(16px) scale(0.98)' },
    animate: { opacity: 1, transform: 'translateY(0px) scale(1)', transition: { duration: 0.25, ease: EASE_OUT } },
    exit: { opacity: 0, transform: 'translateY(8px) scale(0.98)', pointerEvents: SIN_TOQUES, transition: { duration: 0.15, ease: EASE_OUT } },
  };
}

/** Barra flotante (bandeja de comparar): sube desde abajo. */
export function useFlotanteMotion() {
  const reducir = useReducedMotion();
  if (reducir) return SOLO_FUNDIDO;
  return {
    initial: { opacity: 0, transform: 'translateY(16px)' },
    animate: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.25, ease: EASE_OUT } },
    exit: { opacity: 0, transform: 'translateY(12px)', pointerEvents: SIN_TOQUES, transition: { duration: 0.15, ease: EASE_OUT } },
  };
}
