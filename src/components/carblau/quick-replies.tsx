"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface QuickRepliesProps {
  options: string[];
  onSelect: (option: string) => void;
  isLoading: boolean;
  multiSelect?: boolean;
  submitLabel?: string;
}

const INDIFERENTE = "🤷 Indiferente";

export function QuickReplies({
  options,
  onSelect,
  isLoading,
  multiSelect,
  submitLabel,
}: QuickRepliesProps) {
  const [selected, setSelected] = useState<string[]>([]);

  if (!options || options.length === 0) return null;

  if (!multiSelect) {
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
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(option)}
              disabled={isLoading}
              className="whitespace-normal text-left bg-white text-slate-900 border-slate-300 shadow-sm hover:bg-[#082144] hover:text-white transition-all"
            >
              {option}
            </Button>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  const toggle = (option: string) => {
    if (option === INDIFERENTE) {
      setSelected((prev) =>
        prev.includes(INDIFERENTE) ? [] : [INDIFERENTE]
      );
    } else {
      setSelected((prev) => {
        const withoutIndiferente = prev.filter((o) => o !== INDIFERENTE);
        return withoutIndiferente.includes(option)
          ? withoutIndiferente.filter((o) => o !== option)
          : [...withoutIndiferente, option];
      });
    }
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    onSelect(selected.join(" y "));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-3 mb-3"
    >
      <div className="flex flex-wrap gap-2 justify-center">
        {options.map((option, index) => {
          const isSelected = selected.includes(option);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggle(option)}
                disabled={isLoading}
                className={`whitespace-normal text-left border shadow-sm transition-all ${
                  isSelected
                    ? "bg-[#082144] text-white border-[#082144]"
                    : "bg-white text-slate-900 border-slate-300 hover:bg-[#082144] hover:text-white"
                }`}
              >
                {isSelected && <Check className="mr-1 h-3 w-3 shrink-0" />}
                {option}
              </Button>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-center">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isLoading || selected.length === 0}
          className="bg-[#082144] text-white hover:bg-[#082144]/90 disabled:opacity-40 transition-all px-6"
        >
          {submitLabel ?? "Continuar"}
        </Button>
      </div>
    </motion.div>
  );
}
