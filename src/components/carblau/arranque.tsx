"use client";

import { Building2, KeyRound, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Primera pantalla de la conversación: la pregunta inicial en grande y tres
// formas de empezar, además de la caja libre. Cada tarjeta envía al agente un
// texto en lenguaje natural que su extractor convierte en datos del encargo;
// el cuestionario sigue después con lo que falte.
interface Sugerencia {
  titulo: string;
  detalle: string;
  texto: string;
  Icono: LucideIcon;
  tono: string;
}

export const SUGERENCIAS: Sugerencia[] = [
  {
    titulo: "Para el día a día en ciudad",
    detalle: "Trayectos cortos, fácil de aparcar",
    texto: "Lo quiero para el día a día en ciudad: trayectos cortos y que sea fácil de aparcar.",
    Icono: Building2,
    tono: "bg-cb-agua/[0.18] text-cb-agua",
  },
  {
    titulo: "Para viajar en familia",
    detalle: "Espacio, maletero y carretera",
    texto: "Lo quiero para viajar en familia: espacio, maletero amplio y bastante carretera.",
    Icono: Users,
    tono: "bg-cb-melocoton/[0.18] text-cb-melocoton",
  },
  {
    titulo: "Mi primer coche",
    detalle: "Sin complicaciones y con margen",
    texto: "Es mi primer coche: lo quiero sencillo, fiable y sin complicaciones.",
    Icono: KeyRound,
    tono: "bg-cb-crema/[0.14] text-cb-crema",
  },
];

export function Arranque({ onElegir, disabled = false }: { onElegir: (texto: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-6 px-1 pb-2 pt-6">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-cb-agua">Asesor CarBlau</span>
        <h1 className="font-headline text-[30px] font-semibold leading-[1.15] text-cb-crema">
          ¿Qué necesitas que haga tu próximo coche?
        </h1>
        <p className="text-base leading-relaxed text-cb-crema-suave">
          Cuéntamelo con tus palabras o elige por dónde empezar.
        </p>
      </div>

      <div className="flex flex-col gap-2.5" role="group" aria-label="Formas de empezar">
        {SUGERENCIAS.map(({ titulo, detalle, texto, Icono, tono }) => (
          <button
            key={titulo}
            type="button"
            onClick={() => onElegir(texto)}
            disabled={disabled}
            className="flex min-h-[60px] items-center gap-3 rounded-2xl border border-cb-crema/[0.18] bg-cb-crema/[0.07] px-3.5 py-3 text-left text-cb-crema transition-colors hover:bg-cb-crema/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua disabled:opacity-50"
          >
            <span className={`inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px] ${tono}`}>
              <Icono className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-bold">{titulo}</span>
              <span className="text-[13px] text-cb-crema-suave">{detalle}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs leading-relaxed text-cb-crema-tenue">
        Hablas con la IA de CarBlau: respuestas orientativas, puede equivocarse. Detrás hay personas: pídenos
        hablar cuando quieras.
      </p>
    </div>
  );
}
