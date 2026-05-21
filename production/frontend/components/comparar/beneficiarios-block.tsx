'use client';

import { useState } from 'react';
import { UserPlus, Trash2, Users } from 'lucide-react';
import {
  type Beneficiario,
  type TipoBeneficiario,
  getFactor,
  getTotalFactor,
} from '@/lib/factores';

interface Props {
  beneficiarios: Beneficiario[];
  onAdd: (b: Omit<Beneficiario, 'id'>) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function BeneficiariosBlock({ beneficiarios, onAdd, onRemove, onClear }: Props) {
  const [edadStr, setEdadStr] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F'>('M');
  const [error, setError] = useState<string | null>(null);

  const totalFactor = getTotalFactor(beneficiarios);

  function handleAdd(tipo: TipoBeneficiario) {
    const edad = parseInt(edadStr, 10);
    if (!Number.isFinite(edad) || edad < 0 || edad > 110) {
      setError('Ingresa una edad válida (0-110)');
      return;
    }
    setError(null);
    onAdd({ edad, tipo, sexo });
    setEdadStr('');
  }

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-[#5a6b6a] leading-relaxed">
        Agrega cotizantes y cargas. El precio de los planes se ajusta según el{' '}
        <strong className="text-[#0f514b] font-bold">factor de riesgo</strong> total.
      </p>

      {/* Input edad + sexo + botones */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-3 space-y-2.5">
        <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1 block">
              Edad
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={edadStr}
              onChange={(e) => {
                setEdadStr(e.target.value.replace(/\D/g, '').slice(0, 3));
                if (error) setError(null);
              }}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-[#14dcb4] focus:outline-none focus:ring-2 focus:ring-[#14dcb4]/15 text-[15px] font-bold text-[#0f514b] placeholder:text-slate-300 tabular-nums"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1 block">
              Sexo
            </label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setSexo('M')}
                className={`px-3 py-2 text-[12px] font-bold transition-colors ${
                  sexo === 'M' ? 'bg-[#0f514b] text-white' : 'bg-white text-[#5a6b6a] hover:bg-slate-50'
                }`}
              >
                M
              </button>
              <button
                type="button"
                onClick={() => setSexo('F')}
                className={`px-3 py-2 text-[12px] font-bold transition-colors border-l border-slate-200 ${
                  sexo === 'F' ? 'bg-[#0f514b] text-white' : 'bg-white text-[#5a6b6a] hover:bg-slate-50'
                }`}
              >
                F
              </button>
            </div>
          </div>
        </div>

        {error && <div className="text-[11px] text-red-600 font-semibold">{error}</div>}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleAdd('cotizante')}
            disabled={!edadStr}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#0f514b]/8 hover:bg-[#0f514b]/15 text-[#0f514b] text-[12px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Cotizante
          </button>
          <button
            type="button"
            onClick={() => handleAdd('carga')}
            disabled={!edadStr}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#14dcb4]/15 hover:bg-[#14dcb4]/25 text-[#0f9d8a] text-[12px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Carga
          </button>
        </div>
      </div>

      {/* Lista de beneficiarios */}
      {beneficiarios.length > 0 && (
        <ul className="space-y-1.5">
          {beneficiarios.map((b) => {
            const factor = getFactor(b.edad, b.tipo);
            const isCot = b.tipo === 'cotizante';
            return (
              <li
                key={b.id}
                className="flex items-center gap-2 rounded-lg bg-white border border-[#0f514b]/10 px-2.5 py-1.5"
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold tabular-nums ${
                    isCot ? 'bg-[#0f514b] text-white' : 'bg-[#14dcb4] text-[#0f514b]'
                  }`}
                >
                  {b.edad}
                </span>
                <span
                  className={`shrink-0 text-[9.5px] font-extrabold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ${
                    isCot ? 'bg-[#0f514b]/10 text-[#0f514b]' : 'bg-[#14dcb4]/20 text-[#0f9d8a]'
                  }`}
                >
                  {isCot ? 'COT' : 'CRG'}
                </span>
                {b.sexo && (
                  <span className="shrink-0 text-[10px] font-bold text-[#5a6b6a] tabular-nums">
                    {b.sexo}
                  </span>
                )}
                <span className="flex-1 text-right text-[12.5px] font-extrabold text-[#0f514b] tabular-nums">
                  {factor.toFixed(1)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(b.id)}
                  aria-label="Quitar beneficiario"
                  className="shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-[#5a6b6a] hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* Total factor + clear */}
      {beneficiarios.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-[#0f514b] to-[#092e2a] p-3 text-white relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-[#14dcb4]/15 blur-2xl pointer-events-none" />
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <div className="text-[9.5px] font-bold tracking-[0.18em] uppercase text-[#14dcb4]/85 mb-0.5">
                Total factores
              </div>
              <div className="text-[22px] font-extrabold tabular-nums leading-none">
                {totalFactor.toFixed(2)}
              </div>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="text-[10.5px] font-semibold text-white/70 hover:text-white underline-offset-2 hover:underline"
            >
              Quitar todos
            </button>
          </div>
          <div className="relative mt-2 text-[10.5px] text-white/65 flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Precios actualizados según tu grupo
          </div>
        </div>
      )}
    </div>
  );
}
