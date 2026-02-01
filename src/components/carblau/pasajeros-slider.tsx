"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Users } from "lucide-react";

interface PasajerosSliderProps {
  onSelect: (numText: string) => void;
  isLoading: boolean;
}

const PASAJEROS_OPTIONS = [
  {
    value: "1 persona",
    num: 1,
    icon: User,
    label: "1",
    description: "Solo 1 pasajero",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: "2 personas",
    num: 2,
    icon: Users,
    label: "2",
    description: "2 pasajeros",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: "3 personas",
    num: 3,
    icon: Users,
    label: "3",
    description: "3 pasajeros",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  {
    value: "4 o más",
    num: 4,
    icon: Users,
    label: "4+",
    description: "4 o más pasajeros",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
];

export function PasajerosSlider({ onSelect, isLoading }: PasajerosSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (isLoading) return;
    
    setSelectedIndex(index);
    const option = PASAJEROS_OPTIONS[index];
    
    setTimeout(() => {
      onSelect(option.value);
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mb-4"
    >
      {/* Título Estilo Cápsula */}
      <div className="flex justify-center">
        <div className="text-sm font-semibold text-slate-800 text-center bg-white/80 backdrop-blur-sm py-1 px-4 rounded-full border border-white/20 shadow-sm">
          Selecciona cuántos pasajeros sueles llevar
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative px-4 py-8">
        {/* Línea de conexión */}
        <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gradient-to-r from-blue-300 via-green-300 via-orange-300 to-purple-300 rounded-full -translate-y-1/2 opacity-40" />

        {/* Línea de progreso */}
        {selectedIndex !== null && (
          <motion.div
            className="absolute top-1/2 left-8 h-1.5 bg-gradient-to-r from-blue-500 via-green-500 via-orange-500 to-purple-500 rounded-full -translate-y-1/2"
            initial={{ width: 0 }}
            animate={{
              width: `calc(${(selectedIndex / (PASAJEROS_OPTIONS.length - 1)) * 100}% - 2rem)`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}

        {/* Opciones */}
        <div className="relative grid grid-cols-4 gap-2">
          {PASAJEROS_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedIndex === index;
            const isHovered = hoveredIndex === index;
            const isActive = isSelected || isHovered;

            return (
              <motion.button
                key={index}
                onClick={() => handleSelect(index)}
                onMouseEnter={() => !isLoading && setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                disabled={isLoading}
                className="relative flex flex-col items-center gap-2 p-1 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
              >
                {/* Icono Container */}
                <motion.div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-sm
                    ${isActive ? option.bgColor : "bg-white"}
                    ${isActive ? option.borderColor : "border-slate-200"}
                    ${isActive ? option.color : "text-slate-400"}
                    transition-all duration-200
                  `}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    rotate: isSelected ? [0, -10, 10, -10, 0] : 0,
                  }}
                  transition={{
                    scale: { duration: 0.2 },
                    rotate: { duration: 0.5 },
                  }}
                >
                  <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>

                {/* Label */}
                <div className="text-center bg-white/60 backdrop-blur-[2px] rounded-lg px-1 py-1">
                  <div
                    className={`
                      text-lg font-bold transition-colors
                      ${isActive ? "text-[#082144]" : "text-slate-700"}
                    `}
                  >
                    {option.label}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {option.description}
                  </div>
                </div>

                {/* Indicador */}
                {isSelected && (
                  <motion.div
                    layoutId="pasajeros-selected"
                    className={`absolute -bottom-2 w-2 h-2 rounded-full ${option.color.replace('text-', 'bg-')}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Feedback */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm mx-4"
        >
          <div className="text-sm">
            <span className="text-slate-500">Has seleccionado: </span>
            <span className="font-bold text-[#082144]">
              {PASAJEROS_OPTIONS[selectedIndex].value}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}