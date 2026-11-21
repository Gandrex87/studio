"use client";

import { useEffect, useState } from "react";
import type { Progreso } from "@/lib/tipos";

export type { Progreso };

// Datos que recoge el cuestionario completo (frecuencia, trayecto, km, zona,
// pasajeros, equipaje, gasto de uso, presupuesto…): para medir lo andado por datos
const DATOS_CUESTIONARIO = 9;

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

// Línea fina bajo la cabecera con lo andado del cuestionario. El backend manda
// `progreso` en cada pregunta (los pasos son temas, no preguntas); `datos` son
// los items ya anotados en el encargo. La barra toma lo que vaya más adelante,
// así un atajo del arranque que rellena tres datos de golpe ya se nota, y nunca
// retrocede dentro de una conversación: si el backend vuelve a una etapa anterior
// («Campo y caminos» pregunta el terreno antes que los km), se queda donde estaba.
export function ProgresoCuestionario({ progreso, datos = 0 }: { progreso: Progreso; datos?: number }) {
  const { paso, total } = normalizar(progreso);
  const fraccion = Math.min(1, Math.max(paso / total, datos / DATOS_CUESTIONARIO));
  const [maximo, setMaximo] = useState(fraccion);
  useEffect(() => {
    if (fraccion > maximo) setMaximo(fraccion);
  }, [fraccion, maximo]);
  const ancho = Math.max(maximo, fraccion);
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={paso}
      aria-label={textoProgreso(progreso)}
      className="mx-4 h-[3px] overflow-hidden rounded-sm bg-cb-crema/[0.14]"
    >
      <div className="h-full rounded-sm bg-cb-agua transition-[width] duration-500" style={{ width: `${ancho * 100}%` }} />
    </div>
  );
}
