"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartSession, isLoading }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#E6EDFA]">
       <div className="w-2/3 max-w-xs md:max-w-sm mb-4">
        <img
          src="/need.svg"
          alt="CarBlau AI Logo"
          width="576"
          height="476"
          className="w-full h-auto"
        />
      </div>
      {/* ✅ CORREGIDO: Se ha separado el texto en un <span> para aplicar un color diferente */}
      <p className="text-lg mb-8 max-w-md text-[#0c1c3c]">
       <span className="font-bold text-[#fc7c04]">Powered by CarBlau</span> <br /> Tu asistente inteligente para que encuentres el coche ideal.
      </p>
      <Button 
        size="lg" 
        onClick={onStartSession} 
        disabled={isLoading}
        className="bg-[#0c1c3c] hover:bg-[#2aa8d8] text-white"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Inicia la conversación
      </Button>
    </div>
  );
}
