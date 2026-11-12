"use client";

import { useEffect, useRef, useState } from "react";
import type { Car } from "@/lib/tipos";
import { nombreLimpio } from "@/lib/texto";

// Un ~14 % de los coches no tiene foto (imageUrl null) y algunas URL fallan.
// En ambos casos se enseña el placeholder de marca (la foto de la landing
// desenfocada, con la matrícula «CAR BLAU»; no se distingue la marca del coche)
// con el rótulo «Foto no disponible» encima, para que nadie crea que ese es el
// coche recomendado. Mismo hueco 16/10 que una foto: todas las fichas miden lo
// mismo. Origen: docs/recursos/placeholder_coche del backend (800×600).
export const PLACEHOLDER_COCHE = "/coche-sin-foto.webp";

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
    <div role="img" aria-label={`${nombre}, foto no disponible`} className="relative aspect-[16/10] w-full">
      <img
        src={PLACEHOLDER_COCHE}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-2.5 left-3 rounded-full bg-cb-espresso/50 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-[2px]">
        Foto no disponible
      </span>
    </div>
  );
}
