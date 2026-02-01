"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Car, Navigation, Plane } from "lucide-react";

interface KmAnualesSliderProps {
  onSelect: (kmText: string) => void;
  isLoading: boolean;
}

const KM_OPTIONS = [
  {
    value: "Sí, unos 10.000 km/año",
    km: 10000,
    icon: Building2,
    label: "5-10k km/año",
    description: "Poco",
    subtitle: "Uso urbano diario",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: "Sí, unos 15.000 km/año",
    km: 15000,
    icon: Car,
    label: "10-20k km/año",
    description: "Ocasional",
    subtitle: "Trayectos regulares",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: "Sí, unos 25.000 km/año",
    km: 25000,
    icon: Navigation,
    label: "20-30k km/año",
    description: "Moderado",
    subtitle: "Distancias largas",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  {
    value: "Sí, más de 30.000 km/año",
    km: 35000,
    icon: Plane,
    label: "30k+ km/año",
    description: "Intensivo",
    subtitle: "Uso muy intensivo",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
];

export function KmAnualesSlider({ onSelect, isLoading }: KmAnualesSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (isLoading) return;
    
    setSelectedIndex(index);
    const option = KM_OPTIONS[index];
    
    setTimeout(() => {
      onSelect(option.value);
    }, 300);
  };

  const handleNoSe = () => {
    if (isLoading) return;
    onSelect("❌ No lo sé, ayúdame a calcularlo");
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
          Selecciona cuánto usarías el coche aproximadamente
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
              width: `calc(${(selectedIndex / (KM_OPTIONS.length - 1)) * 100}% - 2rem)`,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        )}

        {/* Opciones */}
        <div className="relative grid grid-cols-4 gap-2">
          {KM_OPTIONS.map((option, index) => {
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
                    ${isActive ? option.bgColor : "bg-white"} // Blanco sólido si inactivo
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
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {option.description}
                  </div>
                </div>

                {/* Indicador */}
                {isSelected && (
                  <motion.div
                    layoutId="km-selected-indicator"
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

      {/* Botón "No lo sé" - Estilizado blanco/azul */}
      <div className="flex justify-center pt-2">
        <motion.button
          onClick={handleNoSe}
          disabled={isLoading}
          className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 shadow-sm hover:text-[#082144] hover:border-[#082144] hover:bg-slate-50 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoading ? 1 : 1.03 }}
          whileTap={{ scale: isLoading ? 1 : 0.97 }}
        >
          ❌ No lo sé, ayúdame a calcularlo
        </motion.button>
      </div>

      {/* Feedback de la selección */}
      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm mx-4"
        >
          <div className="text-sm">
            <span className="text-slate-500">Has seleccionado: </span>
            <span className="font-bold text-[#082144]">
              {KM_OPTIONS[selectedIndex].description}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {KM_OPTIONS[selectedIndex].subtitle}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}