"use client";

import { ArrowRight, Baby, Building2, KeyRound, Route, TreePine, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Primera pantalla de la conversación: la pregunta inicial en grande y seis
// atajos, además de la caja libre. Cada tarjeta envía al agente una frase fija
// que el backend reconoce sin LLM y que rellena varios datos del encargo de una
// vez; el cuestionario sigue con lo que falte. La frase tiene que coincidir con
// la del backend carácter a carácter (mayúsculas, tildes y puntuación dan igual).
interface Sugerencia {
  titulo: string;
  detalle: string;
  texto: string;
  Icono: LucideIcon;
  tono: string;
}

const AGUA = "bg-cb-agua/20 text-cb-agua";
const MELOCOTON = "bg-cb-melocoton/20 text-cb-melocoton";
const CREMA = "bg-cb-crema/[0.14] text-cb-crema";

export const SUGERENCIAS: Sugerencia[] = [
  {
    titulo: "En ciudad, a diario",
    detalle: "Trayectos cortos, fácil de aparcar",
    texto: "Lo quiero para el día a día en ciudad: trayectos cortos y que sea fácil de aparcar.",
    Icono: Building2,
    tono: AGUA,
  },
  {
    titulo: "Viajar en familia",
    detalle: "Espacio, maletero y carretera",
    texto: "Lo quiero para viajar en familia: espacio, maletero amplio y bastante carretera.",
    Icono: Users,
    tono: MELOCOTON,
  },
  {
    titulo: "Niños a bordo cada día",
    detalle: "Colegio, sillas y carrito",
    texto: "Lo uso a diario con niños pequeños: colegio, sillas infantiles y maletero para el carrito.",
    Icono: Baby,
    tono: CREMA,
  },
  {
    titulo: "Muchos km de carretera",
    detalle: "Casi todos los días, viajes largos",
    texto: "Hago muchos kilómetros por carretera, casi todos los días.",
    Icono: Route,
    tono: AGUA,
  },
  {
    titulo: "Campo y caminos",
    detalle: "Pistas sin asfaltar, no solo ciudad",
    texto: "Lo necesito para campo y caminos sin asfaltar, no solo ciudad.",
    Icono: TreePine,
    tono: MELOCOTON,
  },
  {
    titulo: "Mi primer coche",
    detalle: "Sencillo, fiable y barato de mantener",
    texto: "Es mi primer coche: lo quiero sencillo, fiable y barato de mantener.",
    Icono: KeyRound,
    tono: CREMA,
  },
];

// Tarjeta con relieve; al pasar o con el foco se levanta y el borde pasa a
// aguamarina; pulsada se hunde y envía la frase al instante (sin «Continuar»)
const TARJETA =
  "group flex min-h-[112px] flex-col justify-between gap-3 rounded-[18px] border border-cb-crema/[0.22] bg-cb-crema/[0.08] p-3.5 text-left text-cb-crema shadow-[inset_0_1px_0_rgba(243,235,221,0.16),0_10px_24px_rgba(0,0,0,0.28)] transition-[transform,background-color,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-cb-agua hover:bg-cb-agua/[0.16] hover:shadow-[inset_0_1px_0_rgba(243,235,221,0.2),0_16px_32px_rgba(0,0,0,0.38),0_0_0_1px_rgba(173,212,211,0.45)] focus-visible:-translate-y-0.5 focus-visible:border-cb-agua focus-visible:bg-cb-agua/[0.16] focus-visible:outline-none active:translate-y-0 active:scale-[0.97] active:bg-cb-agua/[0.26] disabled:pointer-events-none disabled:opacity-50 sm:min-h-[134px] sm:p-4";

const FLECHA =
  "inline-flex h-7 w-7 items-center justify-center rounded-full border border-cb-agua/55 text-cb-agua transition-colors duration-200 group-hover:border-cb-agua group-hover:bg-cb-agua group-hover:text-cb-navy group-focus-visible:border-cb-agua group-focus-visible:bg-cb-agua group-focus-visible:text-cb-navy group-active:bg-cb-agua group-active:text-cb-navy";

export function Arranque({ onElegir, disabled = false }: { onElegir: (texto: string) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-5 px-1 pb-2 pt-6">
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-cb-agua">Asesor CarBlau</span>
        <h1 className="font-headline text-[30px] font-semibold leading-[1.15] text-cb-crema sm:text-[34px]">
          ¿Qué necesitas que haga tu próximo coche?
        </h1>
        <p className="text-base leading-relaxed text-cb-crema-suave sm:text-[17px]">
          Elige la situación que más se parece a la tuya, o cuéntamelo con tus palabras.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-cb-melocoton">
          <span className="sm:hidden">Un toque y empezamos</span>
          <span className="hidden sm:inline">Un clic y empezamos</span>
        </span>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3" role="group" aria-label="Formas de empezar">
          {SUGERENCIAS.map(({ titulo, detalle, texto, Icono, tono }) => (
            <button key={titulo} type="button" onClick={() => onElegir(texto)} disabled={disabled} className={TARJETA}>
              <span className="flex items-center justify-between">
                <span className={`inline-flex h-[38px] w-[38px] items-center justify-center rounded-xl ${tono}`}>
                  <Icono className="h-5 w-5" aria-hidden="true" />
                </span>
                <span aria-hidden="true" className={FLECHA}>
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                </span>
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-bold leading-tight sm:text-[17px]">{titulo}</span>
                <span className="hidden text-[13px] leading-snug text-cb-crema-suave sm:block">{detalle}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-cb-crema-tenue">
        Hablas con la IA de CarBlau: respuestas orientativas, puede equivocarse. Detrás hay personas: pídenos
        hablar cuando quieras.
      </p>
    </div>
  );
}
