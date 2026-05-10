"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Clock, Compass, Shield } from "lucide-react";

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartSession, isLoading }: WelcomeScreenProps) {
  return (
    <div className="relative overflow-hidden flex flex-col items-center justify-center h-full text-center p-4 bg-[#1C1714]">
      
      {/* --- FONDO: Orbes de luz difuminados --- */}
      <div 
        className="absolute top-0 right-0 -mt-40 -mr-40 w-96 h-96 rounded-full bg-[#2aa8d8] opacity-60 filter blur-[96px] pointer-events-none z-0"
        aria-hidden="true"
      ></div>
      
      <div 
        className="absolute bottom-0 left-0 -mb-60 -ml-40 w-[30rem] h-[30rem] rounded-full bg-[#fc7c04] opacity-40 filter blur-[96px] pointer-events-none z-0"
        aria-hidden="true"
      ></div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center">
        <div className="w-1/2 max-w-[200px] md:max-w-[240px] mb-4">
          <img
            src="/logo3.png"
            alt="CarBlau AI Logo"
            width="576"
            height="476"
            className="w-full h-auto"
          />
        </div>
        <p className="text-lg mb-8 max-w-md text-[#FFAD64]">
         <span className="font-bold text-[#FB8351]">Powered by CarBlau</span> <br /> Tu asistente inteligente para que encuentres el coche ideal.
        </p>
        <Button
          size="lg"
          onClick={onStartSession}
          disabled={isLoading}
          style={{ backgroundColor: "#ADD4D3" }}
          className="text-primary-foreground hover:opacity-90 text-md px-10 h-14 rounded-full transition-all shadow-xl shadow-primary/20 border-none font-semibold"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          Inicia la conversación
        </Button>
      </div>

      {/* --- FOOTER DE ICONOS --- */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex justify-center items-start gap-6 pb-8 pt-2">
        <div className="flex flex-col items-center text-[#F3EBDD] max-w-[100px] group">
          <Clock className="w-7 h-7 mb-1.5 transition-transform group-hover:scale-110 duration-300" />
          <span className="font-semibold text-[11px] leading-tight">Ahorra tiempo</span>
        </div>
        <div className="flex flex-col items-center text-[#F3EBDD] max-w-[100px] group">
          <Compass className="w-7 h-7 mb-1.5 transition-transform group-hover:scale-110 duration-300" />
          <span className="font-semibold text-[11px] leading-tight">Decide con independencia</span>
        </div>
        <div className="flex flex-col items-center text-[#F3EBDD] max-w-[100px] group">
          <Shield className="w-7 h-7 mb-1.5 transition-transform group-hover:scale-110 duration-300" />
          <span className="font-semibold text-[11px] leading-tight">Compra con seguridad</span>
        </div>
      </div>
    </div>
  );
}
