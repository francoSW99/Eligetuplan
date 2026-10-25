'use client';

import { useState } from 'react';
import { Check, Plus, UserRound, X } from 'lucide-react';
import { type Beneficiario, EDAD_PERFIL_POR_DEFECTO } from '@/lib/factores';

// "Calcula tu precio": franja DELGADA que avisa que los precios son de ejemplo
// (1 persona de 30 años) y deja calcular el propio con un solo dato (la edad).
// A propósito es discreta: no debe quitarle protagonismo a los filtros ni a los planes.

const EDAD_MIN_TITULAR = 18;
const EDAD_MAX = 110;

function resumenPersonas(beneficiarios: Beneficiario[]): string {
  const titular = beneficiarios.find((b) => b.tipo === 'cotizante');
  const otros = beneficiarios.filter((b) => b !== titular);
  const yo = titular ? `ti (${titular.edad} años)` : 'ti';
  if (otros.length === 0) return yo;
  const edades = otros.map((b) => b.edad);
  const listaEdades =
    edades.length === 1
      ? `${edades[0]} años`
      : `${edades.slice(0, -1).join(', ')} y ${edades[edades.length - 1]} años`;
  return `${yo} y ${otros.length} ${otros.length === 1 ? 'persona más' : 'personas más'} (${listaEdades})`;
}

export default function CalculaTuPrecio({
  beneficiarios,
  perfilPorDefecto,
  onApply,
  onClear,
  variant = 'banner',
  inputId,
}: {
  /** Beneficiarios ingresados por el usuario (vacío si aún no ingresa nada). */
  beneficiarios: Beneficiario[];
  perfilPorDefecto: boolean;
  onApply: (edadTitular: number, edadesCargas: number[]) => void;
  /** Volver a los precios de ejemplo. */
  onClear?: () => void;
  /** banner: sobre la lista de planes · modal: dentro de la ficha "Ver detalle". */
  variant?: 'banner' | 'modal';
  inputId: string;
}) {
  const titular = beneficiarios.find((b) => b.tipo === 'cotizante');
  const cargasActuales = beneficiarios.filter((b) => b.tipo === 'carga').map((b) => b.edad);

  const [editando, setEditando] = useState(false);
  const [edad, setEdad] = useState(titular ? String(titular.edad) : '');
  const [cargas, setCargas] = useState<number[]>(cargasActuales);
  const [mostrarCargas, setMostrarCargas] = useState(cargasActuales.length > 0);
  const [cargaInput, setCargaInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const mostrarFormulario = perfilPorDefecto || editando;
  const cargasId = `${inputId}-carga`;

  function abrirEdicion() {
    setEdad(titular ? String(titular.edad) : '');
    setCargas(cargasActuales);
    setMostrarCargas(cargasActuales.length > 0);
    setError(null);
    setEditando(true);
    setTimeout(() => document.getElementById(inputId)?.focus(), 50);
  }

  function agregarCarga() {
    const v = parseInt(cargaInput, 10);
    if (!Number.isFinite(v) || v < 0 || v > EDAD_MAX) {
      setErrorCarga(`Escribe una edad entre 0 y ${EDAD_MAX}`);
      return;
    }
    setErrorCarga(null);
    setCargas((c) => [...c, v]);
    setCargaInput('');
  }

  function aplicar(e: React.FormEvent) {
    e.preventDefault();
    const v = parseInt(edad, 10);
    if (!Number.isFinite(v) || v < EDAD_MIN_TITULAR || v > EDAD_MAX) {
      setError(`Escribe tu edad (entre ${EDAD_MIN_TITULAR} y ${EDAD_MAX} años)`);
      document.getElementById(inputId)?.focus();
      return;
    }
    // Si escribió la edad de una carga y no apretó "Agregar", la sumamos igual.
    const pendiente = parseInt(cargaInput, 10);
    const todas =
      mostrarCargas && Number.isFinite(pendiente) && pendiente >= 0 && pendiente <= EDAD_MAX
        ? [...cargas, pendiente]
        : cargas;
    setError(null);
    setCargaInput('');
    setEditando(false);
    onApply(v, todas);
  }

  // ── Ya calculado: franja con "Cambiar" (solo sobre la lista) ─────────────
  if (!mostrarFormulario) {
    if (variant === 'modal') return null;
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-[#14dcb4]/40 bg-[#14dcb4]/10 px-4 py-2.5">
        <span className="shrink-0 w-7 h-7 rounded-full bg-[#14dcb4] text-[#0f514b] grid place-items-center">
          <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden />
        </span>
        <p className="flex-1 min-w-[200px] text-[13px] text-[#0f514b] leading-snug">
          Precios calculados para <strong>{resumenPersonas(beneficiarios)}</strong>.
        </p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={abrirEdicion}
            className="pressable px-3 py-1.5 rounded-lg bg-[#0f514b] text-white text-[12px] font-bold hover:bg-[#0c403b]"
          >
            Cambiar
          </button>
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="pressable px-2 py-1.5 rounded-lg text-[12px] font-semibold text-[#0f514b]/70 hover:text-[#0f514b] hover:bg-[#0f514b]/5"
            >
              Ver precio de ejemplo
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Formulario compacto: una línea en escritorio ─────────────────────────
  const editandoPerfil = editando && !perfilPorDefecto;

  return (
    <section
      aria-label="Calcula tu precio"
      className="rounded-2xl border border-[#14dcb4]/40 bg-[#14dcb4]/10 px-4 py-3"
    >
      <form onSubmit={aplicar} noValidate className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
          <p className="basis-full xl:basis-auto xl:flex-1 min-w-0 flex items-center gap-2.5 text-[13px] sm:text-[13.5px] leading-snug text-[#0f514b]">
            <span className="shrink-0 w-7 h-7 rounded-full bg-[#0f514b] text-white grid place-items-center">
              <UserRound className="w-3.5 h-3.5" aria-hidden />
            </span>
            {editandoPerfil ? (
              <span>
                <strong>¿Para quién calculamos el precio?</strong>
              </span>
            ) : (
              <span>
                <strong>Precios de ejemplo</strong> para 1 persona de {EDAD_PERFIL_POR_DEFECTO} años.{' '}
                <span className="text-[#5a6b6a]">¿Cuánto pagarías tú?</span>
              </span>
            )}
          </p>

          <div className="flex items-center gap-2 basis-full sm:basis-auto">
            <label htmlFor={inputId} className="sr-only">
              Tu edad
            </label>
            <input
              id={inputId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={edad}
              onChange={(e) => {
                setEdad(e.target.value.replace(/\D/g, '').slice(0, 3));
                if (error) setError(null);
              }}
              placeholder="Tu edad"
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              // w-0 + flex-1: en celular ocupa el espacio que queda sin imponer su ancho
              // por defecto (~230px), que ensanchaba la página más allá de la pantalla.
              className="h-10 w-0 flex-1 sm:flex-none sm:w-[104px] min-w-0 px-3 rounded-xl bg-white border border-[#0f514b]/15 text-[15px] font-bold text-[#0f514b] placeholder:text-slate-400 placeholder:font-semibold focus:outline-none focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/25 transition-[border-color,box-shadow] duration-150"
            />
            <button
              type="submit"
              className="pressable h-10 shrink-0 px-4 rounded-xl bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] text-[13px] font-extrabold whitespace-nowrap shadow-[0_6px_14px_rgba(20,220,180,0.3)] hover:-translate-y-px"
            >
              Ver mi precio
            </button>
          </div>

          {!mostrarCargas && (
            <button
              type="button"
              onClick={() => {
                setMostrarCargas(true);
                setTimeout(() => document.getElementById(cargasId)?.focus(), 50);
              }}
              className="pressable inline-flex items-center gap-1 text-[12.5px] font-bold text-[#0f9d8a] hover:text-[#0f514b] underline underline-offset-2 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden /> Pareja o hijos
            </button>
          )}
          {editandoPerfil && (
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="pressable text-[12.5px] font-semibold text-[#5a6b6a] hover:text-[#0f514b]"
            >
              Cancelar
            </button>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-[12px] font-semibold text-red-700">
            {error}
          </p>
        )}

        {mostrarCargas && (
          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <label htmlFor={cargasId} className="text-[12.5px] font-bold text-[#0f514b]">
              Edad de tu pareja o hijo:
            </label>
            <input
              id={cargasId}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={cargaInput}
              onChange={(e) => {
                setCargaInput(e.target.value.replace(/\D/g, '').slice(0, 3));
                if (errorCarga) setErrorCarga(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  agregarCarga();
                }
              }}
              placeholder="Ej: 8"
              className="h-9 w-20 px-2.5 rounded-lg bg-white border border-[#0f514b]/15 text-[14px] font-bold text-[#0f514b] placeholder:text-slate-400 placeholder:font-semibold focus:outline-none focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/25"
            />
            <button
              type="button"
              onClick={agregarCarga}
              className="pressable h-9 px-3 rounded-lg bg-[#0f514b] text-white text-[12.5px] font-bold inline-flex items-center gap-1 hover:bg-[#0c403b]"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden /> Agregar
            </button>
            {cargas.map((c, i) => (
              <button
                key={`${c}-${i}`}
                type="button"
                onClick={() => setCargas((arr) => arr.filter((_, j) => j !== i))}
                aria-label={`Quitar persona de ${c} años`}
                className="pressable inline-flex items-center gap-1 rounded-full bg-white border border-[#14dcb4]/50 px-2.5 py-1 text-[12px] font-bold text-[#0f514b] hover:bg-[#14dcb4]/15"
              >
                {c} años <X className="w-3 h-3" aria-hidden />
              </button>
            ))}
            {errorCarga && (
              <p role="alert" className="basis-full text-[12px] font-semibold text-red-700">
                {errorCarga}
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );
}
