"use client";

import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { User, Loader2 } from "lucide-react"; // ✅ Añadir Loader2


interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
  isStreaming?: boolean; 
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE FICHA DE COCHE (CAR CARD)
// ═══════════════════════════════════════════════════════════════════
const CarCard = ({ markdownContent }: { markdownContent: string }) => {
  
  const markdownComponents: any = {
    img: ({ node, ...props }: any) => (
      <div className="flex justify-center my-3">
        <img
          src={props.src || ""}
          alt={props.alt || "Coche recomendado"}
          className="rounded-lg border border-gray-200 shadow-sm max-w-full h-auto"
        />
      </div>
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-bold mt-0 mb-2 text-center text-slate-900" {...props} />
    ),
    blockquote: ({ node, ...props }: any) => {
      let text = '';
      const pNode = node?.children?.[0];
      if (pNode && pNode.type === 'element') {
        const textNode = pNode.children?.[0];
        if (textNode && textNode.type === 'text') {
          text = textNode.value || '';
        }
      }
      const specs = text.split('|').map(s => s.trim());
      return (
        <div className="flex justify-center gap-2 my-3 flex-wrap not-prose">
          {specs.map((spec, i) => (
            <span key={i} className="bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold px-2.5 py-1 rounded-full">
              {spec}
            </span>
          ))}
        </div>
      );
    },
    p: ({ node, ...props }: any) => {
      const firstChild = node?.children[0];
      if (firstChild?.type === 'element' && firstChild.tagName === 'strong') {
        return <p className="text-center font-semibold text-base my-2 text-slate-800" {...props} />;
      }
      if (firstChild?.type === 'element' && firstChild.tagName === 'em') {
        return <p className="text-center text-xs text-slate-500 italic mt-3" {...props} />;
      }
      return <p className="text-slate-700" {...props} />;
    },
    hr: () => null,
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200/50">
      <ReactMarkdown components={markdownComponents}>
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL DEL MENSAJE
// ═══════════════════════════════════════════════════════════════════

export function ChatMessage({ role, content, isStreaming = false }: ChatMessageProps) {
  const isAgent = role === "agent";

  const carCardRegex = /---\s*###([\s\S]*?)(?=\n---|\n*$)/g;
  
  let introText = content;
  const carParts: string[] = [];
  let outroText = '';

  const matches = [...content.matchAll(carCardRegex)];

  if (matches.length > 0) {
    const firstMatchIndex = content.indexOf(matches[0][0]);
    introText = content.substring(0, firstMatchIndex).trim();

    matches.forEach(match => {
      carParts.push(`### ${match[1].trim()}`);
    });

    const lastMatch = matches[matches.length - 1];
    const lastMatchEndIndex = content.indexOf(lastMatch[0]) + lastMatch[0].length;
    outroText = content.substring(lastMatchEndIndex).replace(/---/g, '').trim();
  }

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
        {introText && (
          <ReactMarkdown className={cn(
            "prose prose-sm max-w-none",
            isAgent 
              ? "prose-neutral text-slate-800 marker:text-slate-800" 
              : "prose-invert !text-white marker:text-white"
          )}>
            {introText}
          </ReactMarkdown>
        )}

        {carParts.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            {carParts.map((part, index) => (
              <CarCard key={index} markdownContent={part} />
            ))}
          </div>
        )}

        {outroText && (
          <ReactMarkdown className={cn(
            "prose prose-sm max-w-none mt-4",
            isAgent 
              ? "prose-neutral text-slate-800" 
              : "prose-invert !text-white"
          )}>
            {outroText}
          </ReactMarkdown>
        )}

        {/* ✅ NUEVO: Indicador de streaming */}
        {isStreaming && content.trim() === "" && (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Escribiendo...</span>
          </div>
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