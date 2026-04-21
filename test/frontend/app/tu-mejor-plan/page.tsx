'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, User, Users, Check, Zap, MapPin, Mail, Plus, X } from 'lucide-react';

type Carga = { sexo: string; edad: string };
type MatchResult = {
  id: string;
  name: string;
  isapre_name: string;
  logo_url: string;
  price_uf: number;
  match_score: number;
  hospital_coverage: number;
  ambulatory_coverage: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function parseIncomeValue(value: string) {
  return Number(value.replace(/[^\d]/g, ''));
}

export default function TuMejorPlanPage() {
  const [step, setStep] = useState(1);
  const [tipo, setTipo] = useState<'solo' | 'pareja'>('solo');
  const [cargas, setCargas] = useState<Carga[]>([]);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1 fields
  const [isapreActual, setIsapreActual] = useState('');
  const [planActual, setPlanActual] = useState('');
  const [precioUF, setPrecioUF] = useState('');

  // Step 2 fields
  const [sexo, setSexo] = useState('masculino');
  const [edad, setEdad] = useState('');
  const [ingreso, setIngreso] = useState('');
  const [region, setRegion] = useState('');
  const [email, setEmail] = useState('');

  // Step 2 pareja
  const [sexoPareja, setSexoPareja] = useState('femenino');
  const [edadPareja, setEdadPareja] = useState('');
  const [ingresoPareja, setIngresoPareja] = useState('');

  const steps = [
    { num: 1, label: 'Tu Plan Actual' },
    { num: 2, label: 'Tu Perfil' },
    { num: 3, label: 'Completado' },
  ];

  const addCarga = () => setCargas([...cargas, { sexo: 'masculino', edad: '' }]);
  const removeCarga = (i: number) => setCargas(cargas.filter((_, idx) => idx !== i));
  const recommendedPlan = results[0] ?? null;
  const cheapestPlan = [...results].sort((a, b) => a.price_uf - b.price_uf).find((plan) => plan.id !== recommendedPlan?.id) ?? [...results].sort((a, b) => a.price_uf - b.price_uf)[0] ?? null;
  const bestCoveragePlan = [...results]
    .sort((a, b) => (b.hospital_coverage + b.ambulatory_coverage) - (a.hospital_coverage + a.ambulatory_coverage))
    .find((plan) => plan.id !== recommendedPlan?.id && plan.id !== cheapestPlan?.id)
    ?? [...results]
      .sort((a, b) => (b.hospital_coverage + b.ambulatory_coverage) - (a.hospital_coverage + a.ambulatory_coverage))[0]
    ?? null;

  const resetFlow = () => {
    setStep(1);
    setResults([]);
    setValidationError('');
    setSubmitError('');
    setIsSubmitting(false);
  };

  const handleCompare = async () => {
    setValidationError('');
    setSubmitError('');

    const parsedAge = Number(edad);
    const parsedIncome = parseIncomeValue(ingreso);

    if (!Number.isFinite(parsedAge) || parsedAge < 18) {
      setValidationError('Ingresa una edad valida de 18 anos o mas para comparar planes.');
      return;
    }

    if (!Number.isFinite(parsedIncome) || parsedIncome <= 0) {
      setValidationError('Ingresa un sueldo liquido valido para calcular el presupuesto del plan.');
      return;
    }

    if (!region) {
      setValidationError('Selecciona una region antes de comparar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/match-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: parsedAge,
          income_clp: parsedIncome,
          dependents: cargas.length + (tipo === 'pareja' ? 1 : 0),
          preferred_region: region,
        }),
      });

      if (!response.ok) {
        throw new Error('No pudimos calcular tu comparacion en este momento. Intenta nuevamente en unos minutos.');
      }

      const data = await response.json() as MatchResult[];
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('La API no devolvio planes para tu perfil.');
      }

      setResults(data);
      setStep(3);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Ocurrio un error inesperado al comparar planes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[720px] mx-auto px-6 py-10">

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s.num ? 'bg-[#14dcb4] text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`hidden sm:inline text-sm font-medium ${step >= s.num ? 'text-[#0f514b]' : 'text-slate-400'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${step > s.num ? 'bg-[#14dcb4]' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <span className="inline-block bg-[#14dcb4]/10 text-[#14dcb4] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                  Paso 1 de 3
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">
                  Cuéntanos sobre <span className="text-[#0f514b]">tu plan actual</span>
                </h2>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  Para comparar, necesitamos saber tu situación actual. Si no tienes Isapre, puedes omitir este paso.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
                {/* Isapre Actual */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Isapre Actual</label>
                  <select
                    value={isapreActual}
                    onChange={(e) => setIsapreActual(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all bg-white"
                  >
                    <option value="">Selecciona tu Isapre</option>
                    <option value="banmedica">Banmédica</option>
                    <option value="consalud">Consalud</option>
                    <option value="cruzblanca">Cruz Blanca</option>
                    <option value="nuevamasvida">Nueva Más Vida</option>
                    <option value="colmena">Colmena Golden Cross</option>
                    <option value="vidatres">Vida Tres</option>
                    <option value="fonasa">Fonasa</option>
                  </select>
                </div>

                {/* Plan Actual */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Plan Actual</label>
                  <input
                    type="text"
                    value={planActual}
                    onChange={(e) => setPlanActual(e.target.value)}
                    placeholder="Ej: Mi Plan 600"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Precio Mensual</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={precioUF}
                      onChange={(e) => setPrecioUF(e.target.value)}
                      placeholder="Ej: 3.5"
                      step="0.1"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">UF</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:-translate-y-0.5 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}
                >
                  Siguiente <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-8">
                <span className="inline-block bg-[#14dcb4]/10 text-[#14dcb4] text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-4">
                  Paso 2 de 3
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b]">
                  Ingresa <span className="text-[#0f514b]">tu perfil</span>
                </h2>
                <p className="text-slate-500 mt-2 max-w-lg mx-auto">
                  Último paso antes de comparar. Necesitamos estos datos para buscar las mejores alternativas.
                </p>
              </div>

              {/* Solo / Pareja toggle */}
              <div className="flex justify-center gap-3 mb-8">
                <button
                  onClick={() => setTipo('solo')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    tipo === 'solo' ? 'bg-[#0f514b] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  <User className="w-4 h-4" /> Solo
                </button>
                <button
                  onClick={() => setTipo('pareja')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                    tipo === 'pareja' ? 'bg-[#0f514b] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  <Users className="w-4 h-4" /> Pareja
                </button>
              </div>

              {/* Person 1 Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5 mb-4">
                <h3 className="font-bold text-[#0f514b] text-sm uppercase tracking-wide">Titular</h3>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Sexo</label>
                  <div className="flex gap-3">
                    {['masculino', 'femenino'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSexo(s)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          sexo === s ? 'bg-[#14dcb4]/15 text-[#0f514b] border-2 border-[#14dcb4]' : 'bg-slate-50 text-slate-500 border-2 border-transparent'
                        }`}
                      >
                        {s === 'masculino' ? '♂ Masculino' : '♀ Femenino'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Edad</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      placeholder="Ej: 30"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">años</span>
                  </div>
                </div>

                {/* Income */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Ingreso Líquido Mensual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                    <input
                      type="text"
                      value={ingreso}
                      onChange={(e) => setIngreso(e.target.value)}
                      placeholder="Ej: 1.200.000"
                      className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Person 2 Card (Pareja) */}
              {tipo === 'pareja' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5 mb-4"
                >
                  <h3 className="font-bold text-[#0f514b] text-sm uppercase tracking-wide">Pareja</h3>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Sexo</label>
                    <div className="flex gap-3">
                      {['masculino', 'femenino'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSexoPareja(s)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            sexoPareja === s ? 'bg-[#14dcb4]/15 text-[#0f514b] border-2 border-[#14dcb4]' : 'bg-slate-50 text-slate-500 border-2 border-transparent'
                          }`}
                        >
                          {s === 'masculino' ? '♂ Masculino' : '♀ Femenino'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Edad</label>
                    <input type="number" value={edadPareja} onChange={(e) => setEdadPareja(e.target.value)} placeholder="Ej: 28"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">Ingreso Líquido Mensual</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">$</span>
                      <input type="text" value={ingresoPareja} onChange={(e) => setIngresoPareja(e.target.value)} placeholder="Ej: 900.000"
                        className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cargas */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#0f514b] text-sm uppercase tracking-wide">Cargas ({cargas.length})</h3>
                  <button onClick={addCarga} className="inline-flex items-center gap-1 text-sm font-semibold text-[#14dcb4] hover:text-[#0f9d8a] transition-colors">
                    <Plus className="w-4 h-4" /> Agregar carga
                  </button>
                </div>
                {cargas.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-4">Sin cargas médicas agregadas.</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cargas.map((carga, i) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 relative">
                      <button onClick={() => removeCarga(i)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs font-bold text-slate-500 mb-3">Carga {i + 1}</p>
                      <div className="flex gap-2 mb-2">
                        {['masculino', 'femenino'].map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              const updated = [...cargas];
                              updated[i].sexo = s;
                              setCargas(updated);
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${
                              carga.sexo === s ? 'bg-[#14dcb4]/15 text-[#0f514b] border border-[#14dcb4]' : 'bg-slate-50 text-slate-400 border border-transparent'
                            }`}
                          >
                            {s === 'masculino' ? '♂' : '♀'}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={carga.edad}
                        onChange={(e) => {
                          const updated = [...cargas];
                          updated[i].edad = e.target.value;
                          setCargas(updated);
                        }}
                        placeholder="Edad"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-5 mb-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> Región
                  </label>
                  <select value={region} onChange={(e) => setRegion(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all bg-white">
                    <option value="">Selecciona tu región</option>
                    <option value="rm">Región Metropolitana</option>
                    <option value="valparaiso">Valparaíso</option>
                    <option value="biobio">Biobío</option>
                    <option value="araucania">La Araucanía</option>
                    <option value="loslagos">Los Lagos</option>
                    <option value="otra">Otra región</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@email.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/40 focus:border-[#14dcb4] transition-all" />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="mt-8 space-y-4">
                {(validationError || submitError) && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {validationError || submitError}
                  </div>
                )}

                <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-[#0f514b] border-2 border-slate-200 hover:border-[#14dcb4] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={handleCompare}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-white transition-all hover:-translate-y-0.5 shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: 'linear-gradient(135deg, #14dcb4, #0f9d8a)' }}
                >
                  <Zap className="w-4 h-4" /> {isSubmitting ? 'Comparando...' : 'Comparar Ahora'}
                </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== STEP 3 - Results ===== */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-full bg-[#14dcb4]/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#14dcb4]" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#1e293b] mb-2">
                  ¡Listo! Encontramos opciones para ti
                </h2>
                <p className="text-slate-500">Estos son los mejores planes según tu perfil.</p>
              </div>

              {/* Result Cards */}
              {results.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-4 mb-10">
                  {[
                    {
                      key: 'economic',
                      badge: 'Más Económico',
                      badgeClassName: 'bg-[#14dcb4] text-white',
                      cardClassName: 'bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative',
                      buttonClassName: 'w-full py-3 rounded-xl font-bold text-sm border-2 border-[#14dcb4] text-[#0f514b] hover:bg-[#14dcb4]/10 transition-all',
                      buttonLabel: 'Ver detalle',
                      plan: cheapestPlan ?? recommendedPlan,
                    },
                    {
                      key: 'recommended',
                      badge: 'Recomendado',
                      badgeClassName: 'bg-[#0f514b] text-white',
                      cardClassName: 'bg-white rounded-2xl border-2 border-[#14dcb4] p-6 shadow-lg relative scale-105',
                      buttonClassName: 'w-full py-3 rounded-xl font-bold text-sm bg-[#14dcb4] text-white hover:bg-[#12c9a4] transition-all shadow-md',
                      buttonLabel: 'Seleccionar',
                      plan: recommendedPlan,
                    },
                    {
                      key: 'coverage',
                      badge: 'Mejor Cobertura',
                      badgeClassName: 'bg-[#0f514b]/80 text-white',
                      cardClassName: 'bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative',
                      buttonClassName: 'w-full py-3 rounded-xl font-bold text-sm border-2 border-[#14dcb4] text-[#0f514b] hover:bg-[#14dcb4]/10 transition-all',
                      buttonLabel: 'Ver detalle',
                      plan: bestCoveragePlan ?? recommendedPlan,
                    },
                  ].map((card) => {
                    if (!card.plan) {
                      return null;
                    }

                    return (
                      <div key={card.key} className={card.cardClassName}>
                        <span className={`absolute -top-3 left-4 text-xs font-bold px-3 py-1 rounded-full ${card.badgeClassName}`}>
                          {card.badge}
                        </span>
                        <div className="pt-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase mb-1">{card.plan.isapre_name}</p>
                          <h4 className="font-bold text-[#0f514b] mb-3">{card.plan.name}</h4>
                          <div className="text-3xl font-extrabold text-[#0f514b] mb-4">
                            {card.plan.price_uf.toFixed(1)} <span className="text-base font-medium text-slate-400">UF/mes</span>
                          </div>
                          <div className="space-y-2 text-sm text-slate-600 mb-6">
                            <div className="flex justify-between"><span>Ambulatoria</span><span className="font-semibold">{card.plan.ambulatory_coverage}%</span></div>
                            <div className="flex justify-between"><span>Hospitalaria</span><span className="font-semibold">{card.plan.hospital_coverage}%</span></div>
                            <div className="flex justify-between"><span>Match</span><span className="font-semibold">{card.plan.match_score.toFixed(1)} pts</span></div>
                          </div>
                          <button className={card.buttonClassName}>
                            {card.buttonLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
                  No encontramos resultados para mostrar. Vuelve atras e intenta nuevamente.
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={resetFlow}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#14dcb4] hover:text-[#0f9d8a] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a empezar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
