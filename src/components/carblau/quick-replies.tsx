"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
  isLoading: boolean;
}

export function QuickReplies({ options, onSelect, isLoading }: QuickRepliesProps) {
  if (!options || options.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap gap-2 mb-3 justify-center"
    >
      {options.map((option, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: index * 0.05,
            duration: 0.2
          }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect(option)}
            disabled={isLoading}
            // 🎨 ESTILOS ACTUALIZADOS:
            // bg-white: Fondo blanco sólido para tapar el patrón de fondo.
            // text-slate-900: Texto oscuro legible.
            // border-slate-300: Borde sutil.
            // hover:... : Al pasar el mouse se vuelve Azul Oscuro con texto blanco.
            className="whitespace-normal text-left bg-white text-slate-900 border-slate-300 shadow-sm hover:bg-[#082144] hover:text-white transition-all"
          >
            {option}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}