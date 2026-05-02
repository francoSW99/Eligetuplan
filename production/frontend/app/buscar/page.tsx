'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import LeadCaptureForm from '@/components/ui/lead-capture-form';

export default function ContactoPage() {
  return (
    <div className="bg-[#fbf8f3] min-h-screen">
      <section className="px-6 pt-8 pb-4 md:pt-10 md:pb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <div
            className="relative overflow-hidden rounded-[28px] border border-[rgba(20,220,180,0.15)] px-6 py-7 md:px-9 md:py-8 shadow-[0_30px_80px_-20px_rgba(15,81,75,0.4)]"
            style={{ background: 'linear-gradient(180deg, #0f514b 0%, #092e2a 100%)' }}
          >
            <div
              className="pointer-events-none absolute -top-[40%] -right-[10%]"
              style={{
                width: 360,
                height: 360,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(20,220,180,.18) 0%, transparent 60%)',
              }}
              aria-hidden
            />
            <div className="relative z-10">
              <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#14dcb4] mb-3">
                · Asesoría humana ·
              </div>
              <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_auto] md:items-end">
                <div>
                  <h1 className="text-2xl md:text-[34px] font-bold text-white leading-[1.1] tracking-tight">
                    Cotiza tu plan sin salir de esta vista.
                  </h1>
                  <p className="text-white/70 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                    Completa tus datos y te contactaremos con una propuesta personalizada. Sin costo y sin compromiso.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 text-sm text-white/85">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-2"><CheckCircle className="w-4 h-4 text-[#14dcb4]" /> Sin costo</span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-2"><CheckCircle className="w-4 h-4 text-[#14dcb4]" /> 24h</span>
                </div>
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
