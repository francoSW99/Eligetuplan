'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { type Beneficiario, getFactor } from '@/lib/factores';

interface Props {
  cotizanteAge: number | null;
  cargas: Beneficiario[];
  totalFactor: number;
  onSetCotizanteAge: (edad: number | null) => void;
  onAddCarga: (edad: number) => void;
  onRemoveCarga: (id: string) => void;
  onClear: () => void;
}

export default function BeneficiariosBlock({
  cotizanteAge,
  cargas,
  totalFactor,
  onSetCotizanteAge,
  onAddCarga,
  onRemoveCarga,
  onClear,
}: Props) {
  // Input de "Tu edad" — controlado localmente, commit explícito vía botón o Enter
  const [ageInput, setAgeInput] = useState(cotizanteAge != null ? String(cotizanteAge) : '');
  const [ageError, setAgeError] = useState<string | null>(null);

  // Input para nuevas cargas
  const [cargaInput, setCargaInput] = useState('');
  const [cargaError, setCargaError] = useState<string | null>(null);

  // Sync cuando la edad cambia desde fuera (URL, limpiar todos los filtros, etc.)
  useEffect(() => {
    setAgeInput(cotizanteAge != null ? String(cotizanteAge) : '');
  }, [cotizanteAge]);

  function commitCotizanteAge() {
    const raw = ageInput.trim();
    if (!raw) {
      if (cotizanteAge != null) onSetCotizanteAge(null);
      setAgeError(null);
      return;
    }
    const edad = parseInt(raw, 10);
    if (!Number.isFinite(edad) || edad < 0 || edad > 110) {
      setAgeError('Edad inválida (0-110)');
      return;
    }
    setAgeError(null);
    if (edad !== cotizanteAge) onSetCotizanteAge(edad);
  }

  function handleAddCarga() {
    const edad = parseInt(cargaInput, 10);
    if (!Number.isFinite(edad) || edad < 0 || edad > 110) {
      setCargaError('Edad inválida (0-110)');
      return;
    }
    setCargaError(null);
    onAddCarga(edad);
    setCargaInput('');
  }

  const hasCotizante = cotizanteAge != null;
  const cotizanteFactor = hasCotizante ? getFactor(cotizanteAge!, 'cotizante') : 0;
  // Detecta si el input difiere del valor ya aplicado en URL
  const appliedStr = cotizanteAge != null ? String(cotizanteAge) : '';
  const ageHasPendingChange = ageInput.trim() !== appliedStr;

  return (
    <div className="space-y-3">
      <p className="text-[12.5px] text-[#5a6b6a] leading-relaxed">
        Tu edad determina tu factor como cotizante. Si tienes cargas (hijos, cónyuge, etc.) agrégalas para ajustar el precio.
      </p>

      {/* Tu edad (cotizante) */}
      <div>
        <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1.5 block">
          Tu edad
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-1.5">
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={ageInput}
              onChange={(e) => {
                setAgeInput(e.target.value.replace(/\D/g, '').slice(0, 3));
                if (ageError) setAgeError(null);
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitCotizanteAge(); } }}
              placeholder="34"
              className={`w-full px-3.5 py-2.5 pr-16 rounded-xl border-2 focus:outline-none focus:ring-4 text-[15px] font-bold text-[#0f514b] placeholder:text-slate-300 transition-all ${
                ageError ? 'border-red-300 focus:border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-[#14dcb4] focus:ring-[#14dcb4]/15'
              }`}
            />
            {hasCotizante && cotizanteFactor > 0 && !ageHasPendingChange && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0f9d8a] tabular-nums bg-[#14dcb4]/15 px-1.5 py-0.5 rounded">
                F {cotizanteFactor.toFixed(2)}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={commitCotizanteAge}
            disabled={!ageHasPendingChange}
            title={ageHasPendingChange ? 'Aplicar tu edad' : 'Edad aplicada'}
            className={`inline-flex items-center justify-center gap-1 px-3.5 rounded-xl text-[12px] font-bold uppercase tracking-[0.06em] transition-all ${
              ageHasPendingChange
                ? 'bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] shadow-[0_6px_14px_rgba(20,220,180,0.35)] hover:-translate-y-px'
                : 'bg-[#0f514b]/8 text-[#0f514b]/45 cursor-default'
            }`}
          >
            {ageHasPendingChange ? (
              <>
                Filtrar
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Listo
              </>
            )}
          </button>
        </div>
        {ageError && <div className="mt-1 text-[11px] text-red-600 font-semibold">{ageError}</div>}
        {!ageError && ageHasPendingChange && ageInput.trim() !== '' && (
          <div className="mt-1 text-[10.5px] text-[#0f9d8a] font-semibold">
            Presiona Enter o el botón Filtrar para aplicar
          </div>
        )}
      </div>

      {/* Tus cargas */}
      <div className={!hasCotizante ? 'opacity-50 pointer-events-none' : ''}>
        <label className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#5a6b6a] mb-1.5 block">
          Tus cargas{' '}
          <span className="font-medium tracking-normal normal-case text-slate-400">
            {!hasCotizante ? '— ingresa tu edad primero' : '(opcional)'}
          </span>
        </label>
        <div className="grid grid-cols-[1fr_auto] gap-1.5">
          <input
            type="text"
            inputMode="numeric"
            value={cargaInput}
            onChange={(e) => {
              setCargaInput(e.target.value.replace(/\D/g, '').slice(0, 3));
              if (cargaError) setCargaError(null);
            }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCarga(); } }}
            placeholder="Edad de la carga"
            disabled={!hasCotizante}
            className={`w-full px-3 py-2 rounded-lg border text-[13px] font-bold text-[#0f514b] tabular-nums placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${
              cargaError ? 'border-red-300 focus:border-red-400 focus:ring-red-200/50' : 'border-slate-200 focus:border-[#14dcb4] focus:ring-[#14dcb4]/15'
            }`}
          />
          <button
            type="button"
            onClick={handleAddCarga}
            disabled={!cargaInput || !hasCotizante}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#14dcb4]/15 hover:bg-[#14dcb4]/25 text-[#0f9d8a] text-[12px] font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Carga
          </button>
        </div>
        {cargaError && <div className="mt-1 text-[11px] text-red-600 font-semibold">{cargaError}</div>}
      </div>

      {/* Lista de cargas */}
      {cargas.length > 0 && (
        <ul className="space-y-1.5">
          {cargas.map((c) => {
            const f = getFactor(c.edad, 'carga');
            return (
              <li key={c.id} className="flex items-center gap-2 rounded-lg bg-white border border-[#0f514b]/10 px-2.5 py-1.5">
                <span className="shrink-0 w-7 h-7 rounded-full bg-[#14dcb4] text-[#0f514b] flex items-center justify-center text-[11px] font-extrabold tabular-nums">
                  {c.edad}
                </span>
                <span className="shrink-0 text-[9.5px] font-extrabold uppercase tracking-[0.1em] bg-[#14dcb4]/20 text-[#0f9d8a] px-1.5 py-0.5 rounded">
                  CRG
                </span>
                <span className="flex-1 text-right text-[12.5px] font-extrabold text-[#0f514b] tabular-nums">{f.toFixed(1)}</span>
                <button
                  type="button"
                  onClick={() => onRemoveCarga(c.id)}
                  aria-label="Quitar carga"
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
      {totalFactor > 0 && (
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
          <div className="relative mt-1.5 text-[10.5px] text-white/65">
            {1 + cargas.length} {1 + cargas.length === 1 ? 'persona' : 'personas'} · Precios actualizados
          </div>
        </div>
      )}
    </div>
  );
}
