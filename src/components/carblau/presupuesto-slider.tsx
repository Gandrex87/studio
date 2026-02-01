"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, Banknote, CircleDollarSign, TrendingUp, Gem, Crown } from "lucide-react";

interface PresupuestoSliderProps {
  onSelect: (presupuestoText: string) => void;
  isLoading: boolean;
}

const PRESUPUESTO_OPTIONS = [
  {
    value: "Entre 5.000 y 10.000 euros",
    min: 5000,
    max: 10000,
    icon: Wallet,
    label: "5-10k",
    description: "Básico",
    subtitle: "Entrada",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: "Entre 10.000 y 20.000 euros",
    min: 10000,
    max: 20000,
    icon: Banknote,
    label: "10-20k",
    description: "Medio",
    subtitle: "Equilibrado",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: "Entre 20.000 y 30.000 euros",
    min: 20000,
    max: 30000,
    icon: CircleDollarSign,
    label: "20-30k",
    description: "Alto",
    subtitle: "Completo",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  {
    value: "Entre 30.000 y 40.000 euros",
    min: 30000,
    max: 40000,
    icon: TrendingUp,
    label: "30-40k",
    description: "Premium",
    subtitle: "Ejecutivo",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  {
    value: "Entre 40.000 y 60.000 euros",
    min: 40000,
    max: 60000,
    icon: Gem,
    label: "40-60k",
    description: "Lujo",
    subtitle: "Alta gama",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
  },
  {
    value: "Más de 60.000 euros",
    min: 60000,
    max: 150000,
    icon: Crown,
    label: "60k+",
    description: "Exclusivo",
    subtitle: "Sin límites",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
  },
];

export function PresupuestoSlider({ onSelect, isLoading }: PresupuestoSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (isLoading) return;
    
    setSelectedIndex(index);
    const option = PRESUPUESTO_OPTIONS[index];
    
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
          Selecciona tu rango de presupuesto
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative px-4 py-8 overflow-x-auto no-scrollbar">
        <div className="min-w-[800px] lg:min-w-0">
          {/* Línea de conexión */}
          <div className="absolute top-1/2 left-8 right-8 h-1.5 rounded-full -translate-y-1/2 opacity-40"
               style={{
                 background: 'linear-gradient(to right, #93c5fd, #86efac, #fdba74, #c084fc, #f9a8d4, #fcd34d)'
               }} />

          {/* Línea de progreso */}
          {selectedIndex !== null && (
            <motion.div
              className="absolute top-1/2 left-8 h-1.5 rounded-full -translate-y-1/2"
              style={{
                background: 'linear-gradient(to right, #3b82f6, #22c55e, #f97316, #a855f7, #ec4899, #f59e0b)'
              }}
              initial={{ width: 0 }}
              animate={{
                width: `calc(${(selectedIndex / (PRESUPUESTO_OPTIONS.length - 1)) * 100}% - 2rem)`,
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          )}

          {/* Opciones */}
          <div className="relative grid grid-cols-6 gap-2">
            {PRESUPUESTO_OPTIONS.map((option, index) => {
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
                  className="relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                >
                  {/* Icono Container - Fondo blanco sólido */}
                  <motion.div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm
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
                    <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>

                  {/* Label con fondo para legibilidad */}
                  <div className="text-center bg-white/60 backdrop-blur-[2px] rounded-lg px-1 py-1">
                    <div
                      className={`
                        text-xs font-bold transition-colors
                        ${isActive ? "text-[#082144]" : "text-slate-700"}
                      `}
                    >
                      {option.label}
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      {option.description}
                    </div>
                  </div>

                  {/* Indicador */}
                  {isSelected && (
                    <motion.div
                      layoutId="presupuesto-selected"
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
      </div>

      {/* Botón "Otra cantidad" */}
      <div className="flex justify-center pt-2">
        <motion.button
          onClick={() => onSelect("Prefiero indicar una cantidad específica")}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 shadow-sm hover:text-[#082144] hover:border-[#082144] hover:bg-slate-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoading ? 1 : 1.03 }}
          whileTap={{ scale: isLoading ? 1 : 0.97 }}
        >
          💬 Prefiero indicar una cantidad específica
        </motion.button>
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
              {PRESUPUESTO_OPTIONS[selectedIndex].label} €
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {PRESUPUESTO_OPTIONS[selectedIndex].subtitle}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}