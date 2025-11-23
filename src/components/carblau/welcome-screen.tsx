"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Clock, Compass, Shield } from "lucide-react";

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartSession, isLoading }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#E6EDFA]">
      <div className="flex-grow flex flex-col items-center justify-center">
        <div className="w-2/3 max-w-xs md:max-w-sm mb-4">
          <img
            src="/need.svg"
            alt="CarBlau AI Logo"
            width="576"
            height="476"
            className="w-full h-auto"
          />
        </div>
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

      <div className="w-full max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8">
        <div className="flex flex-col items-center text-[#0c1c3c]">
          <Clock className="w-8 h-8 mb-2" />
          <span className="font-semibold">Ahorra tiempo</span>
        </div>
        <div className="flex flex-col items-center text-[#0c1c3c]">
          <Compass className="w-8 h-8 mb-2" />
          <span className="font-semibold">Decide con independencia</span>
        </div>
        <div className="flex flex-col items-center text-[#0c1c3c]">
          <Shield className="w-8 h-8 mb-2" />
          <span className="font-semibold">Compra con seguridad</span>
        </div>
      </div>
    </div>
  );
}
