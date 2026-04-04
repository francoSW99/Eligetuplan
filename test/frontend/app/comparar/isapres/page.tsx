'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown, Star, ArrowRight, SlidersHorizontal } from 'lucide-react';

const isapres = [
  {
    id: 'banmedica',
    name: 'Banmédica',
    logo: '/logos/banmedica-logo.png',
    planes: [
      { id: 1, nombre: 'Plan Óptimo 5000', modalidad: 'Libre Elección', puntaje: 4.5, coberturaAmbulatoria: 80, coberturaHospitalaria: 90, precioUF: 3.2 },
      { id: 2, nombre: 'Plan Máximo Plus', modalidad: 'Preferente', puntaje: 4.8, coberturaAmbulatoria: 90, coberturaHospitalaria: 100, precioUF: 4.5 },
      { id: 3, nombre: 'Plan Esencial 2000', modalidad: 'Cerrado', puntaje: 3.9, coberturaAmbulatoria: 70, coberturaHospitalaria: 80, precioUF: 2.1 },
    ],
  },
  {
    id: 'consalud',
    name: 'Consalud',
    logo: '/logos/logo_consalud.png',
    planes: [
      { id: 4, nombre: 'Más Salud 4000', modalidad: 'Libre Elección', puntaje: 4.2, coberturaAmbulatoria: 75, coberturaHospitalaria: 85, precioUF: 2.8 },
      { id: 5, nombre: 'Preferente Total', modalidad: 'Preferente', puntaje: 4.6, coberturaAmbulatoria: 85, coberturaHospitalaria: 95, precioUF: 3.9 },
      { id: 6, nombre: 'Plan Familiar Plus', modalidad: 'Preferente', puntaje: 4.3, coberturaAmbulatoria: 80, coberturaHospitalaria: 90, precioUF: 3.5 },
    ],
  },
  {
    id: 'cruzblanca',
    name: 'Cruz Blanca',
    logo: '/logos/logo_cruzblanca.png',
    planes: [
      { id: 7, nombre: 'Full Salud 7000', modalidad: 'Libre Elección', puntaje: 4.7, coberturaAmbulatoria: 85, coberturaHospitalaria: 95, precioUF: 3.8 },
      { id: 8, nombre: 'Plan Cerrado Red', modalidad: 'Cerrado', puntaje: 4.0, coberturaAmbulatoria: 70, coberturaHospitalaria: 85, precioUF: 1.9 },
      { id: 9, nombre: 'Preferente Premium', modalidad: 'Preferente', puntaje: 4.9, coberturaAmbulatoria: 95, coberturaHospitalaria: 100, precioUF: 5.2 },
    ],
  },
  {
    id: 'nuevamasvida',
    name: 'Nueva Más Vida',
    logo: '/logos/Logo-NMV.png',
    planes: [
      { id: 10, nombre: 'Vida Plena 3000', modalidad: 'Libre Elección', puntaje: 4.1, coberturaAmbulatoria: 75, coberturaHospitalaria: 80, precioUF: 2.5 },
      { id: 11, nombre: 'Protección Familiar', modalidad: 'Preferente', puntaje: 4.4, coberturaAmbulatoria: 80, coberturaHospitalaria: 90, precioUF: 3.3 },
    ],
  },
  {
    id: 'colmena',
    name: 'Colmena Golden Cross',
    logo: '/logos/logos-col.png',
    planes: [
      { id: 12, nombre: 'Golden Plus 6000', modalidad: 'Libre Elección', puntaje: 4.6, coberturaAmbulatoria: 85, coberturaHospitalaria: 90, precioUF: 3.6 },
      { id: 13, nombre: 'Golden Preferente', modalidad: 'Preferente', puntaje: 4.7, coberturaAmbulatoria: 90, coberturaHospitalaria: 95, precioUF: 4.1 },
      { id: 14, nombre: 'Plan Cerrado Gold', modalidad: 'Cerrado', puntaje: 3.8, coberturaAmbulatoria: 65, coberturaHospitalaria: 80, precioUF: 1.8 },
    ],
  },
  {
    id: 'vidatres',
    name: 'Vida Tres',
    logo: '/logos/vida-tres.png',
    planes: [
      { id: 15, nombre: 'Plan Tres Full', modalidad: 'Libre Elección', puntaje: 4.3, coberturaAmbulatoria: 80, coberturaHospitalaria: 85, precioUF: 3.0 },
      { id: 16, nombre: 'Tres Preferente', modalidad: 'Preferente', puntaje: 4.5, coberturaAmbulatoria: 85, coberturaHospitalaria: 95, precioUF: 3.7 },
    ],
  },
];

const modalidades = ['Todos', 'Libre Elección', 'Preferente', 'Cerrado'] as const;

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${star <= Math.round(score) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
        />
      ))}
      <span className="text-xs font-semibold text-slate-500 ml-1">{score.toFixed(1)}</span>
    </div>
  );
}

export default function CompararIsapres() {
  const [filtroModalidad, setFiltroModalidad] = useState<string>('Todos');
  const [filtroPrecioMax, setFiltroPrecioMax] = useState<number>(10);
  const [expandedIsapre, setExpandedIsapre] = useState<string | null>(null);

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Hero Banner */}
      <section className="bg-[#0f514b] py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Compara Planes de Isapre Online
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white/80 text-lg max-w-2xl mx-auto mb-8"
          >
            Único comparador y cotizador de planes de Isapre online. Encuentra tu mejor opción en EligeTuPlan.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/tu-mejor-plan"
              className="inline-flex items-center gap-2 bg-[#14dcb4] text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-[#12c9a4] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Ir al Comparador <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#0f514b]">
              <SlidersHorizontal className="w-4 h-4" />
              Filtros:
            </div>

            <div className="flex flex-wrap gap-2">
              {modalidades.map((mod) => (
                <button
                  key={mod}
                  onClick={() => setFiltroModalidad(mod)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filtroModalidad === mod
                      ? 'bg-[#0f514b] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Precio máx:</label>
              <span className="text-sm font-bold text-[#0f514b]">{filtroPrecioMax.toFixed(1)} UF</span>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={filtroPrecioMax}
                onChange={(e) => setFiltroPrecioMax(parseFloat(e.target.value))}
                className="w-32 accent-[#14dcb4]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Isapre Listings */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="space-y-6">
          {isapres.map((isapre) => {
            const planesFiltered = isapre.planes.filter((p) => {
              const matchMod = filtroModalidad === 'Todos' || p.modalidad === filtroModalidad;
              const matchPrice = p.precioUF <= filtroPrecioMax;
              return matchMod && matchPrice;
            });

            return (
              <motion.div
                key={isapre.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIsapre(expandedIsapre === isapre.id ? null : isapre.id)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                      <Image src={isapre.logo} alt={isapre.name} width={60} height={40} className="w-auto h-8 object-contain" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold text-[#0f514b]">{isapre.name}</h3>
                      <p className="text-sm text-slate-500">{planesFiltered.length} planes disponibles</p>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${expandedIsapre === isapre.id ? 'rotate-180' : ''}`} />
                </button>

                {(expandedIsapre === isapre.id || expandedIsapre === null) && planesFiltered.length > 0 && (
                  <div className="border-t border-slate-100">
                    <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <div className="col-span-2">Plan</div>
                      <div>Puntaje</div>
                      <div>Ambulatoria</div>
                      <div>Hospitalaria</div>
                      <div className="text-right">Precio</div>
                    </div>

                    {planesFiltered.map((plan) => (
                      <div key={plan.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-6 py-4 border-t border-slate-50 hover:bg-[#14dcb4]/5 transition-colors items-center">
                        <div className="col-span-2">
                          <p className="font-semibold text-slate-800 text-sm">{plan.nombre}</p>
                          <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                            plan.modalidad === 'Libre Elección' ? 'bg-blue-50 text-blue-700'
                              : plan.modalidad === 'Preferente' ? 'bg-green-50 text-green-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}>
                            {plan.modalidad}
                          </span>
                        </div>
                        <div><StarRating score={plan.puntaje} /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-2 max-w-[80px]">
                              <div className="bg-[#14dcb4] h-2 rounded-full" style={{ width: `${plan.coberturaAmbulatoria}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{plan.coberturaAmbulatoria}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-2 max-w-[80px]">
                              <div className="bg-[#0f514b] h-2 rounded-full" style={{ width: `${plan.coberturaHospitalaria}%` }} />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{plan.coberturaHospitalaria}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-3">
                          <span className="text-lg font-bold text-[#0f514b]">{plan.precioUF} UF</span>
                          <button className="bg-[#14dcb4] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#12c9a4] transition-all">
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(expandedIsapre === isapre.id || expandedIsapre === null) && planesFiltered.length === 0 && (
                  <div className="border-t border-slate-100 px-6 py-8 text-center text-slate-400 text-sm">
                    No hay planes que coincidan con los filtros seleccionados.
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-[#0f514b] py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">¿No sabes cuál elegir?</h2>
          <p className="text-white/70 mb-8 text-lg">Déjanos ayudarte. Nuestro comparador inteligente encuentra el plan perfecto para tu perfil.</p>
          <Link href="/tu-mejor-plan" className="inline-flex items-center gap-2 bg-[#14dcb4] text-white font-bold px-10 py-4 rounded-xl text-lg hover:bg-[#12c9a4] transition-all shadow-lg">
            Encontrar Mi Plan Ideal <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
