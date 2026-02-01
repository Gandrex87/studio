
"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Clock, Compass, Shield } from "lucide-react";

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
}

export function WelcomeScreen({ onStartSession, isLoading }: WelcomeScreenProps) {
  return (
    // NOTA 1: Agregamos 'relative' y 'overflow-hidden' aquí
    <div className="relative overflow-hidden flex flex-col items-center justify-center h-full text-center p-4 bg-[#E6EDFA]">
      
      {/* --- NUEVO FONDO: Orbes de luz difuminados --- */}
      {/* Estos elementos son decorativos y están detrás del contenido (z-0) */}
      
      {/* Orbe Azul - Arriba a la derecha */}
      <div 
        className="absolute top-0 right-0 -mt-40 -mr-40 w-96 h-96 rounded-full bg-[#2aa8d8] opacity-30 filter blur-[128px] pointer-events-none z-0"
        aria-hidden="true"
      ></div>
      
      {/* Orbe Naranja - Abajo a la izquierda (un poco más grande y sutil) */}
      <div 
        className="absolute bottom-0 left-0 -mb-60 -ml-40 w-[30rem] h-[30rem] rounded-full bg-[#fc7c04] opacity-20 filter blur-[128px] pointer-events-none z-0"
        aria-hidden="true"
      ></div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      {/* NOTA 2: Agregamos 'relative z-10' para asegurar que el contenido esté sobre el fondo */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center">
        <div className="w-2/3 max-w-xs md:max-w-sm mb-4">
          <img
            src="/logo2.png"
            //src="/need.svg" // para NeedCarhelp
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
          //className="bg-[#fc7c04] hover:bg-[#0c1c3c] text-white transition-colors duration-300 shadow-lg shadow-orange-500/25 border-none text-lg font-bold px-5 py-3 h-auto" // Para nEEDcARHELP
          className="bg-[#00aeef] hover:bg-[#0c1c3c] text-white transition-colors duration-300 shadow-lg shadow-[#00aeef]/25 border-none text-lg font-bold px-5 py-3 h-auto"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />} {/* Ajusté un poco el icono también */}
          Inicia la conversación
        </Button>
      </div>

      {/* --- FOOTER DE ICONOS --- */}
      {/* NOTA 3: También agregamos 'relative z-10' aquí */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex justify-center items-start gap-8 pb-8 pt-4">
        <div className="flex flex-col items-center text-[#0c1c3c] max-w-xs group">
          <Clock className="w-8 h-8 mb-2 transition-transform group-hover:scale-110 duration-300" />
          <span className="font-semibold">Ahorra tiempo</span>
        </div>
        <div className="flex flex-col items-center text-[#0c1c3c] max-w-xs group">
          <Compass className="w-8 h-8 mb-2 transition-transform group-hover:scale-110 duration-300" />
          <span className="font-semibold">Decide con independencia</span>
        </div>
        <div className="flex flex-col items-center text-[#0c1c3c] max-w-xs group">
          <Shield className="w-8 h-8 mb-2 transition-transform group-hover:scale-110 duration-300" />
          <span className="font-semibold">Compra con seguridad</span>
        </div>
      </div>
    </div>
  );
}