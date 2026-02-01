"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, CreditCard, Banknote, CircleDollarSign, TrendingUp, Gem, Crown } from "lucide-react";

interface PresupuestoUnificadoProps {
  onSelect: (presupuestoText: string) => void;
  isLoading: boolean;
}

// Tipos de pago
type TipoPago = "contado" | "financiado";

// Interfaz para los rangos
interface RangoPresupuesto {
  value: number;
  min: number;
  max: number;
  icon: any;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

// ═══════════════════════════════════════════════════════════════════
// RANGOS PARA CONTADO (montos totales)
// ═══════════════════════════════════════════════════════════════════

const RANGOS_CONTADO: RangoPresupuesto[] = [
  {
    value: 10000,
    min: 5000,
    max: 10000,
    icon: Wallet,
    label: "5-10k",
    description: "Básico",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: 20000,
    min: 10000,
    max: 20000,
    icon: Banknote,
    label: "10-20k",
    description: "Medio",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: 30000,
    min: 20000,
    max: 30000,
    icon: CircleDollarSign,
    label: "20-30k",
    description: "Alto",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  {
    value: 40000,
    min: 30000,
    max: 40000,
    icon: TrendingUp,
    label: "30-40k",
    description: "Premium",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  {
    value: 60000,
    min: 40000,
    max: 60000,
    icon: Gem,
    label: "40-60k",
    description: "Lujo",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
  },
  {
    value: 100000,
    min: 60000,
    max: 150000,
    icon: Crown,
    label: "60k+",
    description: "Exclusivo",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
  },
];

// ═══════════════════════════════════════════════════════════════════
// RANGOS PARA FINANCIADO (cuotas mensuales)
// ═══════════════════════════════════════════════════════════════════

const RANGOS_FINANCIADO: RangoPresupuesto[] = [
  {
    value: 300,
    min: 200,
    max: 300,
    icon: Wallet,
    label: "200-300€",
    description: "Básico",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
  },
  {
    value: 400,
    min: 300,
    max: 400,
    icon: Banknote,
    label: "300-400€",
    description: "Medio",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
  },
  {
    value: 500,
    min: 400,
    max: 500,
    icon: CircleDollarSign,
    label: "400-500€",
    description: "Alto",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
  },
  {
    value: 700,
    min: 500,
    max: 700,
    icon: TrendingUp,
    label: "500-700€",
    description: "Premium",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
  },
  {
    value: 1000,
    min: 700,
    max: 1500,
    icon: Gem,
    label: "700€+",
    description: "Lujo",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
  },
];

export function PresupuestoUnificado({ onSelect, isLoading }: PresupuestoUnificadoProps) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPago>("contado");
  const [rangoSeleccionado, setRangoSeleccionado] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Rangos dinámicos según el tipo de pago
  const rangos = tipoSeleccionado === "contado" ? RANGOS_CONTADO : RANGOS_FINANCIADO;

  const handleConfirmar = () => {
    if (isLoading || rangoSeleccionado === null) return;

    // Construir objeto de datos
    const data = {
      tipo: tipoSeleccionado,
      ...(tipoSeleccionado === "contado" 
        ? { pago_contado: rangoSeleccionado } 
        : { cuota_max: rangoSeleccionado }
      )
    };

    // Enviar como JSON string
    onSelect(JSON.stringify(data));
  };

  const handleRangoSelect = (value: number) => {
    if (isLoading) return;
    setRangoSeleccionado(value);
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
          ¿Cómo prefieres pagar el coche?
        </div>
      </div>

      {/* Tabs de tipo de pago */}
      <div className="flex gap-2 p-1 bg-white/60 backdrop-blur-md rounded-lg border border-white/40 shadow-sm">
        <button
          onClick={() => {
            if (!isLoading) {
              setTipoSeleccionado("contado");
              setRangoSeleccionado(null); 
            }
          }}
          disabled={isLoading}
          className={`
            flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all
            ${tipoSeleccionado === "contado"
              ? "bg-[#082144] shadow-md text-white" // Activo: Azul Oscuro
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50" // Inactivo: Texto gris
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <Wallet className="w-4 h-4" />
            <span>Al contado</span>
          </div>
        </button>

        <button
          onClick={() => {
            if (!isLoading) {
              setTipoSeleccionado("financiado");
              setRangoSeleccionado(null); 
            }
          }}
          disabled={isLoading}
          className={`
            flex-1 py-3 px-4 rounded-md font-semibold text-sm transition-all
            ${tipoSeleccionado === "financiado"
              ? "bg-[#082144] shadow-md text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Financiado</span>
          </div>
        </button>
      </div>

      {/* Subtítulo dinámico */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tipoSeleccionado}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex justify-center"
        >
          <div className="text-xs text-slate-600 text-center bg-white/40 backdrop-blur-[1px] px-3 py-1 rounded-full">
            {tipoSeleccionado === "contado"
              ? "Selecciona el rango de tu presupuesto total"
              : "Selecciona tu cuota mensual máxima"
            }
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slider de rangos */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tipoSeleccionado}
          initial={{ opacity: 0, x: tipoSeleccionado === "contado" ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: tipoSeleccionado === "contado" ? 20 : -20 }}
          transition={{ duration: 0.3 }}
          className="relative px-4 py-6"
        >
          {/* Línea de conexión */}
          <div className="absolute top-1/2 left-8 right-8 h-1.5 rounded-full -translate-y-1/2 opacity-40"
               style={{
                 background: tipoSeleccionado === "contado"
                   ? 'linear-gradient(to right, #93c5fd, #86efac, #fdba74, #c084fc, #f9a8d4, #fcd34d)'
                   : 'linear-gradient(to right, #93c5fd, #86efac, #fdba74, #c084fc, #f9a8d4)'
               }} />

          {/* Grid de opciones */}
          <div className={`relative grid gap-2 ${
            tipoSeleccionado === "contado" ? "grid-cols-6" : "grid-cols-5"
          }`}>
            {rangos.map((rango, index) => {
              const Icon = rango.icon;
              const isSelected = rangoSeleccionado === rango.value;
              const isHovered = hoveredIndex === index;
              const isActive = isSelected || isHovered;

              return (
                <motion.button
                  key={`${tipoSeleccionado}-${index}`}
                  onClick={() => handleRangoSelect(rango.value)}
                  onMouseEnter={() => !isLoading && setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  disabled={isLoading}
                  className="relative flex flex-col items-center gap-2 p-2 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                  whileHover={{ scale: isLoading ? 1 : 1.05 }}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Icono con fondo blanco */}
                  <motion.div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-sm
                      ${isActive ? rango.bgColor : "bg-white"}
                      ${isActive ? rango.borderColor : "border-slate-200"}
                      ${isActive ? rango.color : "text-slate-400"}
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

                  {/* Label con fondo */}
                  <div className="text-center bg-white/60 backdrop-blur-[2px] rounded-lg px-1 py-1">
                    <div
                      className={`
                        text-xs font-bold transition-colors
                        ${isActive ? "text-[#082144]" : "text-slate-700"}
                      `}
                    >
                      {rango.label}
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      {rango.description}
                    </div>
                  </div>

                  {/* Indicador de selección */}
                  {isSelected && (
                    <motion.div
                      layoutId="presupuesto-unificado-selected"
                      className={`absolute -bottom-2 w-2 h-2 rounded-full ${rango.color.replace('text-', 'bg-')}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Feedback de selección */}
      <AnimatePresence>
        {rangoSeleccionado !== null && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm mx-4"
          >
            <div className="text-sm">
              <span className="text-slate-500">Has seleccionado: </span>
              <span className="font-bold text-[#082144]">
                {tipoSeleccionado === "contado" 
                  ? rangos.find(r => r.value === rangoSeleccionado)?.label + " €"
                  : rangos.find(r => r.value === rangoSeleccionado)?.label + "/mes"
                }
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {tipoSeleccionado === "contado" ? "Pago al contado" : "Cuota mensual"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón de confirmar */}
      <div className="flex justify-center pt-2">
        <motion.button
          onClick={handleConfirmar}
          disabled={isLoading || rangoSeleccionado === null}
          className={`
            px-6 py-3 rounded-lg font-semibold text-sm transition-all shadow-md
            ${rangoSeleccionado !== null && !isLoading
              ? "bg-[#082144] text-white hover:bg-[#082144]/90"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }
          `}
          whileHover={{ scale: rangoSeleccionado !== null && !isLoading ? 1.03 : 1 }}
          whileTap={{ scale: rangoSeleccionado !== null && !isLoading ? 0.97 : 1 }}
        >
          {isLoading ? "Procesando..." : "Confirmar selección"}
        </motion.button>
      </div>

      {/* Opción de cantidad específica */}
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
    </motion.div>
  );
}