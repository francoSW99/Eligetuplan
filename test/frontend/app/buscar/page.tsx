'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Search, Star, ArrowRight, X } from 'lucide-react';

const allPlanes = [
  { id: 1, codigo: 'BM-5000', nombre: 'Plan Óptimo 5000', isapre: 'Banmédica', logo: '/logos/banmedica-logo.png', modalidad: 'Libre Elección', puntaje: 4.5, coberturaAmbulatoria: 80, coberturaHospitalaria: 90, precioUF: 3.2, conParto: true },
  { id: 2, codigo: 'BM-PLUS', nombre: 'Plan Máximo Plus', isapre: 'Banmédica', logo: '/logos/banmedica-logo.png', modalidad: 'Preferente', puntaje: 4.8, coberturaAmbulatoria: 90, coberturaHospitalaria: 100, precioUF: 4.5, conParto: true },
  { id: 3, codigo: 'BM-2000', nombre: 'Plan Esencial 2000', isapre: 'Banmédica', logo: '/logos/banmedica-logo.png', modalidad: 'Cerrado', puntaje: 3.9, coberturaAmbulatoria: 70, coberturaHospitalaria: 80, precioUF: 2.1, conParto: false },
  { id: 4, codigo: 'CS-4000', nombre: 'Más Salud 4000', isapre: 'Consalud', logo: '/logos/logo_consalud.png', modalidad: 'Libre Elección', puntaje: 4.2, coberturaAmbulatoria: 75, coberturaHospitalaria: 85, precioUF: 2.8, conParto: true },
  { id: 5, codigo: 'CS-TOTAL', nombre: 'Preferente Total', isapre: 'Consalud', logo: '/logos/logo_consalud.png', modalidad: 'Preferente', puntaje: 4.6, coberturaAmbulatoria: 85, coberturaHospitalaria: 95, precioUF: 3.9, conParto: true },
  { id: 6, codigo: 'CS-FAM', nombre: 'Plan Familiar Plus', isapre: 'Consalud', logo: '/logos/logo_consalud.png', modalidad: 'Preferente', puntaje: 4.3, coberturaAmbulatoria: 80, coberturaHospitalaria: 90, precioUF: 3.5, conParto: true },
  { id: 7, codigo: 'CB-7000', nombre: 'Full Salud 7000', isapre: 'Cruz Blanca', logo: '/logos/logo_cruzblanca.png', modalidad: 'Libre Elección', puntaje: 4.7, coberturaAmbulatoria: 85, coberturaHospitalaria: 95, precioUF: 3.8, conParto: true },
  { id: 8, codigo: 'CB-RED', nombre: 'Plan Cerrado Red', isapre: 'Cruz Blanca', logo: '/logos/logo_cruzblanca.png', modalidad: 'Cerrado', puntaje: 4.0, coberturaAmbulatoria: 70, coberturaHospitalaria: 85, precioUF: 1.9, conParto: false },
  { id: 9, codigo: 'CB-PREM', nombre: 'Preferente Premium', isapre: 'Cruz Blanca', logo: '/logos/logo_cruzblanca.png', modalidad: 'Preferente', puntaje: 4.9, coberturaAmbulatoria: 95, coberturaHospitalaria: 100, precioUF: 5.2, conParto: true },
  { id: 10, codigo: 'NMV-3000', nombre: 'Vida Plena 3000', isapre: 'Nueva Más Vida', logo: '/logos/Logo-NMV.png', modalidad: 'Libre Elección', puntaje: 4.1, coberturaAmbulatoria: 75, coberturaHospitalaria: 80, precioUF: 2.5, conParto: false },
  { id: 11, codigo: 'NMV-FAM', nombre: 'Protección Familiar', isapre: 'Nueva Más Vida', logo: '/logos/Logo-NMV.png', modalidad: 'Preferente', puntaje: 4.4, coberturaAmbulatoria: 80, coberturaHospitalaria: 90, precioUF: 3.3, conParto: true },
  { id: 12, codigo: 'COL-6000', nombre: 'Golden Plus 6000', isapre: 'Colmena', logo: '/logos/logos-col.png', modalidad: 'Libre Elección', puntaje: 4.6, coberturaAmbulatoria: 85, coberturaHospitalaria: 90, precioUF: 3.6, conParto: true },
  { id: 13, codigo: 'COL-PREF', nombre: 'Golden Preferente', isapre: 'Colmena', logo: '/logos/logos-col.png', modalidad: 'Preferente', puntaje: 4.7, coberturaAmbulatoria: 90, coberturaHospitalaria: 95, precioUF: 4.1, conParto: true },
  { id: 14, codigo: 'COL-CER', nombre: 'Plan Cerrado Gold', isapre: 'Colmena', logo: '/logos/logos-col.png', modalidad: 'Cerrado', puntaje: 3.8, coberturaAmbulatoria: 65, coberturaHospitalaria: 80, precioUF: 1.8, conParto: false },
  { id: 15, codigo: 'VT-FULL', nombre: 'Plan Tres Full', isapre: 'Vida Tres', logo: '/logos/vida-tres.png', modalidad: 'Libre Elección', puntaje: 4.3, coberturaAmbulatoria: 80, coberturaHospitalaria: 85, precioUF: 3.0, conParto: true },
  { id: 16, codigo: 'VT-PREF', nombre: 'Tres Preferente', isapre: 'Vida Tres', logo: '/logos/vida-tres.png', modalidad: 'Preferente', puntaje: 4.5, coberturaAmbulatoria: 85, coberturaHospitalaria: 95, precioUF: 3.7, conParto: true },
];

function StarRating({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(score) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
      ))}
      <span className="text-xs font-semibold text-slate-500 ml-1">{score.toFixed(1)}</span>
    </div>
  );
}

export default function BuscarPage() {
  const [query, setQuery] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState<string>('Todos');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return allPlanes.filter((p) => {
      const matchQuery = p.nombre.toLowerCase().includes(q) || p.codigo.toLowerCase().includes(q) || p.isapre.toLowerCase().includes(q);
      const matchMod = filtroModalidad === 'Todos' || p.modalidad === filtroModalidad;
      return matchQuery && matchMod;
    });
  }, [query, filtroModalidad]);

  const hasQuery = query.trim().length > 0;

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      {/* Search Header */}
      <section className="bg-[#0f514b] px-6 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Buscador de Planes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/70 mb-8"
          >
            Escribe el código o nombre del plan y te mostraremos la información registrada.
          </motion.p>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, código o Isapre..."
              autoFocus
              className="w-full pl-12 pr-12 py-4 rounded-2xl text-base border-2 border-transparent focus:border-[#14dcb4] focus:outline-none shadow-lg transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Empty State */}
        {!hasQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-[#14dcb4]/10 flex items-center justify-center mx-auto mb-6">
              <Search className="w-9 h-9 text-[#14dcb4]" />
            </div>
            <h3 className="text-xl font-bold text-[#0f514b] mb-2">Busca tu plan de Isapre</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Tenemos más de 500 planes registrados, incluyendo el tuyo. Busca por código o por nombre.
            </p>
            <div className="border-t border-slate-200 pt-8 mt-8">
              <h4 className="text-lg font-bold text-[#0f514b] mb-2">¿Buscas tu mejor plan de Isapre?</h4>
              <p className="text-slate-500 mb-4">Usa nuestro comparador online para encontrar tu mejor opción.</p>
              <Link href="/comparar/isapres" className="inline-flex items-center gap-2 text-[#14dcb4] font-bold hover:underline">
                Comparar Planes Isapres <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Results */}
        {hasQuery && (
          <>
            {/* Filters + Count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h5 className="text-sm font-semibold text-slate-600">
                <span className="bg-[#0f514b] text-white text-xs font-bold px-2.5 py-1 rounded-md mr-2">{results.length}</span>
                resultados encontrados
              </h5>
              <div className="flex gap-2">
                {['Todos', 'Libre Elección', 'Preferente', 'Cerrado'].map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setFiltroModalidad(mod)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      filtroModalidad === mod ? 'bg-[#0f514b] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Cards */}
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Logo + Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 flex-shrink-0">
                          <Image src={plan.logo} alt={plan.isapre} width={50} height={30} className="w-auto h-7 object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-[#0f514b] text-sm">{plan.nombre}</h4>
                            <span className="text-xs text-slate-400 font-mono">{plan.codigo}</span>
                          </div>
                          <p className="text-xs text-slate-500">{plan.isapre}</p>
                          <div className="mt-1"><StarRating score={plan.puntaje} /></div>
                        </div>
                      </div>

                      {/* Coverage details */}
                      <div className="flex items-center gap-6 text-center">
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Amb.</p>
                          <p className="text-sm font-bold text-slate-700">{plan.coberturaAmbulatoria}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-semibold">Hosp.</p>
                          <p className="text-sm font-bold text-slate-700">{plan.coberturaHospitalaria}%</p>
                        </div>
                        <div>
                          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${
                            plan.modalidad === 'Libre Elección' ? 'bg-blue-50 text-blue-700'
                              : plan.modalidad === 'Preferente' ? 'bg-green-50 text-green-700'
                              : 'bg-orange-50 text-orange-700'
                          }`}>
                            {plan.modalidad}
                          </span>
                        </div>
                        <div>
                          <span className={`text-xs font-medium ${plan.conParto ? 'text-green-600' : 'text-slate-400'}`}>
                            {plan.conParto ? 'Con parto' : 'Sin parto'}
                          </span>
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center gap-4 md:ml-4">
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-[#0f514b]">{plan.precioUF} UF</p>
                          <p className="text-xs text-slate-400">/mes</p>
                        </div>
                        <button className="bg-[#14dcb4] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-[#12c9a4] transition-all flex-shrink-0">
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-slate-400 text-lg mb-4">No se encontraron planes para &ldquo;{query}&rdquo;</p>
                <Link href="/tu-mejor-plan" className="inline-flex items-center gap-2 text-[#14dcb4] font-bold hover:underline">
                  Probar el comparador inteligente <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
