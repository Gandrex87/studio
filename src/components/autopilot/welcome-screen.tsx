"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartSession, isLoading }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
       <div className="w-24 h-24 mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="64" 
          height="64" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="hsl(var(--primary))" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
          <circle cx="7" cy="17" r="2"/>
          <path d="M9 17h6"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2 text-primary">
        CarBlau AI
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
      Tu asistente inteligente para encontrar el auto ideal.
      </p>
      <Button size="lg" onClick={onStartSession} disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Inicia la conversación
      </Button>
    </div>
  );
}
