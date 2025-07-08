"use client";

import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isAgent = role === "agent";

  return (
    <div
      className={cn(
        "flex items-start gap-4",
        !isAgent && "justify-end"
      )}
    >
      {isAgent && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div
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
            a: ({ node, ...props }) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
            img: ({ node, ...props }) => {
                const hint = props.alt || "car image";
                return (
                    <Image
                      src={props.src || ""}
                      alt={hint}
                      width={300}
                      height={200}
                      className="rounded-lg border my-2 shadow-md"
                      data-ai-hint={hint}
                   />
                )
            },
            h3: ({ node, ...props }) => (
              <h3 className="text-base font-semibold mt-4 mb-2" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      
      {!isAgent && (
         <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
           <User className="w-5 h-5" />
         </div>
      )}
    </div>
  );
}
