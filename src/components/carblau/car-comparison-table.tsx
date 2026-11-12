"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import type { CarComparisonData } from "@/lib/tipos";
import { nombreLimpio, numeroFicha, sinEmoji } from "@/lib/texto";

export type { CarComparisonData };

// Comparativa de 2–3 coches dentro de la tarjeta del asesor. Cada fila lleva
// su etiqueta encima y los valores en columnas; el mejor (mejor_idx) va en
// aguamarina con una marca. Pensada para 390 px: sin scroll horizontal.
export function CarComparisonTable({ data }: { data: CarComparisonData }) {
  const { coches, categorias } = data;
  if (coches.length === 0) return null;
  const columnas = { gridTemplateColumns: `repeat(${coches.length}, minmax(0, 1fr))` };

  return (
    <section aria-label="Tabla comparativa" className="flex flex-col font-body">
      <div className="grid gap-2 border-b border-cb-espresso/10 pb-2.5" style={columnas}>
        {coches.map((coche) => {
          const n = numeroFicha(coche.nombre) ?? coche.indice;
          return (
            <div key={coche.indice} className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-cb-tinta">Coche {n}</span>
              <span className="font-headline text-[15px] font-semibold leading-tight">
                {nombreLimpio(coche.nombre)}
              </span>
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
                        gana ? "bg-cb-agua font-bold text-cb-espresso" : "text-cb-espresso"
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
