"use client";

import { useState } from "react";
import { BOTON_PRIMARIO, CHIP_ACTIVO, CHIP_NORMAL, ENLACE_SECUNDARIO } from "@/components/carblau/quick-replies";
import { miles } from "@/lib/texto";

interface PresupuestoUnificadoProps {
  onSelect: (presupuestoText: string) => void;
  isLoading: boolean;
}

type TipoPago = "contado" | "financiado";

interface Rango {
  valor: number;
  etiqueta: string;
}

// Importes: los mismos que entiende el backend (interpretar_presupuesto) y que
// ofrecen los canales de mensajería (canales/opciones.py del agente)
const CONTADO: Rango[] = [
  { valor: 10000, etiqueta: "5–10 mil €" },
  { valor: 20000, etiqueta: "10–20 mil €" },
  { valor: 30000, etiqueta: "20–30 mil €" },
  { valor: 40000, etiqueta: "30–40 mil €" },
  { valor: 60000, etiqueta: "40–60 mil €" },
  { valor: 100000, etiqueta: "Más de 60 mil €" },
];

const FINANCIADO: Rango[] = [
  { valor: 300, etiqueta: "200–300 €/mes" },
  { valor: 400, etiqueta: "300–400 €/mes" },
  { valor: 500, etiqueta: "400–500 €/mes" },
  { valor: 700, etiqueta: "500–700 €/mes" },
  { valor: 1000, etiqueta: "700–1.000 €/mes" },
];

// Texto que se envía (y que ve el usuario en su burbuja). El backend lo
// interpreta de forma determinista: mismo formato que texto_presupuesto().
export function textoPresupuesto(tipo: TipoPago, importe: number): string {
  return tipo === "contado"
    ? `💰 Al contado · hasta ${miles(importe)} €`
    : `💳 Financiado · hasta ${miles(importe)} €/mes`;
}

const SEGMENTO =
  "h-10 rounded-[9px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-blau disabled:opacity-50";

export function PresupuestoUnificado({ onSelect, isLoading }: PresupuestoUnificadoProps) {
  const [tipo, setTipo] = useState<TipoPago>("contado");
  const [seleccion, setSeleccion] = useState<number | null>(null);

  const rangos = tipo === "contado" ? CONTADO : FINANCIADO;
  const elegido = rangos.find((r) => r.valor === seleccion) ?? null;

  const cambiarTipo = (nuevo: TipoPago) => {
    if (isLoading || nuevo === tipo) return;
    setTipo(nuevo);
    setSeleccion(null);
  };

  const confirmar = () => {
    if (isLoading || seleccion === null) return;
    onSelect(textoPresupuesto(tipo, seleccion));
  };

  return (
    <div className="flex flex-col gap-3.5">
      <div
        role="group"
        aria-label="Forma de pago"
        className="grid grid-cols-2 gap-1 rounded-xl bg-cb-espresso/[0.08] p-1"
      >
        <button
          type="button"
          aria-pressed={tipo === "contado"}
          onClick={() => cambiarTipo("contado")}
          disabled={isLoading}
          className={`${SEGMENTO} ${tipo === "contado" ? "bg-cb-espresso text-cb-crema" : "text-cb-espresso hover:bg-cb-espresso/10"}`}
        >
          Al contado
        </button>
        <button
          type="button"
          aria-pressed={tipo === "financiado"}
          onClick={() => cambiarTipo("financiado")}
          disabled={isLoading}
          className={`${SEGMENTO} ${tipo === "financiado" ? "bg-cb-espresso text-cb-crema" : "text-cb-espresso hover:bg-cb-espresso/10"}`}
        >
          Financiado
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.06em] text-cb-tinta">
          {tipo === "contado" ? "Presupuesto total" : "Cuota mensual máxima"}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {rangos.map((rango) => {
            const activo = rango.valor === seleccion;
            return (
              <button
                key={`${tipo}-${rango.valor}`}
                type="button"
                aria-pressed={activo}
                onClick={() => !isLoading && setSeleccion(rango.valor)}
                disabled={isLoading}
                className={`${activo ? CHIP_ACTIVO : CHIP_NORMAL} px-2`}
              >
                {rango.etiqueta}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-1">
        <button
          type="button"
          onClick={confirmar}
          disabled={isLoading || seleccion === null}
          className={BOTON_PRIMARIO}
        >
          {isLoading
            ? "Enviando…"
            : elegido
              ? `Confirmar: hasta ${miles(elegido.valor)} €${tipo === "financiado" ? "/mes" : ""}`
              : "Elige un rango"}
        </button>
        <button
          type="button"
          onClick={() => onSelect("Prefiero indicar una cantidad específica")}
          disabled={isLoading}
          className={ENLACE_SECUNDARIO}
        >
          Prefiero escribir una cantidad
        </button>
      </div>
    </div>
  );
}
