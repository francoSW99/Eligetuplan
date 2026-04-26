'use client';

import Image from 'next/image';
import { FileText } from 'lucide-react';

const WHATSAPP_NUMBER = '56968319807';
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

type ContactOptionsProps = {
  isConsalud: boolean;
  planName: string;
  isapreName: string;
  onChooseForm: () => void;
  className?: string;
};

export default function ContactOptions({
  isConsalud,
  planName,
  isapreName,
  onChooseForm,
  className = '',
}: ContactOptionsProps) {
  const whatsAppText = encodeURIComponent(
    `Hola, me interesa el plan ${planName} de ${isapreName}. Quisiera recibir más información.`
  );
  const whatsAppUrl = `${WHATSAPP_BASE_URL}?text=${whatsAppText}`;

  if (!isConsalud) {
    return (
      <button
        type="button"
        onClick={onChooseForm}
        className={`w-full py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg ${className}`}
        style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}
      >
        <FileText className="w-4 h-4" />
        Hablar con un Ejecutivo
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-semibold text-[#0f514b]">
        Elige cómo quieres contactarnos
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onChooseForm}
          className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-[#14dcb4] text-[#0f514b] hover:bg-[#14dcb4]/10 transition-all flex items-center justify-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Formulario
        </button>
        <a
          href={whatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 rounded-2xl font-bold text-sm bg-[#25D366] text-white hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 no-underline"
        >
          <Image src="/wsp2.png" alt="WhatsApp" width={24} height={24} className="w-6 h-6" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}