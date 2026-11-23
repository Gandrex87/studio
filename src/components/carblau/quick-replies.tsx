"use client";

import { useState } from "react";
import {
  Check,
  CirclePlus,
  Columns2,
  FilterX,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
  Undo2,
  UserRound,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { sinEmoji } from "@/lib/texto";
import { iconosDeOpciones } from "@/lib/iconos";

interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
  isLoading: boolean;
  multiSelect?: boolean;
  submitLabel?: string;
  /** Texto pequeño bajo un botón (opción → detalle), p. ej. «Hasta 4,1 m». No se envía */
  detalles?: Record<string, string>;
  /** "papel": dentro de la tarjeta crema (por defecto). "oscuro": sobre el fondo espresso */
  tono?: "papel" | "oscuro";
}

const INDIFERENTE = "🤷 Indiferente";

// Acciones sobre el fondo espresso (tras los resultados): la misma forma que las
// tarjetas del arranque, con un icono aguamarina cuando la acción tiene uno
export const CHIP_OSCURO =
  "flex min-h-[54px] items-center gap-2.5 rounded-2xl border border-cb-crema/[0.18] bg-cb-crema/[0.07] px-3.5 py-3 text-left text-[15px] font-semibold leading-snug text-cb-crema transition-colors hover:bg-cb-crema/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua disabled:cursor-not-allowed disabled:opacity-50";

// Icono por acción (el texto llega del backend con emoji: se compara sin él)
const ICONOS_ACCION: [RegExp, LucideIcon][] = [
  [/comparar/i, Columns2],
  [/más opciones|ver más/i, CirclePlus],
  [/afinar/i, SlidersHorizontal],
  [/ampliar|subir/i, TrendingUp],
  [/presupuesto/i, Wallet],
  [/empezar de nuevo|de cero|reiniciar/i, RotateCcw],
  [/no me convence/i, ThumbsDown],
  [/especialista|una persona/i, UserRound],
  // Sin resultados tras afinar, o resultados iguales: relajar un filtro
  [/quitar filtro/i, FilterX],
  [/^incluir /i, CirclePlus],
  [/tipos similares/i, RefreshCw],
  [/volver a los resultados/i, Undo2],
  [/me quedo con/i, ThumbsUp],
];
function iconoAccion(texto: string): LucideIcon | null {
  const limpio = sinEmoji(texto);
  return ICONOS_ACCION.find(([patron]) => patron.test(limpio))?.[1] ?? null;
}

// ¿Es un grupo de acciones («qué hacemos ahora») y no las respuestas a una
// pregunta? Si todas las opciones tienen icono de acción, se pintan sobre el
// fondo, fuera de la tarjeta.
export function sonAcciones(options: string[] | undefined): boolean {
  return Boolean(options && options.length > 0 && options.every((o) => iconoAccion(o) !== null));
}

// Icono de una respuesta: el emoji del backend traducido a icono de línea,
// en marino sobre un cuadrado aguamarina suave (como «Rango típico» en las
// fichas). Marcada (selección múltiple), el cuadrado pasa a marino con un check.
function IconoRespuesta({ Icono, activo = false }: { Icono: LucideIcon; activo?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ${
        activo ? "bg-cb-navy text-cb-crema" : "bg-cb-agua/40 text-cb-navy"
      }`}
    >
      {activo ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icono className="h-[17px] w-[17px]" strokeWidth={2} />}
    </span>
  );
}

// Respuestas dentro de la tarjeta crema: la misma forma de tarjeta que las
// acciones y el arranque (esquinas de 16 px, texto a la izquierda)
const CHIP_BASE =
  "inline-flex min-h-[48px] items-center rounded-2xl font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua disabled:cursor-not-allowed disabled:opacity-50";
const RELLENO_NORMAL = "border border-cb-espresso/[0.22] bg-cb-crema-2 text-cb-espresso hover:border-cb-espresso/50";
const RELLENO_ACTIVO = "border-2 border-cb-navy bg-cb-agua/40 text-cb-navy";
export const CHIP = `${CHIP_BASE} gap-2 px-3.5 py-2.5 text-left text-[15px]`;
// Con icono: el cuadrado del icono pide menos relleno a la izquierda
const CHIP_CON_ICONO = `${CHIP_BASE} gap-3 py-2 pl-2 pr-3.5 text-left text-[15px]`;
export const CHIP_NORMAL = `${CHIP} ${RELLENO_NORMAL}`;
export const CHIP_ACTIVO = `${CHIP} ${RELLENO_ACTIVO}`;
// Rejillas compactas (rangos de presupuesto, distancia, kilómetros): centrado y más pequeño
export const CHIP_COMPACTO = `${CHIP_BASE} justify-center gap-0.5 px-2 py-2 text-center text-sm`;
export const CHIP_COMPACTO_NORMAL = `${CHIP_COMPACTO} ${RELLENO_NORMAL}`;
export const CHIP_COMPACTO_ACTIVO = `${CHIP_COMPACTO} ${RELLENO_ACTIVO}`;
export const BOTON_PRIMARIO =
  "inline-flex h-12 items-center justify-center rounded-full bg-cb-agua px-6 text-base font-bold text-cb-navy transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-espresso disabled:cursor-not-allowed disabled:bg-cb-espresso/10 disabled:text-cb-tinta";
export const ENLACE_SECUNDARIO =
  "inline-flex min-h-[40px] items-center justify-center text-sm font-semibold text-cb-tinta underline underline-offset-[3px] hover:text-cb-espresso disabled:opacity-50";

// Nombre de la opción y, si lo hay, su detalle en pequeño debajo (la medida de cada tamaño)
function TextoOpcion({ option, detalle }: { option: string; detalle?: string }) {
  if (!detalle) return <>{sinEmoji(option)}</>;
  return (
    <span className="flex flex-col leading-tight">
      <span>{sinEmoji(option)}</span>
      <span className="text-xs font-medium opacity-70">{detalle}</span>
    </span>
  );
}

// Botones de respuesta rápida. Se enseñan sin el emoji y se envían tal cual
// (el backend compara el texto completo de la opción).
export function QuickReplies({
  options,
  onSelect,
  isLoading,
  multiSelect,
  submitLabel,
  detalles,
  tono = "papel",
}: QuickRepliesProps) {
  const [selected, setSelected] = useState<string[]>([]);

  if (!options || options.length === 0) return null;

  if (!multiSelect) {
    if (tono === "oscuro") {
      return (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {options.map((option) => {
            const Icono = iconoAccion(option);
            return (
              <button key={option} type="button" onClick={() => onSelect(option)} disabled={isLoading} className={CHIP_OSCURO}>
                {Icono && <Icono className="h-[18px] w-[18px] shrink-0 text-cb-agua" strokeWidth={2} aria-hidden="true" />}
                {sinEmoji(option)}
              </button>
            );
          })}
        </div>
      );
    }
    // En móvil, una opción por fila a todo el ancho; en escritorio, en fila
    const iconos = iconosDeOpciones(options);
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {options.map((option, i) => {
          const Icono = iconos?.[i];
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              disabled={isLoading}
              className={`${Icono ? CHIP_CON_ICONO : CHIP} ${RELLENO_NORMAL} w-full sm:w-auto`}
            >
              {Icono && <IconoRespuesta Icono={Icono} />}
              <TextoOpcion option={option} detalle={detalles?.[option]} />
            </button>
          );
        })}
      </div>
    );
  }

  const toggle = (option: string) => {
    if (option === INDIFERENTE) {
      setSelected((prev) => (prev.includes(INDIFERENTE) ? [] : [INDIFERENTE]));
    } else {
      setSelected((prev) => {
        const sinIndiferente = prev.filter((o) => o !== INDIFERENTE);
        return sinIndiferente.includes(option)
          ? sinIndiferente.filter((o) => o !== option)
          : [...sinIndiferente, option];
      });
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    onSelect(selected.join(" y "));
  };

  // Con iconos (carrocería, tamaño…), una opción por fila en móvil; sin ellos
  // (marcas), en fila con un check al marcar
  const iconos = iconosDeOpciones(options);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-cb-tinta">
        Elige una o varias opciones
      </p>
      <div className={iconos ? "flex flex-col gap-2 sm:flex-row sm:flex-wrap" : "flex flex-wrap gap-2"}>
        {options.map((option, i) => {
          const activo = selected.includes(option);
          const Icono = iconos?.[i];
          return (
            <button
              key={option}
              type="button"
              aria-pressed={activo}
              onClick={() => toggle(option)}
              disabled={isLoading}
              className={
                Icono
                  ? `${CHIP_CON_ICONO} ${activo ? RELLENO_ACTIVO : RELLENO_NORMAL} w-full sm:w-auto`
                  : activo
                    ? CHIP_ACTIVO
                    : CHIP_NORMAL
              }
            >
              {Icono ? (
                <IconoRespuesta Icono={Icono} activo={activo} />
              ) : (
                activo && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />
              )}
              <TextoOpcion option={option} detalle={detalles?.[option]} />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || selected.length === 0}
        className={BOTON_PRIMARIO}
      >
        {submitLabel ?? "Continuar"}
      </button>
    </div>
  );
}
