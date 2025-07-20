"use client";

import { Car } from "lucide-react"; 
import { cn } from "@/lib/utils";
// ✅ 1. Importamos los tipos desde page.tsx para mantener todo sincronizado
import type { CarRecommendationPayload } from "@/app/page";

// Definimos el tipo para un solo coche, para mayor claridad
type CarData = CarRecommendationPayload['cars'][0];

interface CarResultsMessageProps {
  data: CarRecommendationPayload;
}

// Sub-componente para renderizar una única ficha de coche
const CarCard = ({ car }: { car: CarData }) => {
  return (
    <div className="bg-background/50 rounded-lg p-3 shadow-sm text-center">
      <h3 className="text-lg font-bold mt-0 mb-2">{car.name}</h3>
      
      {car.imageUrl && (
        <div className="flex justify-center my-3">
          <img
            src={car.imageUrl}
            alt={`Foto de ${car.name}`}
            className="rounded-lg border shadow-md max-w-full h-auto"
          />
        </div>
      )}

      <div className="flex justify-center gap-2 my-3 flex-wrap not-prose">
        {car.specs.map((spec: string, i: number) => (
          <span key={i} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
            {spec}
          </span>
        ))}
      </div>

      {/* ✅ CORREGIDO: Faltaba el '>' en la etiqueta de cierre </p> */}
      <p className="font-semibold text-base my-2">
        <strong>Precio:</strong> {car.price} | <strong>Puntuación:</strong> {car.score}
      </p>

      <p className="text-xs text-muted-foreground/80 italic mt-3">
        {car.analysis}
      </p>
    </div>
  );
};

// Componente principal que muestra la burbuja completa
export function CarResultsMessage({ data }: CarResultsMessageProps) {
  // ✅ AÑADIDO PARA DEPURACIÓN: Imprime los datos recibidos en la consola del navegador.
  console.log("Datos recibidos por CarResultsMessage:", data);

  return (
    <div className={cn("flex items-start gap-4")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Car className="w-5 h-5" />
      </div>

      <div className={cn("rounded-lg px-4 py-3 text-sm shadow-md w-full max-w-lg bg-muted text-muted-foreground")}>
        {/* Muestra el texto de introducción */}
        <p className="prose prose-sm dark:prose-invert max-w-none">{data.introText}</p>

        {/* Mapea y renderiza cada ficha de coche */}
        <div className="flex flex-col gap-4 mt-4">
          {data.cars.map((car, index) => (
            <CarCard key={index} car={car} />
          ))}
        </div>

        {/* Muestra el texto de conclusión si existe */}
        {data.outroText && (
          <p className="prose prose-sm dark:prose-invert max-w-none mt-4">{data.outroText}</p>
        )}
      </div>
    </div>
  );
}
