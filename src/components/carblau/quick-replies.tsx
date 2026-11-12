"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { sinEmoji } from "@/lib/texto";

interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
  isLoading: boolean;
  multiSelect?: boolean;
  submitLabel?: string;
  /** "papel": dentro de la tarjeta crema (por defecto). "oscuro": sobre el fondo espresso */
  tono?: "papel" | "oscuro";
}

const INDIFERENTE = "🤷 Indiferente";

// Chips sobre el fondo espresso (acciones tras los resultados)
export const CHIP_OSCURO =
  "inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border border-cb-crema/25 px-3.5 py-1.5 text-sm font-medium text-cb-crema transition-colors hover:bg-cb-crema/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-blau disabled:cursor-not-allowed disabled:opacity-50";

// Estilos de los chips dentro de la tarjeta crema del asesor
export const CHIP =
  "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-left text-sm font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-blau disabled:cursor-not-allowed disabled:opacity-50";
export const CHIP_NORMAL = `${CHIP} border border-cb-espresso/[0.22] bg-cb-crema-2 text-cb-espresso hover:border-cb-espresso/50`;
export const CHIP_ACTIVO = `${CHIP} border-2 border-cb-blau bg-cb-blau/[0.12] text-cb-espresso`;
export const BOTON_PRIMARIO =
  "inline-flex h-12 items-center justify-center rounded-full bg-cb-blau px-6 text-base font-bold text-cb-espresso transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-espresso disabled:cursor-not-allowed disabled:bg-cb-espresso/10 disabled:text-cb-tinta";
export const ENLACE_SECUNDARIO =
  "inline-flex min-h-[40px] items-center justify-center text-sm font-semibold text-cb-tinta underline underline-offset-[3px] hover:text-cb-espresso disabled:opacity-50";

// Botones de respuesta rápida. Se enseñan sin el emoji y se envían tal cual
// (el backend compara el texto completo de la opción).
export function QuickReplies({
  options,
  onSelect,
  isLoading,
  multiSelect,
  submitLabel,
  tono = "papel",
}: QuickRepliesProps) {
  const [selected, setSelected] = useState<string[]>([]);

  if (!options || options.length === 0) return null;

  if (!multiSelect) {
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            disabled={isLoading}
            className={tono === "oscuro" ? CHIP_OSCURO : CHIP_NORMAL}
          >
            {sinEmoji(option)}
          </button>
        ))}
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

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-cb-tinta">
        Elige una o varias opciones
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const activo = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={activo}
              onClick={() => toggle(option)}
              disabled={isLoading}
              className={activo ? CHIP_ACTIVO : CHIP_NORMAL}
            >
              {activo && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} />}
              {sinEmoji(option)}
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
