"use client";

import ReactMarkdown from 'react-markdown';
import { Car, User } from "lucide-react"; 
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAgent = role === "agent";

  // ✅ LÓGICA MEJORADA: Se distinguen 3 partes: introducción, coches y conclusión.
  const firstSeparator = content.indexOf('---');
  const lastSeparator = content.lastIndexOf('---');
  
  let introText = content;
  let carParts: string[] = [];
  let outroText = '';

  if (firstSeparator !== -1) {
    introText = content.substring(0, firstSeparator).trim();
    
    // Si hay una conclusión después de la lista de coches
    if (lastSeparator > firstSeparator) {
      const carData = content.substring(firstSeparator, lastSeparator);
      carParts = carData.split('---').filter(part => part.trim() !== '');
      outroText = content.substring(lastSeparator + 3).trim(); // +3 para saltar '---'
    } else { // Si solo hay coches y no hay conclusión
      const carData = content.substring(firstSeparator);
      carParts = carData.split('---').filter(part => part.trim() !== '');
    }
  }

  const markdownComponents = {
    img: ({ node, ...props }: any) => (
      <div className="flex justify-center my-3">
        <img
          src={props.src || ""}
          alt={props.alt || "Coche recomendado"}
          className="rounded-lg border shadow-md max-w-full h-auto"
        />
      </div>
    ),
    h3: ({ node, ...props }: any) => (
      <h3 className="text-lg font-bold mt-0 mb-2 text-center" {...props} />
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
            <span key={i} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
              {spec}
            </span>
          ))}
        </div>
      );
    },
    p: ({ node, ...props }: any) => {
      const firstChild = node?.children[0];
      if (firstChild?.type === 'element' && firstChild.tagName === 'strong') {
        return <p className="text-center font-semibold text-base my-2" {...props} />;
      }
      if (firstChild?.type === 'element' && firstChild.tagName === 'em') {
        return <p className="text-center text-xs text-muted-foreground/80 italic mt-3" {...props} />;
      }
      return <p {...props} />;
    },
    hr: () => null,
  };

  return (
    <div className={cn("flex items-start gap-4", !isAgent && "justify-end")}>
      {isAgent && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
           <Car className="w-5 h-5" />
        </div>
      )}

      <div className={cn(
        "rounded-lg px-4 py-3 text-sm shadow-md w-full max-w-lg",
        isAgent ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"
      )}>
        {/* Renderiza el texto de introducción */}
        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
          {introText}
        </ReactMarkdown>

        {/* Renderiza las fichas de los coches */}
        {carParts.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            {carParts.map((part, index) => (
              <div key={index} className="bg-background/50 rounded-lg p-3 shadow-sm">
                <ReactMarkdown components={markdownComponents}>
                  {part}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        )}

        {/* Renderiza el texto de conclusión si existe */}
        {outroText && (
          <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none mt-4">
            {outroText}
          </ReactMarkdown>
        )}
      </div>

      {!isAgent && (
         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
           <User className="w-5 h-5" />
         </div>
      )}
    </div>
  );
}
