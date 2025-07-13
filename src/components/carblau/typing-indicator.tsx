"use client";

import { Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-4">
       <Avatar className="w-8 h-8 border border-primary">
          <AvatarFallback className="bg-transparent text-primary">
            <Bot className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
      <div className="flex items-center space-x-1.5 rounded-lg bg-card px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
        <div className="h-2 w-2 rounded-full bg-muted-foreground typing-dot" />
      </div>
    </div>
  );
}
