"use client";

import { Children, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { AgentFrame, TarjetaAccion } from "@/components/carblau/agent-frame";
import { sinEmoji } from "@/lib/texto";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
  /** Control de respuesta o tabla comparativa: va en una tarjeta de acción bajo el texto */
  children?: ReactNode;
  /** La tarjeta es la pregunta en curso (línea aguamarina arriba) */
  pendiente?: boolean;
}

// Mensaje de texto (markdown). El asesor habla sobre el fondo, sin burbuja; el
// usuario conserva la suya. Los coches recomendados no pasan por aquí: llegan
// en additional_kwargs.payload y los pinta CarResultsMessage.
export function ChatMessage({ role, content, children, pendiente = false }: ChatMessageProps) {
  if (role === "user") {
    // Las opciones elegidas llegan con el emoji del backend ("⛰️ No, también
    // carretera"): se enseña el texto limpio. Lo enviado no cambia.
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-[18px] rounded-tr-[6px] bg-cb-navy px-3.5 py-2.5 text-[15px] leading-snug text-cb-crema">
          <ReactMarkdown className="cb-md cb-md-claro">{sinEmoji(content)}</ReactMarkdown>
        </div>
      </div>
    );
  }

  // `children` puede llegar como [false, undefined]: solo cuenta lo que pinta algo
  const hayTarjeta = Children.toArray(children).length > 0;
  return (
    <div className="flex flex-col gap-3">
      <AgentFrame variante="texto">
        {content ? (
          <ReactMarkdown className="cb-md cb-md-claro font-headline text-[17px] leading-[1.45]">{content}</ReactMarkdown>
        ) : null}
      </AgentFrame>
      {hayTarjeta && <TarjetaAccion pendiente={pendiente}>{children}</TarjetaAccion>}
    </div>
  );
}
