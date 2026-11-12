"use client";

import { ArrowRight, Loader2, MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/components/carblau/chat-header";

interface WelcomeScreenProps {
  onStartSession: () => void;
  isLoading: boolean;
  /** Dentro de carblau.com/asesor: la barra de la landing ya muestra el logo */
  embebido?: boolean;
}

const PASOS = [
  "Unas pocas preguntas cortas. Unos tres minutos.",
  "Filtramos el mercado con el criterio de 20 años en el sector.",
  "Propuestas explicadas: lo bueno y lo que debes saber.",
];

// Bienvenida: qué va a pasar y con quién hablas. Desde carblau.com se entra
// con ?autostart=1 y esta pantalla no se muestra.
export function WelcomeScreen({ onStartSession, isLoading, embebido = false }: WelcomeScreenProps) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-cb-espresso text-cb-crema">
      {/* Foto de marca (paisaje) fundida hacia el espresso */}
      <div className="absolute inset-x-0 top-0 h-[52%] max-h-[480px] overflow-hidden" aria-hidden="true">
        <img
          src="/bienvenida.webp"
          alt=""
          className="h-full w-full object-cover object-[60%_40%] opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,23,20,0.35)_0%,rgba(28,23,20,0.15)_35%,rgba(28,23,20,0.92)_78%,#1C1714_100%)]" />
      </div>

      <div className="relative flex items-center justify-between px-5 pt-5">
        {embebido ? <span /> : <img src="/logo3.png" alt="CarBlau" className="h-6 w-auto" />}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-cb-crema/[0.22] bg-cb-espresso/55 px-3 text-[13px] font-semibold text-cb-crema backdrop-blur-sm hover:bg-cb-espresso/80"
        >
          <MessageCircle className="h-4 w-4" />
          Hablar con una persona
        </a>
      </div>

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-end gap-5 px-6 pb-5 sm:justify-center">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cb-agua">Asesor CarBlau</p>
          <h1 className="font-headline text-[38px] font-semibold leading-[1.08] tracking-tight">
            Encuentra el coche que encaja contigo.
          </h1>
          <p className="text-[17px] leading-relaxed text-cb-crema-suave">
            Cuéntanos cómo vives y cómo usas el coche. Nosotros ponemos el criterio.
          </p>
        </div>

        <ol className="flex flex-col gap-2.5">
          {PASOS.map((paso, i) => (
            <li key={paso} className="flex items-start gap-3">
              <span className="inline-flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border border-cb-crema/30 text-[13px] font-bold text-cb-agua">
                {i + 1}
              </span>
              <span className="pt-0.5 text-[15px] leading-snug">{paso}</span>
            </li>
          ))}
        </ol>

        <p className="font-headline text-base italic text-cb-melocoton">Sin stock que colocar. Buscado, no vendido.</p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onStartSession}
            disabled={isLoading}
            className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-cb-blau text-[17px] font-bold text-cb-espresso transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-crema disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Empezar
            {!isLoading && <ArrowRight className="h-[18px] w-[18px]" strokeWidth={2.4} />}
          </button>
          <p className="px-2 text-center text-xs leading-relaxed text-cb-crema-tenue">
            Hablas con el asistente de IA de CarBlau. Sus respuestas son orientativas y puede equivocarse.
            Detrás hay personas: pídenos hablar cuando quieras.
          </p>
        </div>
      </div>
    </div>
  );
}
