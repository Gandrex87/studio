"use client";

import { useEffect, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { AlertTriangle, Check, Info, ThumbsDown, ThumbsUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AgentFrame } from "@/components/carblau/agent-frame";
import { ContactoSheet } from "@/components/carblau/contacto-sheet";
import { FotoCoche } from "@/components/carblau/foto-coche";
import { BOTON_PRIMARIO } from "@/components/carblau/quick-replies";
import type { Car, CarRecommendationPayload } from "@/lib/tipos";
import { nombreLimpio, numeroFicha, puntuacionEntera } from "@/lib/texto";
import { API_BASE_URL } from "@/lib/config";

interface CarResultsMessageProps {
  data: CarRecommendationPayload;
  threadId: string | null;
  mensajeId: string;   // id del mensaje de resultados: identifica la tanda valorada
  /** Números de ficha marcados para comparar (solo en la última tanda) */
  comparar?: number[];
  onToggleComparar?: (numero: number) => void;
  /** Acciones tras los resultados (botones del backend), sobre el fondo oscuro */
  acciones?: ReactNode;
}

type Voto = "up" | "down";

// Votos ya emitidos, por conversación: al recargar la página no se vuelve a
// pedir (ni a contar) el mismo voto. sessionStorage, como el thread_id.
const claveVotos = (threadId: string) => `carblau_feedback_${threadId}`;

function leerVoto(threadId: string, mensajeId: string): Voto | null {
  try {
    return JSON.parse(sessionStorage.getItem(claveVotos(threadId)) || "{}")[mensajeId] ?? null;
  } catch {
    return null;
  }
}

function guardarVoto(threadId: string, mensajeId: string, voto: Voto) {
  try {
    const votos = JSON.parse(sessionStorage.getItem(claveVotos(threadId)) || "{}");
    sessionStorage.setItem(claveVotos(threadId), JSON.stringify({ ...votos, [mensajeId]: voto }));
  } catch {
    /* sin persistencia: el voto se envía igual */
  }
}

const BOTON_VOTO =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-blau disabled:cursor-default";

// ═══════════════════════════════════════════════════════════════════
// 👍/👎 SOBRE LAS RECOMENDACIONES (métricas de satisfacción)
// ═══════════════════════════════════════════════════════════════════
const FeedbackRecomendaciones = ({ threadId, mensajeId }: { threadId: string | null; mensajeId: string }) => {
  const [enviado, setEnviado] = useState<Voto | null>(null);

  // Tras recargar: si esta tanda ya se votó, mostrar el agradecimiento
  useEffect(() => {
    if (threadId) setEnviado(leerVoto(threadId, mensajeId));
  }, [threadId, mensajeId]);

  const enviar = (valor: Voto) => {
    if (enviado || !threadId) return;
    setEnviado(valor);
    guardarVoto(threadId, mensajeId, valor);
    // Sin esperar respuesta: un fallo aquí no debe molestar al usuario
    fetch(`${API_BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: threadId, mensaje_id: mensajeId, valor }),
    }).catch((e) => console.warn("No se pudo enviar el feedback:", e));
  };

  const texto = enviado === "up"
    ? "Gracias, nos alegra que te encajen."
    : enviado === "down"
      ? "Gracias. Dinos qué cambiar y afinamos."
      : "¿Te encajan estas propuestas?";

  return (
    <div className="flex items-center justify-center gap-2.5 text-sm text-cb-crema-suave">
      <span>{texto}</span>
      <button
        type="button"
        aria-label="Sí, me encajan"
        aria-pressed={enviado === "up"}
        disabled={enviado !== null}
        onClick={() => enviar("up")}
        className={`${BOTON_VOTO} ${
          enviado === "up"
            ? "border-cb-agua bg-cb-agua text-cb-espresso"
            : "border-cb-crema/25 text-cb-crema hover:bg-cb-crema/10"
        } ${enviado === "down" ? "opacity-40" : ""}`}
      >
        <ThumbsUp className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        aria-label="No me encajan"
        aria-pressed={enviado === "down"}
        disabled={enviado !== null}
        onClick={() => enviar("down")}
        className={`${BOTON_VOTO} ${
          enviado === "down"
            ? "border-cb-agua bg-cb-agua text-cb-espresso"
            : "border-cb-crema/25 text-cb-crema hover:bg-cb-crema/10"
        } ${enviado === "up" ? "opacity-40" : ""}`}
      >
        <ThumbsDown className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// FICHA DE COCHE
// ═══════════════════════════════════════════════════════════════════
interface CarCardProps {
  car: Car;
  posicion: number;
  total: number;
  comparando?: boolean;
  onToggleComparar?: () => void;
}

// "Híbrido · 2019 · Berlina · 5 plazas · Automático · Tracción delantera"
function lineaDatos(car: Car): string {
  const d = car.datos;
  if (d && Object.keys(d).length > 0) {
    return [
      d.combustible,
      d.anio,
      d.carroceria,
      d.plazas ? `${d.plazas} plazas` : null,
      d.cambio,
      d.traccion ? `Tracción ${d.traccion.toLowerCase()}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return car.specs.filter(Boolean).join(" · ");
}

const CarCard = ({ car, posicion, total, comparando, onToggleComparar }: CarCardProps) => {
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const nombre = nombreLimpio(car.name);
  // Fase 2: `encaje` (0–99) del backend; si no llega, la puntuación redondeada
  const encaje = car.encaje != null && Number.isFinite(car.encaje) ? String(car.encaje) : puntuacionEntera(car.score);
  const specs = lineaDatos(car);
  const razones = (car.razones ?? []).filter(Boolean);

  return (
    <article
      aria-label={nombre}
      className="flex flex-col overflow-hidden rounded-[18px] bg-cb-crema text-cb-espresso"
    >
      <div className="relative">
        <FotoCoche car={car} />
        {encaje && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`Encaje ${encaje}. Qué significa`}
                className="absolute left-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-cb-agua px-2.5 text-[13px] font-bold text-cb-espresso shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-espresso"
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                Encaje {encaje}
                <Info className="h-3 w-3 opacity-70" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 border-cb-espresso/10 bg-cb-crema-2 text-xs leading-relaxed text-cb-espresso">
              De 0 a 99: mide cuánto encaja este coche con lo que nos has contado (uso, pasajeros,
              presupuesto y prioridades). Un mismo coche tiene el mismo encaje en cualquier búsqueda.
            </PopoverContent>
          </Popover>
        )}
        <span className="absolute right-3 top-3 inline-flex h-7 items-center rounded-full bg-cb-espresso/70 px-2.5 text-xs font-semibold text-cb-crema">
          {posicion} de {total}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 pb-4 pt-3.5">
        <div className="flex flex-col gap-1">
          <h3 className="font-headline text-[21px] font-semibold leading-tight">{nombre}</h3>
          {specs && <p className="text-sm text-cb-tinta">{specs}</p>}
        </div>

        {/* El precio es el rango típico del modelo y año, no el de un anuncio */}
        <div className="flex items-baseline justify-between gap-3 border-y border-cb-espresso/10 py-2.5">
          <span className="font-headline text-2xl font-bold">{car.price}</span>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label="Qué significa este precio"
                className="inline-flex items-center gap-1 text-right text-xs leading-tight text-cb-tinta underline decoration-dotted underline-offset-[3px] hover:text-cb-espresso"
              >
                {car.priceLabel ?? "Precio"}
                <Info className="h-3 w-3 shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 border-cb-espresso/10 bg-cb-crema-2 text-xs leading-relaxed text-cb-espresso">
              {car.priceRange
                ? "Es el rango en el que suele anunciarse este modelo y año con un kilometraje normal. No es el precio de un anuncio concreto: CarBlau busca una unidad para ti dentro de tu presupuesto."
                : "Precio aproximado, con pocos datos de mercado para este modelo y año. Tómalo como una orientación."}
            </PopoverContent>
          </Popover>
        </div>

        {razones.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.08em] text-cb-tinta">Por qué encaja contigo</span>
            <ul className="flex flex-col gap-1.5">
              {razones.map((razon) => (
                <li key={razon} className="flex gap-2 text-sm leading-relaxed">
                  <Check className="mt-[3px] h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                  <span>{razon}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {car.aviso && (
          <div className="flex gap-2 rounded-xl bg-cb-melocoton/[0.22] px-3 py-2.5 text-sm leading-relaxed">
            <AlertTriangle className="mt-[3px] h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden="true" />
            <span>
              <strong className="font-bold">Ten en cuenta:</strong> {car.aviso}
            </span>
          </div>
        )}

        {car.analysis &&
          (razones.length > 0 ? (
            <details className="group">
              <summary className="cursor-pointer list-none text-xs font-bold uppercase tracking-[0.08em] text-cb-tinta hover:text-cb-espresso [&::-webkit-details-marker]:hidden">
                Nuestro criterio{" "}
                <span className="font-normal normal-case tracking-normal group-open:hidden">· ver más</span>
                <span className="hidden font-normal normal-case tracking-normal group-open:inline">· ver menos</span>
              </summary>
              <p className="pt-1.5 text-sm leading-relaxed">{car.analysis}</p>
            </details>
          ) : (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-cb-tinta">Nuestro criterio</span>
              <p className="text-sm leading-relaxed">{car.analysis}</p>
            </div>
          ))}

        <div className={`grid gap-2 ${onToggleComparar ? "grid-cols-[1fr_auto]" : "grid-cols-1"}`}>
          <button
            type="button"
            onClick={() => setContactoAbierto(true)}
            className={`${BOTON_PRIMARIO} h-[46px] px-4 text-[15px]`}
          >
            Me interesa
          </button>
          {onToggleComparar && (
            <button
              type="button"
              aria-pressed={comparando}
              onClick={onToggleComparar}
              className={`inline-flex h-[46px] items-center justify-center rounded-full px-4 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-blau ${
                comparando
                  ? "border-2 border-cb-espresso bg-cb-espresso text-cb-crema"
                  : "border-[1.5px] border-cb-espresso/35 text-cb-espresso hover:border-cb-espresso"
              }`}
            >
              {comparando ? "Comparando" : "Comparar"}
            </button>
          )}
        </div>
      </div>

      <ContactoSheet car={car} abierto={contactoAbierto} onOpenChange={setContactoAbierto} />
    </article>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export function CarResultsMessage({
  data,
  threadId,
  mensajeId,
  comparar,
  onToggleComparar,
  acciones,
}: CarResultsMessageProps) {
  const total = data.cars.length;

  return (
    <div className="flex flex-col gap-3.5">
      <AgentFrame>
        <ReactMarkdown className="cb-md font-headline text-[17px] leading-[1.45]">{data.introText}</ReactMarkdown>
      </AgentFrame>

      {data.cars.map((car, index) => {
        const numero = numeroFicha(car.name) ?? index + 1;
        return (
          <CarCard
            key={car.carId ?? `${mensajeId}-${index}`}
            car={car}
            posicion={index + 1}
            total={total}
            comparando={comparar?.includes(numero)}
            onToggleComparar={onToggleComparar ? () => onToggleComparar(numero) : undefined}
          />
        );
      })}

      {data.outroText && (
        <AgentFrame>
          <ReactMarkdown className="cb-md font-headline text-[17px] leading-[1.45]">{data.outroText}</ReactMarkdown>
        </AgentFrame>
      )}

      <FeedbackRecomendaciones threadId={threadId} mensajeId={mensajeId} />

      {acciones && (
        <div className="flex flex-col gap-2">
          <span className="pl-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-cb-crema-tenue">
            ¿Qué hacemos ahora?
          </span>
          {acciones}
        </div>
      )}
    </div>
  );
}
