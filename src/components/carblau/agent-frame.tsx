"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Marco común de todo lo que dice el asesor: etiqueta "CarBlau" con el icono y
// la tarjeta de papel crema. Lo usan los mensajes de texto, las fichas de
// coches y el estado de búsqueda, para que nada cambie de aspecto entre ellos.
interface AgentFrameProps {
  children: ReactNode;
  etiqueta?: string;
  className?: string;
  /** Sin relleno: el contenido (p. ej. fichas) gestiona sus propios márgenes */
  sinRelleno?: boolean;
}

export function AgentFrame({ children, etiqueta = "CarBlau", className, sinRelleno = false }: AgentFrameProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 pl-0.5">
        <img src="/favicon_cb.webp" alt="" aria-hidden="true" className="h-5 w-5 rounded-md" />
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-cb-agua">{etiqueta}</span>
      </div>
      <div
        className={cn(
          "w-full rounded-[18px] rounded-tl-[6px] bg-cb-crema text-cb-espresso",
          !sinRelleno && "px-4 py-3.5",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
