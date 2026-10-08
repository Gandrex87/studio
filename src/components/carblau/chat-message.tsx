"use client";

import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { User } from "lucide-react";


interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL MENSAJE
// ═══════════════════════════════════════════════════════════════════

// Burbuja de texto (markdown). Los coches recomendados no pasan por aquí:
// llegan en additional_kwargs.payload y los pinta CarResultsMessage.
export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAgent = role === "agent";

  return (
    <div className={cn("flex items-start gap-3", !isAgent && "justify-end")}>
      
      {/* 🖼️ AVATAR DEL AGENTE */}
      {isAgent && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden">
           <img 
             src="/favicon_cb.webp" 
             alt="CarBlau Agent" 
             className="h-full w-full object-cover"
           />
        </div>
      )}

      {/* 🗨️ BURBUJA DE CHAT */}
      <div className={cn(
        "rounded-2xl px-5 py-4 text-sm shadow-md w-full max-w-lg leading-relaxed",
        isAgent 
          ? "bg-[#ECEBE7] text-slate-900 rounded-tl-none" 
          : "!bg-[#082144] !text-white rounded-tr-none" 
      )}>
        {content && (
          <ReactMarkdown className={cn(
            "prose prose-sm max-w-none",
            isAgent 
              ? "prose-neutral text-slate-800 marker:text-slate-800" 
              : "prose-invert !text-white marker:text-white"
          )}>
            {content}
          </ReactMarkdown>
        )}

      </div>

      {/* ÍCONO DEL USUARIO */}
      {!isAgent && (
         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#082144] text-white border border-white/20 shadow-sm">
           <User className="w-5 h-5" />
         </div>
      )}
    </div>
  );
}