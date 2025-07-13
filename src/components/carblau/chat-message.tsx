"use client";

import ReactMarkdown from 'react-markdown';
// ✅ CORREGIDO: Revertimos a 'Bot' y 'User' de lucide-react.
import { Car, User } from "lucide-react"; 
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAgent = role === "agent";

  // Divide el contenido por el separador '---' para tratar cada coche como una tarjeta
  const parts = content.split('---').filter(part => part.trim() !== '');

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        !isAgent && "justify-end"
      )}
    >
      {isAgent && (
        // ✅ CORREGIDO: Volvemos a usar el icono del Bot.
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
           <Car className="w-5 h-5" />
        </div>
      )}

      <div className="flex flex-col gap-4">
        {parts.map((part, index) => (
          <div
            key={index}
            className={cn(
              "max-w-md rounded-lg px-4 py-3 text-sm shadow-md",
              isAgent
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground"
            )}
          >
            <ReactMarkdown
              className="prose prose-sm dark:prose-invert max-w-none"
              components={{
                img: ({ node, ...props }) => (
                  <div className="flex justify-center my-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={props.src || ""}
                      alt={props.alt || "Coche recomendado"}
                      className="rounded-lg border shadow-md max-w-full h-auto"
                    />
                  </div>
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-lg font-bold mt-0 mb-2 text-center" {...props} />
                ),
                blockquote: ({ node, ...props }) => {
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
                p: ({ node, ...props }) => {
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
              }}
            >
              {part}
            </ReactMarkdown>
          </div>
        ))}
      </div>

      {!isAgent && (
         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
           <User className="w-5 h-5" />
         </div>
      )}
    </div>
  );
}
