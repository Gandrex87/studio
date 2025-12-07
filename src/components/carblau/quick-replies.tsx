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
      //className="flex flex-wrap gap-2 mb-3"
      className="flex flex-wrap gap-2 mb-3 justify-center"  // ✅ Añadir justify-center
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
            className="whitespace-normal text-left"  // ✅ Opcional: permitir texto multi-línea
            //className="text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {option}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}