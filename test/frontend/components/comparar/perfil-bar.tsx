'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MapPin, Pencil, Plus, UserRound, X } from 'lucide-react';
import { formatCLP } from '@/lib/api';
import { type Beneficiario, EDAD_PERFIL_POR_DEFECTO } from '@/lib/factores';
import type { SueldoPerfil } from '@/lib/comparar-query';
import { buscarCiudades } from '@/lib/zonas-ciudades';
import { CONTENEDOR_MOTION, FONDO_MOTION, useHojaMotion } from '@/lib/motion';

// Barra "Tu perfil": arriba y siempre visible (fija bajo el header). Reemplaza al
// pop-up de inicio en el comparador. Pide lo mínimo para calcular el precio REAL:
// dónde vives (filtra la zona), tu edad, pareja o hijos, y el sueldo (para el 7%).
// Compacta a propósito: no debe competir con los filtros ni con los planes.

/** Evento para abrir/enfocar la barra desde otros lados ("Calcular el mío" en las tarjetas). */
export const ABRIR_PERFIL_EVENT = 'etp:abrir-perfil';

const EDAD_MIN = 18;
const EDAD_MAX = 110;

export interface PerfilAplicado {
  edad: number | null;
  cargas: number[];
  sueldo: { tipo: 'liquido' | 'bruto'; monto: number } | null;
  /** undefined = no tocar la zona · null = quitar la ciudad elegida · objeto = elegir ciudad. */
  ciudad: { nombre: string; zonaId: number } | null | undefined;
}

function digitos(v: string, max = 9) {
  return v.replace(/\D/g, '').slice(0, max);
}

function formatoMiles(v: string) {
  return v ? parseInt(v, 10).toLocaleString('es-CL') : '';
}

export default function PerfilBar({
  beneficiarios,
  perfilPorDefecto,
  sueldo,
  ciudad,
  zonaNombre,
  budgetCLP,
  onApply,
  onClear,
}: {
  beneficiarios: Beneficiario[];
  perfilPorDefecto: boolean;
  sueldo: SueldoPerfil | null;
  /** Ciudad elegida en la barra (si la hay) y nombre de su zona. */
  ciudad: string | null;
  zonaNombre: string | null;
  budgetCLP: number | null;
  onApply: (p: PerfilAplicado) => void;
  onClear: () => void;
}) {
  const titular = beneficiarios.find((b) => b.tipo === 'cotizante');
  const cargasActuales = beneficiarios.filter((b) => b.tipo === 'carga').map((b) => b.edad);

  const [edad, setEdad] = useState(titular ? String(titular.edad) : '');
  const [cargas, setCargas] = useState<number[]>(cargasActuales);
  const [cargaInput, setCargaInput] = useState('');
  const [sueldoInput, setSueldoInput] = useState(sueldo ? String(sueldo.monto) : '');
  const [sueldoTipo, setSueldoTipo] = useState<'liquido' | 'bruto'>(sueldo?.tipo ?? 'liquido');
  const [ciudadTexto, setCiudadTexto] = useState(ciudad ?? '');
  const [ciudadSel, setCiudadSel] = useState<{ nombre: string; zonaId: number } | null>(null);
  const [verSugerencias, setVerSugerencias] = useState(false);
  const [verCargas, setVerCargas] = useState(false);
  const [hojaAbierta, setHojaAbierta] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hojaMotion = useHojaMotion('abajo');
  const cargasRef = useRef<HTMLDivElement>(null);
  const ciudadRef = useRef<HTMLDivElement>(null);
  const sugerencias = useMemo(
    () => (verSugerencias && ciudadTexto.trim() && ciudadTexto !== ciudad ? buscarCiudades(ciudadTexto, 6) : []),
    [verSugerencias, ciudadTexto, ciudad],
  );

  // "Calcular el mío" (tarjetas) → enfocar "Tu edad" (escritorio) o abrir la hoja (celular).
  useEffect(() => {
    function abrir() {
      if (window.matchMedia('(min-width: 1024px)').matches) {
        document.getElementById('perfil-edad-top')?.focus();
      } else {
        setHojaAbierta(true);
        setTimeout(() => document.getElementById('perfil-edad-hoja')?.focus(), 80);
      }
    }
    window.addEventListener(ABRIR_PERFIL_EVENT, abrir);
    return () => window.removeEventListener(ABRIR_PERFIL_EVENT, abrir);
  }, []);

  // Cerrar popovers al hacer clic fuera.
  useEffect(() => {
    if (!verCargas && !verSugerencias) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (verCargas && cargasRef.current && !cargasRef.current.contains(t)) setVerCargas(false);
      if (verSugerencias && ciudadRef.current && !ciudadRef.current.contains(t)) setVerSugerencias(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [verCargas, verSugerencias]);

  useEffect(() => {
    if (!hojaAbierta) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hojaAbierta]);

  function agregarCarga() {
    const v = parseInt(cargaInput, 10);
    if (!Number.isFinite(v) || v < 0 || v > EDAD_MAX) {
      setError(`La edad de tu pareja o hijo debe estar entre 0 y ${EDAD_MAX}`);
      return;
    }
    setError(null);
    setCargas((c) => [...c, v]);
    setCargaInput('');
  }

  function elegirCiudad(nombre: string, zonaId: number) {
    setCiudadSel({ nombre, zonaId });
    setCiudadTexto(nombre);
    setVerSugerencias(false);
  }

  function aplicar(e?: React.FormEvent) {
    e?.preventDefault();
    const edadNum = edad ? parseInt(edad, 10) : null;
    // Edad de una carga escrita sin apretar "Agregar": la sumamos igual.
    const pendiente = cargaInput ? parseInt(cargaInput, 10) : NaN;
    const todasCargas =
      Number.isFinite(pendiente) && pendiente >= 0 && pendiente <= EDAD_MAX ? [...cargas, pendiente] : cargas;

    if (edadNum != null && (edadNum < EDAD_MIN || edadNum > EDAD_MAX)) {
      setError(`Escribe tu edad entre ${EDAD_MIN} y ${EDAD_MAX} años`);
      return;
    }
    if (edadNum == null && todasCargas.length > 0) {
      setError('Escribe tu edad para sumar a tu pareja o hijos');
      return;
    }

    // Ciudad: elegida de la lista, o la única coincidencia de lo que escribió.
    let ciudadNueva: PerfilAplicado['ciudad'] = undefined;
    if (ciudadSel) ciudadNueva = ciudadSel;
    else if (!ciudadTexto.trim() && ciudad) ciudadNueva = null;
    else if (ciudadTexto.trim() && ciudadTexto !== ciudad) {
      const m = buscarCiudades(ciudadTexto, 2);
      if (m.length === 1) ciudadNueva = { nombre: m[0].ciudad, zonaId: m[0].zonaId };
    }

    const monto = sueldoInput ? parseInt(sueldoInput, 10) : 0;
    setError(null);
    setCargaInput('');
    setVerCargas(false);
    setHojaAbierta(false);
    onApply({
      edad: edadNum,
      cargas: edadNum == null ? [] : todasCargas,
      sueldo: monto > 0 ? { tipo: sueldoTipo, monto } : null,
      ciudad: ciudadNueva,
    });
  }

  const hayPerfil = !perfilPorDefecto || !!sueldo || !!ciudad;
  const textoCargas =
    cargas.length === 0
      ? 'Ninguno'
      : cargas.length === 1
        ? `1 · ${cargas[0]} años`
        : `${cargas.length} · ${cargas.join(', ')} años`;

  // ── Campos (los mismos en escritorio y en la hoja del celular) ───────────
  const labelCls = 'block text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#5a6b6a] mb-1';
  const inputCls =
    'h-11 lg:h-9 w-full rounded-lg border border-[#0f514b]/15 bg-white px-2.5 text-[14px] font-bold text-[#0f514b] placeholder:font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#14dcb4] focus:ring-4 focus:ring-[#14dcb4]/20';

  const campoCiudad = (id: string) => (
    <div ref={ciudadRef} className="relative">
      {/* La zona va junto a la etiqueta (no dentro del campo) para no tapar el nombre de la ciudad. */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <label htmlFor={id} className={`${labelCls} mb-0`}>
          ¿Dónde vives?
        </label>
        {zonaNombre && ciudadTexto === ciudad && (
          <span className="truncate text-[9.5px] font-bold uppercase tracking-[0.06em] text-[#0f9d8a]">
            Zona {zonaNombre}
          </span>
        )}
      </div>
      <div className="relative">
        <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#5a6b6a] pointer-events-none" aria-hidden />
        <input
          id={id}
          type="text"
          autoComplete="off"
          value={ciudadTexto}
          onChange={(e) => {
            setCiudadTexto(e.target.value);
            setCiudadSel(null);
            setVerSugerencias(true);
          }}
          onFocus={() => setVerSugerencias(true)}
          placeholder="Tu ciudad o comuna"
          className={`${inputCls} pl-7`}
        />
      </div>
      {sugerencias.length > 0 && (
        <ul className="pop-in origin-top absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-200 bg-white shadow-[0_16px_36px_-12px_rgba(15,81,75,0.3)] overflow-hidden">
          {sugerencias.map((s) => (
            <li key={`${s.ciudad}-${s.zonaId}`}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegirCiudad(s.ciudad, s.zonaId)}
                className="tappable-row w-full px-3 py-2.5 lg:py-2 text-left text-[13px] font-semibold text-[#0f514b] hover:bg-[#14dcb4]/10 active:bg-[#14dcb4]/15"
              >
                {s.ciudad}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const campoEdad = (id: string) => (
    <div>
      <label htmlFor={id} className={labelCls}>
        Tu edad
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={edad}
        onChange={(e) => {
          setEdad(digitos(e.target.value, 3));
          if (error) setError(null);
        }}
        placeholder={`Ej: ${EDAD_PERFIL_POR_DEFECTO + 4}`}
        className={inputCls}
      />
    </div>
  );

  const editorCargas = (id: string) => (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={cargaInput}
          onChange={(e) => setCargaInput(digitos(e.target.value, 3))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              agregarCarga();
            }
          }}
          placeholder="Edad, ej: 8"
          aria-label="Edad de tu pareja o hijo"
          className={`${inputCls} flex-1 w-0`}
        />
        <button
          type="button"
          onClick={agregarCarga}
          className="pressable h-11 lg:h-9 shrink-0 px-3 rounded-lg bg-[#0f514b] text-white text-[12.5px] font-bold inline-flex items-center gap-1 hover:bg-[#0c403b]"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden /> Agregar
        </button>
      </div>
      {cargas.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {cargas.map((c, i) => (
            <button
              key={`${c}-${i}`}
              type="button"
              onClick={() => setCargas((arr) => arr.filter((_, j) => j !== i))}
              aria-label={`Quitar persona de ${c} años`}
              className="pressable inline-flex items-center gap-1 rounded-full bg-[#14dcb4]/15 px-2.5 py-1.5 lg:py-1 text-[12px] font-bold text-[#0f514b] hover:bg-[#14dcb4]/25"
            >
              {c} años <X className="w-3 h-3" aria-hidden />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[11.5px] text-[#5a6b6a]">Agrega la edad de cada persona, una por una.</p>
      )}
    </div>
  );

  const campoSueldo = (id: string) => (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <label htmlFor={id} className={`${labelCls} mb-0`}>
          Sueldo
        </label>
        <div role="radiogroup" aria-label="Tipo de sueldo" className="inline-flex rounded-md bg-[#0f514b]/7 p-0.5 text-[10px] font-bold">
          {(['liquido', 'bruto'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={sueldoTipo === t}
              onClick={() => setSueldoTipo(t)}
              className={`tappable-row px-1.5 py-0.5 rounded transition-colors duration-150 ${sueldoTipo === t ? 'bg-white text-[#0f514b] shadow-sm' : 'text-[#5a6b6a]'}`}
            >
              {t === 'liquido' ? 'Líquido' : 'Bruto'}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-[#0f514b]/50 pointer-events-none">$</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={formatoMiles(sueldoInput)}
          onChange={(e) => setSueldoInput(digitos(e.target.value))}
          placeholder="Opcional"
          className={`${inputCls} pl-6`}
        />
      </div>
    </div>
  );

  const botonAplicar = (full: boolean) => (
    <button
      type="submit"
      className={`h-9 px-4 rounded-lg bg-gradient-to-br from-[#14dcb4] to-[#0f9d8a] text-[#0f2826] text-[13px] font-extrabold whitespace-nowrap shadow-[0_6px_14px_rgba(20,220,180,0.3)] pressable hover:-translate-y-px ${
        full ? 'w-full h-11 text-[14.5px]' : ''
      }`}
    >
      Ver mi precio
    </button>
  );

  // ── Resumen (celular y escritorio) ──────────────────────────────────────
  const partes: string[] = [];
  if (!perfilPorDefecto && titular) {
    partes.push(`${titular.edad} años${cargasActuales.length ? ` + ${cargasActuales.length}` : ''}`);
  }
  if (zonaNombre && ciudad) partes.push(ciudad);
  const resumen = partes.length ? partes.join(' · ') : `Ejemplo: 1 persona de ${EDAD_PERFIL_POR_DEFECTO} años`;

  return (
    <>
      <div className="sticky top-[60px] sm:top-[68px] z-40 border-b border-[#0f514b]/10 bg-[#fbf8f3]/95 backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          {/* Escritorio: una sola línea */}
          <form onSubmit={aplicar} noValidate className="hidden lg:flex items-end gap-2.5 py-2.5">
            <div className="self-center shrink-0 pr-1">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-white bg-[#0f514b] rounded-full px-2.5 py-1 inline-flex items-center gap-1.5">
                <UserRound className="w-3 h-3" aria-hidden /> Tu perfil
              </div>
              {!hayPerfil && <div className="mt-1 text-[10.5px] font-bold text-[#0f9d8a]">Empieza aquí →</div>}
            </div>
            <div className="w-[200px]">{campoCiudad('perfil-ciudad-top')}</div>
            <div className="w-[84px]">{campoEdad('perfil-edad-top')}</div>
            <div ref={cargasRef} className="relative w-[170px]">
              <span className={labelCls}>Pareja o hijos</span>
              <button
                type="button"
                onClick={() => setVerCargas((v) => !v)}
                aria-expanded={verCargas}
                className={`${inputCls} tappable-row flex items-center justify-between gap-2 text-left`}
              >
                <span className={`truncate ${cargas.length === 0 ? 'text-slate-400 font-semibold' : ''}`}>{textoCargas}</span>
                <ChevronDown className="w-4 h-4 shrink-0 text-[#5a6b6a]" aria-hidden />
              </button>
              {verCargas && (
                <div className="pop-in origin-top-left absolute left-0 top-full mt-1.5 z-50 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_18px_40px_-14px_rgba(15,81,75,0.35)]">
                  <div className="text-[12px] font-bold text-[#0f514b] mb-2">¿A quién más quieres cubrir?</div>
                  {editorCargas('perfil-carga-top')}
                </div>
              )}
            </div>
            <div className="w-[190px]">{campoSueldo('perfil-sueldo-top')}</div>
            {botonAplicar(false)}
            <div className="self-center min-w-0 flex-1 text-right text-[11.5px] leading-snug text-[#5a6b6a]">
              {budgetCLP ? (
                <>
                  Tu 7%: <strong className="text-[#0f514b] tabular-nums">{formatCLP(budgetCLP)}</strong>
                </>
              ) : perfilPorDefecto ? (
                <>Precios de ejemplo: 1 persona de {EDAD_PERFIL_POR_DEFECTO} años</>
              ) : null}
              {hayPerfil && (
                <button type="button" onClick={onClear} className="pressable block ml-auto mt-0.5 font-semibold text-[#0f9d8a] hover:underline">
                  Volver al ejemplo
                </button>
              )}
            </div>
          </form>
          {error && <p role="alert" className="hidden lg:block pb-2 text-[12px] font-semibold text-red-700">{error}</p>}

          {/* Celular: resumen + Editar */}
          <div className="lg:hidden flex items-center justify-between gap-3 py-2">
            <p className="min-w-0 text-[12.5px] leading-snug text-[#0f514b]">
              <span className="font-bold">Tu perfil: </span>
              <span className={perfilPorDefecto ? 'text-[#5a6b6a]' : 'font-semibold'}>{resumen}</span>
              {budgetCLP ? <span className="text-[#5a6b6a]"> · 7% {formatCLP(budgetCLP)}</span> : null}
            </p>
            <button
              type="button"
              onClick={() => setHojaAbierta(true)}
              className="pressable shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#0f514b] px-3 py-2 text-[12px] font-bold text-white"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden />
              {hayPerfil ? 'Editar' : 'Calcular mi precio'}
            </button>
          </div>
        </div>
      </div>

      {/* Hoja del celular */}
      <AnimatePresence>
      {hojaAbierta && (
        <motion.div key="hoja-perfil" {...CONTENEDOR_MOTION} className="lg:hidden fixed inset-0 z-[75]" onClick={() => setHojaAbierta(false)}>
          <motion.div {...FONDO_MOTION} className="absolute inset-0 bg-[#06201d]/55 backdrop-blur-sm" />
          <motion.form
            {...hojaMotion}
            onSubmit={aplicar}
            noValidate
            role="dialog"
            aria-modal="true"
            aria-label="Tu perfil"
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[24px] bg-[#fbf8f3] px-5 pt-4 pb-[max(20px,env(safe-area-inset-bottom))] space-y-4 shadow-[0_-18px_40px_-20px_rgba(6,32,29,0.5)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-[#0f514b]">Calcula tu precio</h2>
              <button
                type="button"
                onClick={() => setHojaAbierta(false)}
                aria-label="Cerrar"
                className="pressable w-9 h-9 rounded-full grid place-items-center text-[#5a6b6a] hover:bg-[#0f514b]/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[12.5px] text-[#5a6b6a] -mt-2">
              Los precios que ves son de ejemplo (1 persona de {EDAD_PERFIL_POR_DEFECTO} años). Con estos datos calculamos el tuyo.
            </p>
            {campoCiudad('perfil-ciudad-hoja')}
            {campoEdad('perfil-edad-hoja')}
            <div>
              <span className={labelCls}>Pareja o hijos (opcional)</span>
              {editorCargas('perfil-carga-hoja')}
            </div>
            {campoSueldo('perfil-sueldo-hoja')}
            {error && <p role="alert" className="text-[12px] font-semibold text-red-700">{error}</p>}
            {botonAplicar(true)}
            {hayPerfil && (
              <button
                type="button"
                onClick={() => {
                  setHojaAbierta(false);
                  onClear();
                }}
                className="pressable w-full py-1 text-center text-[12.5px] font-semibold text-[#0f9d8a]"
              >
                Volver a los precios de ejemplo
              </button>
            )}
          </motion.form>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
