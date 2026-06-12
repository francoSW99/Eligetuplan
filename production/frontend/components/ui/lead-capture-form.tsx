'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  FileText,
  Hash,
  Mail,
  MapPin,
  Phone,
  Send,
  Shield,
  User,
  X,
} from 'lucide-react';
import { track } from '@/lib/analytics';

const SHEETS_URL ='https://script.google.com/macros/s/AKfycbxDO73TTXhYnwyeW4w_EA8fVNqg68I9PjDtO1Td50QPDhiOFkugnI1t0HPWszZGHfv5/exec';

const REGIONES = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana',
  "Región del Libertador Gral. Bernardo O'Higgins",
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región de Aysén',
  'Región de Magallanes',
];

const ISAPRES = [
  'Banmédica',
  'Colmena Golden Cross',
  'Consalud',
  'Cruz Blanca',
  'Vida Tres',
  'Nueva Masvida',
  'Fonasa',
  'No tengo Isapre',
];

type FormData = {
  nombre: string;
  rut: string;
  correo: string;
  telefono: string;
  region: string;
  edad: string;
  planActual: string;
  observaciones: string;
};

export type LeadContextPlan = {
  name: string;
  isapreName: string;
};

type LeadCaptureFormProps = {
  contextPlan?: LeadContextPlan;
  compact?: boolean;
  onClose?: () => void;
  showHeader?: boolean;
  /** Para distinguir en GA4 desde qué página se envió el lead. */
  formType?: 'asesor' | 'buscar' | 'newsletter';
};

const EMPTY_FORM: FormData = {
  nombre: '',
  rut: '',
  correo: '',
  telefono: '',
  region: '',
  edad: '',
  planActual: '',
  observaciones: '',
};

export default function LeadCaptureForm({
  contextPlan,
  compact = false,
  onClose,
  showHeader = true,
  formType = 'buscar',
}: LeadCaptureFormProps) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const set =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setError('');
    };

  const validate = (): string => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio.';
    if (!form.rut.trim()) return 'El RUT es obligatorio.';
    if (!form.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      return 'Ingresa un correo válido.';
    }
    if (!form.telefono.trim()) return 'El teléfono es obligatorio.';
    if (!form.region) return 'Selecciona tu región.';
    if (!form.edad || Number(form.edad) < 18 || Number(form.edad) > 100) {
      return 'Ingresa una edad válida (18–100).';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await fetch(SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          planCotizado: contextPlan ? `${contextPlan.isapreName} - ${contextPlan.name}` : '',
        }),
      });
      setSubmitted(true);
      track.formSubmit(formType);
    } catch {
      setError('Ocurrió un error al enviar. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-slate-300 rounded-xl px-4 py-3 text-[15px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all bg-white placeholder:text-slate-400';
  const labelClass =
    'flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 mb-1.5';
  const wrapperClass = compact
    ? 'bg-white rounded-[28px] border border-slate-200 shadow-[0_24px_80px_rgba(15,81,75,0.18)] p-5 md:p-6'
    : 'bg-white rounded-3xl border border-slate-200 shadow-[0_20px_55px_-18px_rgba(15,81,75,0.28)] p-5 md:p-7';

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={wrapperClass + ' text-center'}
        >
          <div className="w-20 h-20 rounded-full bg-[#14dcb4]/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#14dcb4]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0f514b] mb-3">¡Perfecto! Datos recibidos</h2>
          <p className="text-slate-500 mb-2">
            Un ejecutivo certificado te contactará a la brevedad con las mejores opciones para tu perfil.
          </p>
          <p className="text-slate-400 text-sm mb-8">Tiempo de respuesta estimado: menos de 24 horas.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm(EMPTY_FORM);
              }}
              className="text-sm font-semibold text-[#14dcb4] hover:text-[#0f9d8a] transition-colors"
            >
              Enviar otra consulta
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-[#14dcb4] hover:text-[#0f514b] transition-colors"
              >
                <X className="w-4 h-4" /> Cerrar
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={wrapperClass}
        >
          {showHeader && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0f514b] mb-1">Completa tus datos</h2>
              <p className="text-sm text-slate-400">
                Te contactaremos con las mejores opciones en menos de 24 horas.
              </p>
            </div>
          )}

          {contextPlan && (
            <div className="mb-5 rounded-2xl border border-[#14dcb4]/20 bg-[#14dcb4]/8 px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0f514b]/70 mb-1">
                Plan seleccionado
              </div>
              <div className="text-sm font-semibold text-[#0f514b]">
                {contextPlan.isapreName} · {contextPlan.name}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3.5">
              <div>
                <label className={labelClass}>
                  <User className="w-3.5 h-3.5" /> Nombre Completo *
                </label>
                <input type="text" value={form.nombre} onChange={set('nombre')} placeholder="Ej: Juan Pérez González" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  <Hash className="w-3.5 h-3.5" /> RUT *
                </label>
                <input type="text" value={form.rut} onChange={set('rut')} placeholder="Ej: 12.345.678-9" className={inputClass} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3.5">
              <div>
                <label className={labelClass}>
                  <Mail className="w-3.5 h-3.5" /> Correo Electrónico *
                </label>
                <input type="email" value={form.correo} onChange={set('correo')} placeholder="Ej: juan@gmail.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  <Phone className="w-3.5 h-3.5" /> Teléfono *
                </label>
                <input type="tel" value={form.telefono} onChange={set('telefono')} placeholder="Ej: +56 9 8765 4321" className={inputClass} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-4 gap-y-3.5">
              <div>
                <label className={labelClass}>
                  <MapPin className="w-3.5 h-3.5" /> Región *
                </label>
                <select value={form.region} onChange={set('region')} className={inputClass}>
                  <option value="">Selecciona tu región</option>
                  {REGIONES.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>
                  <Calendar className="w-3.5 h-3.5" /> Edad *
                </label>
                <input type="number" value={form.edad} onChange={set('edad')} placeholder="Ej: 35" min={18} max={100} className={inputClass} />
              </div>
            </div>

            <div className="grid gap-x-4 gap-y-3.5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                <div>
                  <label className={labelClass}>
                    <Shield className="w-3.5 h-3.5" /> ¿Cual es tu sistema de salud actual? Isapre, Fonasa o ninguno (opcional)
                  </label>
                  <select value={form.planActual} onChange={set('planActual')} className={inputClass}>
                    <option value="">Selecciona tu sistema de salud actual</option>
                    {ISAPRES.map((isapre) => (
                      <option key={isapre} value={isapre}>
                      {isapre}
                    </option>
                  ))}
                </select>
              </div>

                <div>
                  <label className={labelClass}>
                    <FileText className="w-3.5 h-3.5" /> Observaciones (opcional)
                  </label>
                <textarea
                  value={form.observaciones}
                  onChange={set('observaciones')}
                  placeholder={contextPlan ? `Ej: Quiero cotizar el plan ${contextPlan.name} y revisar otras alternativas similares...` : 'Ej: Necesito plan familiar, tengo 2 cargas, busco cobertura dental...'}
                  rows={2}
                  className={`${inputClass} min-h-[52px] resize-none`}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Enviando datos...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar y Recibir Cotización
                </>
              )}
            </button>

            <p className="text-center text-[11.5px] text-slate-400 leading-relaxed flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#14dcb4] shrink-0" />
              Tus datos están seguros · 100% gratis · Sin spam. Al enviar aceptas que te contactemos.
            </p>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
