"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";

interface Coche {
  indice: number;
  nombre: string;
}

interface Fila {
  etiqueta: string;
  valores: string[];
  mejor_idx: number | null;
}

interface Categoria {
  nombre: string;
  icono: string;
  filas: Fila[];
}

export interface CarComparisonData {
  coches: Coche[];
  categorias: Categoria[];
}

export function CarComparisonTable({ data }: { data: CarComparisonData }) {
  const { coches, categorias } = data;

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-stone-200 shadow-md mt-2 bg-white">
      <table className="text-sm w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[#1C1714] text-white px-4 py-3.5 text-left font-semibold min-w-[130px] border-b border-[#1C1714]">
              Característica
            </th>
            {coches.map((coche) => (
              <th
                key={coche.indice}
                className="bg-[#1C1714] text-white px-4 py-3.5 text-center font-semibold min-w-[140px] whitespace-nowrap border-b border-[#1C1714]"
              >
                {coche.nombre}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categorias.map((cat, catIdx) => (
            <Fragment key={catIdx}>
              <tr>
                <td
                  colSpan={1 + coches.length}
                  className="bg-[#F3EBDD] px-4 py-2.5 font-semibold text-stone-700 text-xs uppercase tracking-wider border-t-2 border-stone-300"
                >
                  {cat.icono} {cat.nombre}
                </td>
              </tr>
              {cat.filas.map((fila, filaIdx) => {
                const rowBg = filaIdx % 2 === 0 ? "bg-white" : "bg-stone-50";
                return (
                  <tr key={filaIdx}>
                    <td
                      className={`sticky left-0 ${rowBg} px-4 py-3 text-slate-700 font-medium border-t border-stone-100`}
                    >
                      {fila.etiqueta}
                    </td>
                    {fila.valores.map((valor, valorIdx) => {
                      const isWinner = fila.mejor_idx === valorIdx;
                      return (
                        <td
                          key={valorIdx}
                          className={`px-4 py-3 text-center whitespace-nowrap border-t border-stone-100 ${
                            isWinner
                              ? "bg-[#ADD4D3] text-slate-900 font-semibold"
                              : "text-slate-600"
                          }`}
                        >
                          <span className="inline-flex items-center justify-center gap-1.5">
                            {valor}
                            {isWinner && (
                              <Check className="h-3.5 w-3.5 stroke-[3] text-slate-900" />
                            )}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
