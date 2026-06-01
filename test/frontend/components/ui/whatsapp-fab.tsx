'use client';

import Image from 'next/image';
import { track } from '@/lib/analytics';

const WHATSAPP_URL = 'https://wa.me/56968319807?text=Hola%2C%20quiero%20cotizar%20un%20plan%20de%20salud.';

export default function WhatsAppFab() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contáctate por WhatsApp"
      onClick={() => track.whatsappClick('fab')}
      className="fixed bottom-6 right-6 z-50 group"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-[wsp-ping_1.5s_ease-out_infinite]" />
      <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_4px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-110">
        <Image src="/wsp2.png" alt="WhatsApp" width={34} height={34} className="w-[34px] h-[34px]" />
      </span>
      <span className="pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[#0f514b] shadow-lg opacity-0 transition-opacity group-hover:opacity-100">
        Contáctate con un ejecutivo
      </span>
    </a>
  );
}