'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessagesSquare, ShieldCheck, Sparkles, X } from 'lucide-react';
import LeadCaptureForm from '@/components/ui/lead-capture-form';
import { track } from '@/lib/analytics';

export default function WhatsAppFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const openModal = () => {
    setOpen(true);
    track.asesorClick('fab');
    track.leadFormOpen('fab');
  };

  const closeModal = () => {
    setOpen(false);
    track.leadFormClose('fab');
  };

  return (
    <>
      <button
        type="button"
        aria-label="Asesorate AQUI! - Un experto de ayuda sin costo"
        onClick={openModal}
        className="fixed bottom-6 right-6 z-50 group inline-flex items-center gap-2.5 rounded-full border border-[#14dcb4]/35 bg-[#0f514b] px-4 py-3 text-white shadow-[0_14px_34px_rgba(15,81,75,0.32)] transition-all hover:-translate-y-0.5 hover:bg-[#0b403b] hover:shadow-[0_18px_42px_rgba(15,81,75,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14dcb4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbf8f3]"
      >
        <span className="absolute inset-0 rounded-full bg-[#14dcb4]/35 animate-[wsp-ping_1.8s_ease-out_infinite]" />
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14dcb4] text-[#0f2826] shadow-[0_8px_22px_rgba(20,220,180,0.34)]">
          <MessagesSquare className="h-5 w-5" strokeWidth={2.4} />
        </span>
        <span className="relative hidden min-w-0 flex-col items-start leading-none sm:flex">
          <span className="text-[13.5px] font-extrabold tracking-tight">Asesorate AQUI!</span>
          <span className="mt-1 text-[11px] font-semibold text-white/68">Un experto de ayuda sin costo</span>
        </span>
        <span className="relative text-[12px] font-extrabold sm:hidden">Asesorate AQUI!</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="lead-fab-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm px-4 py-5 md:px-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fab-lead-title"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="mx-auto flex max-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-[#f8fafc] shadow-[0_28px_90px_rgba(2,12,27,0.32)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-4 bg-[#0f514b] px-5 py-4 text-white md:px-7">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#14dcb4]">
                    <Sparkles className="h-3.5 w-3.5 shrink-0" />
                    Asesoría gratuita
                  </div>
                  <h2 id="fab-lead-title" className="mt-1 max-w-[760px] text-lg font-extrabold leading-tight md:text-2xl">
                    Asesorate para hacer la mejor cotizacion posible
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Cerrar formulario"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14dcb4]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto px-4 py-5 md:px-8 md:py-7">
                <div className="mx-auto mb-4 max-w-3xl rounded-2xl border border-[#14dcb4]/20 bg-[#14dcb4]/10 px-4 py-3 text-[#0f514b]">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0f9d8a]" />
                    <p className="m-0 text-sm font-semibold leading-relaxed">
                      Rellena el formulario para que un experto te contacte inmediatamente
                    </p>
                  </div>
                </div>

                <LeadCaptureForm compact showHeader={false} formType="asesor" onClose={closeModal} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
