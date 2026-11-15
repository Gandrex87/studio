"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Lo que dice el asesor va en dos planos. El texto, directamente sobre el
// fondo (variante «texto»), con el icono y la etiqueta CarBlau encima. El
// «papel» crema, solo para lo que pide acción o enseña datos: la pregunta con
// sus controles, las fichas, la comparativa. Así la conversación se lee como
// conversación y las tarjetas destacan.
interface AgentFrameProps {
  children: ReactNode;
  etiqueta?: string;
  className?: string;
  /** "texto": sin tarjeta, sobre el fondo. "papel": tarjeta crema */
  variante?: "texto" | "papel";
  /** Sin relleno: el contenido (p. ej. fichas) gestiona sus propios márgenes */
  sinRelleno?: boolean;
}

export function AgentFrame({
  children,
  etiqueta = "CarBlau",
  className,
  variante = "papel",
  sinRelleno = false,
}: AgentFrameProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 pl-0.5">
        <img src="/favicon_cb.webp" alt="" aria-hidden="true" className="h-5 w-5 rounded-md" />
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-cb-agua">{etiqueta}</span>
      </div>
      {variante === "texto" ? (
        <div className={cn("w-full pl-0.5 text-cb-crema", className)}>{children}</div>
      ) : (
        <div
          className={cn(
            "w-full rounded-[18px] rounded-tl-[6px] bg-cb-crema text-cb-espresso",
            !sinRelleno && "px-4 py-3.5",
            className
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Tarjeta de acción: el papel crema donde el usuario responde o decide, con
// relieve sobre el fondo. Con `pendiente` (es la pregunta en curso) lleva la
// línea aguamarina arriba: «te toca».
export function TarjetaAccion({
  children,
  pendiente = false,
  className,
}: {
  children: ReactNode;
  pendiente?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-[20px] bg-cb-crema px-4 py-3.5 text-cb-espresso shadow-[0_14px_34px_rgba(0,0,0,0.38),0_2px_6px_rgba(0,0,0,0.2)]",
        pendiente && "border-t-[3px] border-cb-agua",
        className
      )}
    >
      {children}
    </div>
  );
}
