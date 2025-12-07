"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Home, Building2, Route, MapPin } from "lucide-react";
// O también puedes usar: Navigation, Route, Map

interface DistanceSliderProps {
  onSelect: (distance: string) => void;
  isLoading: boolean;
}

const DISTANCE_OPTIONS = [
  {
    value: "Menos de 10 km",
    icon: Home,
    label: "Menos de 10 km",
    description: "Trayectos cortos",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: "Entre 10 y 50 km",
    icon: Building2,
    label: "Entre 10 y 50 km",
    description: "Área metropolitana",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: "Entre 51 y 150 km",
    icon: Route,
    label: "Carretera",
    description: "Entre 51 y 150 km",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  {
    value: "Más de 150 km",
    icon: MapPin,
    label: "Largas distancias",
    description: "Más de 150 km",
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
    
    // Pequeño delay para que el usuario vea la selección antes de enviar
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
      {/* Título */}
      <div className="text-sm font-medium text-muted-foreground text-center">
        Selecciona la distancia de tus trayectos habituales
      </div>

      {/* Slider Container */}
      <div className="relative px-4 py-8">
        {/* Línea de conexión - Gradiente */}
        <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-gradient-to-r from-green-300 via-blue-300 via-orange-300 to-purple-300 rounded-full -translate-y-1/2 opacity-40" />

        {/* Línea de progreso (hasta la opción seleccionada) */}
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
                className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                whileTap={{ scale: isLoading ? 1 : 0.95 }}
              >
                {/* Icono Container */}
                <motion.div
                  className={`
                    w-14 h-14 rounded-full flex items-center justify-center border-2
                    ${isActive ? option.bgColor : "bg-gray-50"}
                    ${isActive ? option.borderColor : "border-gray-200"}
                    ${isActive ? option.color : "text-gray-400"}
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
                <div className="text-center">
                  <div
                    className={`
                      text-xs font-semibold transition-colors
                      ${isActive ? "text-foreground" : "text-muted-foreground"}
                    `}
                  >
                    {option.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-tight">
                    {option.description}
                  </div>
                </div>

                {/* Indicador de selección (punto debajo) */}
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
          className="text-center p-3 bg-muted/50 rounded-lg"
        >
          <div className="text-sm">
            <span className="text-muted-foreground">Has seleccionado: </span>
            <span className="font-semibold text-foreground">
              {DISTANCE_OPTIONS[selectedIndex].value}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}