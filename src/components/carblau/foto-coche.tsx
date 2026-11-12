"use client";

import { useEffect, useRef, useState } from "react";
import type { Car } from "@/lib/tipos";
import { nombreLimpio } from "@/lib/texto";

// Un ~14 % de los coches no tiene foto (imageUrl null) y algunas URL fallan.
// En ambos casos se dibuja una silueta genérica, sin logos de marcas, en el
// mismo hueco 16/10 que una foto: todas las fichas miden lo mismo.
export function FotoCoche({ car }: { car: Car }) {
  const [fallida, setFallida] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const nombre = nombreLimpio(car.name);

  // Si la imagen ya había fallado antes de que React se enganchara a la página
  // (historial restaurado, carga rápida), el evento onError se pierde: se comprueba aquí.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFallida(true);
  }, [car.imageUrl]);
  const hayFoto = Boolean(car.imageUrl) && car.hasImage !== false && !fallida;

  if (hayFoto) {
    return (
      <img
        ref={imgRef}
        src={car.imageUrl as string}
        alt={`Foto de ${nombre}`}
        loading="lazy"
        decoding="async"
        onError={() => setFallida(true)}
        className="aspect-[16/10] w-full bg-white object-contain"
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${nombre}, sin foto disponible`}
      className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 bg-cb-crema-2"
    >
      <svg viewBox="0 0 120 48" className="w-2/5 text-cb-espresso/20" fill="currentColor" aria-hidden="true">
        <path d="M8 34c-2.2 0-4-1.8-4-4v-5c0-2.4 1.7-4.5 4.1-4.9l15.300-2.600 9.800-9.100C35.200 6.500 37.900 5.500 40.700 5.500h28.600c3.300 0 6.400 1.400 8.600 3.800l8.500 9.200 21.100 3.300c4.900.8 8.500 5 8.500 9.900 0 1.300-1 2.300-2.300 2.300H104a11 11 0 0 0-22 0H42a11 11 0 0 0-22 0H8zm31.500-17h20V10H41.200c-1.400 0-2.800.5-3.800 1.500L32.500 16c-.4.400-.1 1 .4 1h6.600zm25 0h17.300c.6 0 .9-.7.5-1.100l-4.100-4.400c-1.100-1.200-2.700-1.900-4.400-1.900h-9.300v7.400z" />
        <circle cx="31" cy="34" r="8" />
        <circle cx="93" cy="34" r="8" />
      </svg>
      <span className="text-[11px] text-cb-tinta">Sin foto disponible</span>
    </div>
  );
}
