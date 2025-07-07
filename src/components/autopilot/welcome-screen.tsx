"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from 'next/image';

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartSession, isLoading }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
       <div className="w-24 h-24 mb-4 rounded-xl bg-primary/20 flex items-center justify-center">
        {/*
          Step 1: Convert your logo to a Data URI. You can use a site like https://www.base64-image.de/
          Step 2: Copy the generated string for <img> elements.
          Step 3: Paste that string below, replacing the placeholder text.
        */}
        <img 
          src="PASTE_YOUR_DATA_URI_HERE" 
          alt="CarBlau AI Logo" 
          width="96" 
          height="96" 
        />
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
