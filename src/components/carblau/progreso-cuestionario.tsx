"use client";

// Progreso del cuestionario: lo manda el backend en
// additional_kwargs.progreso de cada pregunta del agente.
export interface Progreso {
  paso: number;       // pregunta actual, empezando en 1
  total: number;      // total estimado (puede cambiar si el flujo se ramifica)
  etiqueta?: string;  // tema de la pregunta, p. ej. "Presupuesto"
}

export function ProgresoCuestionario({ progreso }: { progreso: Progreso }) {
  const total = Math.max(1, Math.round(progreso.total));
  const paso = Math.min(Math.max(1, Math.round(progreso.paso)), total);
  const porcentaje = (paso / total) * 100;

  return (
    <div className="px-4 pt-2 pb-2.5 border-b border-black/5 bg-white/40 backdrop-blur-sm">
      <div className="flex items-baseline justify-between text-xs mb-1.5">
        <span className="font-semibold text-[#082144]">
          Paso {paso} de {total}
        </span>
        {progreso.etiqueta && (
          <span className="text-slate-600 truncate ml-3">{progreso.etiqueta}</span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={paso}
        aria-label={`Paso ${paso} de ${total}${progreso.etiqueta ? `: ${progreso.etiqueta}` : ""}`}
        className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden"
      >
        <div
          className="h-full rounded-full bg-[#082144] transition-[width] duration-500 ease-out"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}
