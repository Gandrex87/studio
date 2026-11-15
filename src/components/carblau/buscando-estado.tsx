"use client";

import { Check } from "lucide-react";
import { AgentFrame } from "@/components/carblau/agent-frame";

// Mientras el agente trabaja: los pasos que ha ido anunciando por el stream
// (eventos `progress`, uno por nodo del grafo). Los ya pasados quedan marcados
// y el último respira. Sin pasos todavía, tres puntos.
export function BuscandoEstado({ pasos }: { pasos: string[] }) {
  const esBusqueda = pasos.some((p) => /buscando|vehículos|coches/i.test(p));

  return (
    <AgentFrame>
      <div role="status" aria-live="polite" className="flex flex-col gap-3">
        {pasos.length === 0 ? (
          <div className="flex items-center gap-1.5 py-1" aria-label="El asesor está escribiendo">
            <span className="cb-pulse h-2 w-2 rounded-full bg-cb-espresso/60" />
            <span className="cb-pulse h-2 w-2 rounded-full bg-cb-espresso/60 [animation-delay:0.2s]" />
            <span className="cb-pulse h-2 w-2 rounded-full bg-cb-espresso/60 [animation-delay:0.4s]" />
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {pasos.map((paso, i) => {
              const actual = i === pasos.length - 1;
              return (
                <li key={`${i}-${paso}`} className="flex items-center gap-3">
                  {actual ? (
                    <span className="cb-pulse inline-block h-6 w-6 shrink-0 rounded-full bg-cb-agua" />
                  ) : (
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-agua text-cb-navy">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  )}
                  <span className={`text-[15px] ${actual ? "font-semibold text-cb-espresso" : "text-cb-tinta"}`}>
                    {paso}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
        {esBusqueda && (
          <p className="border-t border-cb-espresso/10 pt-2.5 text-[13px] text-cb-tinta">
            Buscamos con calma y con criterio. Suele tardar menos de un minuto.
          </p>
        )}
      </div>
    </AgentFrame>
  );
}
