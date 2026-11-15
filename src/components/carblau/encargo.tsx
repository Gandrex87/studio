"use client";

import { ChevronDown, Pencil } from "lucide-react";
import { itemsEncargo, type Encargo } from "@/lib/encargo";

// "Tu encargo": lo que el usuario ya ha contado. En móvil, una píldora bajo la
// cabecera que despliega los chips; en escritorio, el panel lateral. Con el backend de la
// fase 2 cada dato se puede cambiar: se envía `Quiero cambiar: <etiqueta>`.

interface EncargoProps {
  encargo: Encargo;
  onCambiar: (etiqueta: string) => void;
  disabled?: boolean;
}

const CHIP =
  "inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-cb-crema/20 bg-cb-crema/[0.06] px-2.5 text-xs font-medium text-cb-crema";

// Píldora «Tu encargo · 3 datos» de la fila bajo la cabecera (móvil); al
// tocarla se despliegan los chips.
export function EncargoResumen({
  encargo,
  abierto,
  onToggle,
}: {
  encargo: Encargo;
  abierto: boolean;
  onToggle: () => void;
}) {
  const n = itemsEncargo(encargo).length;
  if (n === 0) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={abierto}
      aria-controls="encargo-chips"
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-cb-crema/[0.24] bg-cb-crema/[0.06] px-3 text-[13px] font-semibold text-cb-crema transition-colors hover:bg-cb-crema/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua"
    >
      Tu encargo · {n} {n === 1 ? "dato" : "datos"}
      <ChevronDown
        className={`h-3.5 w-3.5 transition-transform ${abierto ? "rotate-180" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}

// Los chips desplegados bajo la píldora
export function EncargoChips({ encargo, onCambiar, disabled = false }: EncargoProps) {
  const items = itemsEncargo(encargo);
  if (items.length === 0) return null;
  return (
    <div id="encargo-chips" className="flex items-center gap-1.5 overflow-x-auto px-4 pb-2.5 pt-1 cb-scroll-x" aria-label="Tu encargo">
      {items.map((item, i) =>
        item.cambiable ? (
          <button
            key={`${item.etiqueta}-${i}`}
            type="button"
            onClick={() => onCambiar(item.etiqueta)}
            disabled={disabled}
            title={`Cambiar ${item.etiqueta.toLowerCase()}`}
            aria-label={`${item.etiqueta}: ${item.texto}. Cambiar`}
            className={`${CHIP} transition-colors hover:border-cb-crema/50 hover:bg-cb-crema/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua disabled:opacity-50`}
          >
            {item.texto}
            <Pencil className="h-3 w-3 opacity-60" aria-hidden="true" />
          </button>
        ) : (
          <span key={`${item.etiqueta}-${i}`} title={item.etiqueta} className={CHIP}>
            {item.texto}
          </span>
        )
      )}
    </div>
  );
}

export function EncargoPanel({ encargo, onCambiar, disabled = false }: EncargoProps) {
  const estado = encargo.completo ? "Completo" : encargo.temas.length > 0 ? "En curso" : "";
  return (
    <aside aria-label="Tu encargo" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-headline text-xl font-semibold text-cb-crema">Tu encargo</h2>
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-cb-agua">{estado}</span>
      </div>

      {encargo.temas.length === 0 ? (
        <p className="rounded-[14px] border border-cb-crema/[0.14] p-4 text-sm leading-relaxed text-cb-crema-suave">
          Aquí irá apareciendo lo que nos cuentes: uso, pasajeros, kilómetros, presupuesto…
        </p>
      ) : (
        <div className="overflow-hidden rounded-[14px] border border-cb-crema/[0.14]">
          {encargo.temas.map((tema) => (
            <section
              key={tema.tema}
              aria-label={tema.tema}
              className="flex flex-col gap-1.5 px-3.5 py-2.5 [&+&]:border-t [&+&]:border-cb-crema/10"
            >
              <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-cb-crema-tenue">{tema.tema}</h3>
              <ul className="flex flex-col gap-1">
                {tema.items.map((item, i) => (
                  <li key={`${item.etiqueta}-${i}`} className="flex items-center justify-between gap-2">
                    <span className="min-w-0 text-[15px] leading-snug text-cb-crema">
                      {item.texto}
                      {encargo.delBackend && (
                        <span className="ml-1.5 text-xs text-cb-crema-tenue">{item.etiqueta}</span>
                      )}
                    </span>
                    {item.cambiable && (
                      <button
                        type="button"
                        onClick={() => onCambiar(item.etiqueta)}
                        disabled={disabled}
                        aria-label={`Cambiar ${item.etiqueta.toLowerCase()}`}
                        className="inline-flex h-7 shrink-0 items-center rounded-full border border-cb-crema/20 px-2.5 text-xs font-semibold text-cb-crema-suave transition-colors hover:border-cb-crema/50 hover:text-cb-crema focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua disabled:opacity-50"
                      >
                        Cambiar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="text-xs leading-relaxed text-cb-crema-tenue">
        {encargo.delBackend
          ? "Pulsa «Cambiar» en cualquier dato y el asesor te lo vuelve a preguntar."
          : "¿Algo no es correcto? Díselo al asesor en el chat y lo corregirá."}
      </p>
    </aside>
  );
}
