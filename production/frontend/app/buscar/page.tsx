'use client';

import { CheckCircle } from 'lucide-react';
import LeadCaptureForm from '@/components/ui/lead-capture-form';

export default function ContactoPage() {
  return (
    <div className="bg-[#fbf8f3] min-h-screen">
      <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-4 pb-12 md:pt-5">
        {/* Encabezado compacto — el formulario es el protagonista */}
        <div className="mb-3.5">
          <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#0f9d8a] mb-1">
            · Asesoría humana · 100% gratis ·
          </div>
          <h1 className="text-xl md:text-[27px] font-extrabold text-[#0f514b] tracking-[-0.01em] leading-[1.12]">
            Cotiza con un asesor en 1 minuto
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#14dcb4]" /> Sin costo
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#14dcb4]" /> Respuesta en 24 h
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#14dcb4]" /> Sin spam
            </span>
          </div>
        </div>

        <LeadCaptureForm showHeader={false} />
      </div>
    </div>
  );
}
