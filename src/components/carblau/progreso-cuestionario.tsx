"use client";

import type { Progreso } from "@/lib/tipos";

export type { Progreso };

// Progreso del cuestionario inicial: un segmento por tema (el backend manda
// `progreso` en cada pregunta; los pasos son temas, no preguntas).
export function ProgresoCuestionario({ progreso }: { progreso: Progreso }) {
  const total = Math.max(1, Math.round(progreso.total));
  const paso = Math.min(Math.max(1, Math.round(progreso.paso)), total);

  return (
    <div className="flex flex-col gap-2 px-4 pb-2.5 pt-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-cb-agua">
          Paso {paso} de {total}
        </span>
        {progreso.etiqueta && (
          <span className="ml-3 truncate text-[13px] text-cb-crema-suave">{progreso.etiqueta}</span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={paso}
        aria-label={`Paso ${paso} de ${total}${progreso.etiqueta ? `: ${progreso.etiqueta}` : ""}`}
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1 rounded-sm transition-colors duration-500 ${
              i < paso ? "bg-cb-blau" : "bg-cb-crema/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
