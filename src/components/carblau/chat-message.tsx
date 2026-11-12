"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { AgentFrame } from "@/components/carblau/agent-frame";
import { sinEmoji } from "@/lib/texto";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
  /** Control de respuesta o tabla comparativa, dentro de la tarjeta del asesor */
  children?: ReactNode;
}

// Burbuja de texto (markdown). Los coches recomendados no pasan por aquí:
// llegan en additional_kwargs.payload y los pinta CarResultsMessage.
export function ChatMessage({ role, content, children }: ChatMessageProps) {
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

  return (
    <AgentFrame>
      {content && (
        <ReactMarkdown className="cb-md font-headline text-[17px] leading-[1.45]">{content}</ReactMarkdown>
      )}
      {children && <div className={content ? "mt-3.5" : undefined}>{children}</div>}
    </AgentFrame>
  );
}
