"use client";

import ReactMarkdown from 'react-markdown';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        <Avatar className="w-8 h-8 border border-primary">
          <AvatarFallback className="bg-transparent text-primary">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-md rounded-lg px-4 py-3 text-sm",
          isAgent
            ? "bg-card text-card-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <ReactMarkdown
          components={{
            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc space-y-1 pl-4 my-2" {...props} />,
            ol: ({ node, ...props }) => <ol className="list-decimal space-y-1 pl-4 my-2" {...props} />,
            li: ({ node, ...props }) => <li className="pb-1" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
            code: ({ node, ...props }) => <code className="bg-muted text-muted-foreground rounded-sm px-1 py-0.5 font-mono text-xs" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      
      {!isAgent && (
         <Avatar className="w-8 h-8 border border-muted-foreground">
           <AvatarFallback className="bg-transparent text-muted-foreground">
             <User className="w-5 h-5" />
           </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
