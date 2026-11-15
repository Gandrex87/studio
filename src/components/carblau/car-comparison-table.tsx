"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import type { CarComparisonData } from "@/lib/tipos";
import { nombreLimpio, numeroFicha, sinEmoji } from "@/lib/texto";

export type { CarComparisonData };

interface CarComparisonTableProps {
  data: CarComparisonData;
  /** Fase 2: «Me interesa» desde la comparativa (los coches traen carId) */
  onInteresa?: (carId: string) => void;
  disabled?: boolean;
}

// Comparativa de 2–3 coches dentro de la tarjeta del asesor. Cada fila lleva
// su etiqueta encima y los valores en columnas; el mejor (mejor_idx) va en
// aguamarina con una marca. Pensada para 390 px: sin scroll horizontal.
export function CarComparisonTable({ data, onInteresa, disabled = false }: CarComparisonTableProps) {
  const { coches, categorias } = data;
  if (coches.length === 0) return null;
  const columnas = { gridTemplateColumns: `repeat(${coches.length}, minmax(0, 1fr))` };

  return (
    <section aria-label="Tabla comparativa" className="flex flex-col font-body">
      {data.veredicto && (
        <div className="mb-3 flex flex-col gap-1 rounded-xl bg-cb-agua/40 px-3.5 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-cb-tinta">Nuestro criterio</span>
          <p className="font-headline text-[16px] leading-[1.45] text-cb-espresso">{data.veredicto}</p>
        </div>
      )}

      <div className="grid gap-2 border-b border-cb-espresso/10 pb-2.5" style={columnas}>
        {coches.map((coche) => {
          const n = numeroFicha(coche.nombre) ?? coche.indice;
          return (
            <div key={coche.indice} className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-cb-tinta">Coche {n}</span>
              <span className="font-headline text-[15px] font-semibold leading-tight">
                {nombreLimpio(coche.nombre)}
              </span>
              {onInteresa && coche.carId && (
                <button
                  type="button"
                  onClick={() => onInteresa(coche.carId as string)}
                  disabled={disabled}
                  className="mt-auto inline-flex h-9 items-center justify-center self-start rounded-full bg-cb-agua px-3.5 text-[13px] font-bold text-cb-navy transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-espresso disabled:opacity-50"
                >
                  Me interesa
                </button>
              )}
            </div>
          );
        })}
      </div>

      {categorias.map((cat, catIdx) => (
        <Fragment key={`${cat.nombre}-${catIdx}`}>
          <h4
            className={`pb-1 pt-3 text-xs font-bold uppercase tracking-[0.08em] text-cb-tinta ${
              catIdx > 0 ? "mt-1 border-t-2 border-cb-espresso/[0.14]" : ""
            }`}
          >
            {sinEmoji(cat.nombre)}
          </h4>
          {cat.filas.map((fila, filaIdx) => (
            <div
              key={`${fila.etiqueta}-${filaIdx}`}
              className="flex flex-col gap-1 border-t border-cb-espresso/[0.08] py-2"
            >
              <span className="text-[13px] text-cb-tinta">{fila.etiqueta}</span>
              <div className="grid gap-2" style={columnas}>
                {coches.map((_, i) => {
                  const valor = fila.valores[i] ?? "—";
                  const gana = fila.mejor_idx === i;
                  return (
                    <div
                      key={i}
                      className={`flex min-h-[36px] items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[13px] leading-snug ${
                        gana ? "bg-cb-agua font-bold text-cb-navy" : "text-cb-navy"
                      }`}
                    >
                      {gana && <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={3} aria-label="Mejor" />}
                      <span className="min-w-0 break-words">{valor}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </Fragment>
      ))}
    </section>
  );
}
