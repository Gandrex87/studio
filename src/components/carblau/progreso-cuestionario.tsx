"use client";

import type { Progreso } from "@/lib/tipos";

export type { Progreso };

function normalizar(progreso: Progreso) {
  const total = Math.max(1, Math.round(progreso.total));
  const paso = Math.min(Math.max(1, Math.round(progreso.paso)), total);
  return { paso, total };
}

// «Paso 2 de 5 · Por dónde circulas», para la fila bajo la cabecera
export function textoProgreso(progreso: Progreso): string {
  const { paso, total } = normalizar(progreso);
  return `Paso ${paso} de ${total}${progreso.etiqueta ? ` · ${progreso.etiqueta}` : ""}`;
}

// Línea fina bajo la cabecera con lo andado del cuestionario (el backend manda
// `progreso` en cada pregunta; los pasos son temas, no preguntas).
export function ProgresoCuestionario({ progreso }: { progreso: Progreso }) {
  const { paso, total } = normalizar(progreso);
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={paso}
      aria-label={textoProgreso(progreso)}
      className="mx-4 h-[3px] overflow-hidden rounded-sm bg-cb-crema/[0.14]"
    >
      <div
        className="h-full rounded-sm bg-cb-agua transition-[width] duration-500"
        style={{ width: `${(paso / total) * 100}%` }}
      />
    </div>
  );
}
