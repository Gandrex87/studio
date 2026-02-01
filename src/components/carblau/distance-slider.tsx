"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Building2, Route, MapPin } from "lucide-react";

interface DistanceSliderProps {
  onSelect: (distance: string) => void;
  isLoading: boolean;
}

const DISTANCE_OPTIONS = [
  {
    value: "Menos de 10 km",
    icon: Home,
    label: "Menos de 10 km",
    description: "Trayectos muy cortos",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: "Entre 10 y 50 km",
    icon: Building2,
    label: "Entre 10 y 50 km",
    description: "Trayectos medios ",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: "Entre 51 y 150 km",
    icon: Route,
    label: "Entre 51 y 150 km",
    description: "Trayectos largos",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  {
    value: "Más de 150 km",
    icon: MapPin,
    label: "Más de 150 km",
    description: "Largas distancias",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
];

export function DistanceSlider({ onSelect, isLoading }: DistanceSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (isLoading) return;
    
    setSelectedIndex(index);
    const option = DISTANCE_OPTIONS[index];
    
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
      {/* Título con fondo cápsula para leerse sobre el patrón */}
      <div className="flex justify-center">
        <div className="text-sm font-semibold text-slate-800 text-center bg-white/80 backdrop-blur-sm py-1 px-4 rounded-full border border-white/20 shadow-sm">
          Selecciona la distancia de tus trayectos habituales
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative px-4 py-8">
        {/* Línea de conexión */}
        <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gradient-to-r from-green-300 via-blue-300 via-orange-300 to-purple-300 rounded-full -translate-y-1/2 opacity-40" />

        {/* Línea de progreso */}
        {selectedIndex !== null && (
          <motion.div
            className="absolute top-1/2 left-8 h-1.5 bg-gradient-to-r from-green-500 via-blue-500 via-orange-500 to-purple-500 rounded-full -translate-y-1/2"
            initial={{ width: 0 }}
            animate={{
              width: `${(selectedIndex / (DISTANCE_OPTIONS.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}

        {/* Opciones */}
        <div className="relative grid grid-cols-4 gap-2">
          {DISTANCE_OPTIONS.map((option, index) => {
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
                    ${isActive ? option.bgColor : "bg-white"} // Inactivo: blanco sólido
                    ${isActive ? option.borderColor : "border-slate-200"}
                    ${isActive ? option.color : "text-slate-400"}
                    transition-all duration-200
                  `}
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    rotate: isSelected ? [0, -10, 10, -10, 0] : 0,
                  }}
                >
                  <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>

                {/* Label */}
                <div className="text-center bg-white/60 backdrop-blur-[2px] rounded-lg px-1 py-1">
                  <div
                    className={`
                      text-xs font-bold transition-colors
                      ${isActive ? "text-[#082144]" : "text-slate-600"}
                    `}
                  >
                    {option.label}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {option.description}
                  </div>
                </div>

                {/* Indicador de selección */}
                {isSelected && (
                  <motion.div
                    layoutId="selected-indicator"
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

      {/* Feedback de la selección */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          // Fondo blanco sólido para tapar el patrón
          className="text-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm mx-4"
        >
          <div className="text-sm">
            <span className="text-slate-500">Has seleccionado: </span>
            <span className="font-bold text-[#082144]">
              {DISTANCE_OPTIONS[selectedIndex].value}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}