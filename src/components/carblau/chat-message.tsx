"use client";

import ReactMarkdown from 'react-markdown';
import { Car, User } from "lucide-react"; 
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
}

// Componente para renderizar una única ficha de coche
const CarCard = ({ markdownContent }: { markdownContent: string }) => {
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
    <div className="bg-background/50 rounded-lg p-3 shadow-sm">
      <ReactMarkdown components={markdownComponents}>
        {markdownContent}
      </ReactMarkdown>
    </div>
  );
};


export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAgent = role === "agent";

  const carCardRegex = /---\s*###(.*?)(?=\n---|\n*$)/gs;
  
  let introText = content;
  const carParts: string[] = [];
  let outroText = '';

  const matches = [...content.matchAll(carCardRegex)];

  if (matches.length > 0) {
    const firstMatchIndex = content.indexOf(matches[0][0]);
    introText = content.substring(0, firstMatchIndex).trim();

    matches.forEach(match => {
      // ✅ CORREGIDO: Añadimos un espacio después de '###' para que Markdown
      // lo reconozca como un título y no como un párrafo.
      carParts.push(`### ${match[1].trim()}`);
    });

    const lastMatch = matches[matches.length - 1];
    const lastMatchEndIndex = content.indexOf(lastMatch[0]) + lastMatch[0].length;
    outroText = content.substring(lastMatchEndIndex).replace(/---/g, '').trim();
  }

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
        {introText && (
          <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
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
