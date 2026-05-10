"use client";

import { Fragment } from "react";

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
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm mt-2">
      <table className="text-sm w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[#082144] text-white px-4 py-3 text-left font-semibold min-w-[130px] border-b border-[#082144]">
              Característica
            </th>
            {coches.map((coche) => (
              <th
                key={coche.indice}
                className="bg-[#082144] text-white px-4 py-3 text-center font-semibold min-w-[140px] whitespace-nowrap border-b border-[#082144]"
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
                  className="bg-slate-100 px-4 py-2 font-semibold text-slate-600 text-xs uppercase tracking-wide border-t-2 border-slate-300"
                >
                  {cat.icono} {cat.nombre}
                </td>
              </tr>
              {cat.filas.map((fila, filaIdx) => {
                const rowBg = filaIdx % 2 === 0 ? "bg-white" : "bg-slate-50";
                return (
                  <tr key={filaIdx}>
                    <td
                      className={`sticky left-0 ${rowBg} px-4 py-3 text-slate-700 font-medium border-t border-slate-100`}
                    >
                      {fila.etiqueta}
                    </td>
                    {fila.valores.map((valor, valorIdx) => {
                      const isWinner = fila.mejor_idx === valorIdx;
                      return (
                        <td
                          key={valorIdx}
                          className={`px-4 py-3 text-center whitespace-nowrap border-t border-slate-100 ${
                            isWinner
                              ? "bg-emerald-50 text-emerald-700 font-semibold"
                              : "text-slate-600"
                          }`}
                        >
                          {isWinner ? `${valor} ✅` : valor}
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
