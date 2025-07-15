"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartSession, isLoading }: WelcomeScreenProps) {
  return (
    // ✅ CORREGIDO: Añadida la clase bg-[#E6EDFA] para cambiar el color de fondo.
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#E6EDFA]">
       {/* ✅ CORREGIDO: Contenedor del logo hecho responsive para adaptarse a todas las pantallas */}
       <div className="w-2/3 max-w-xs md:max-w-sm mb-4">
        <img
          src="/logo2.png"
          alt="CarBlau AI Logo"
          width="576"
          height="576"
          className="w-full h-auto"
        />
      </div>
      <p className="text-lg mb-8 max-w-md text-[#0c1c3c]">
      Tu asistente inteligente para que encuentres el coche ideal.
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