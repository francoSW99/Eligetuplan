'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import LeadCaptureForm from '@/components/ui/lead-capture-form';

export default function ContactoPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <section className="px-6 pt-8 pb-4 md:pt-10 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div className="rounded-[28px] border border-[#0f514b]/10 bg-[linear-gradient(135deg,rgba(15,81,75,0.96),rgba(18,121,110,0.96))] px-6 py-6 md:px-8 md:py-7 shadow-[0_24px_60px_rgba(15,81,75,0.18)]">
            <span className="inline-block bg-[#14dcb4]/18 text-[#14dcb4] text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-4">
              Formulario rápido
            </span>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_auto] md:items-end">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  Cotiza tu plan sin salir de esta vista.
                </h1>
                <p className="text-white/72 text-sm md:text-base mt-2 max-w-2xl">
                  Completa tus datos y te contactaremos con una propuesta personalizada. Sin costo y sin compromiso.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-white/85">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><CheckCircle className="w-4 h-4 text-[#14dcb4]" /> Sin costo</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2"><CheckCircle className="w-4 h-4 text-[#14dcb4]" /> 24h</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-4 md:py-6">
        <LeadCaptureForm showHeader={false} />
      </div>
    </div>
  );
}
