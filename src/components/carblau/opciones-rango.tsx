"use client";

import { CHIP_NORMAL, ENLACE_SECUNDARIO } from "@/components/carblau/quick-replies";
import type { TipoWidget } from "@/lib/tipos";

// Preguntas de rango (distancia, km al año, pasajeros, presupuesto). Antes eran
// cuatro sliders con gradientes; ahora una rejilla de opciones con un toque.
// Los `valor` son EXACTAMENTE los textos que espera el backend
// (canales/opciones.py del agente): no cambiarlos sin cambiar el interceptor.
interface Opcion {
  valor: string;
  etiqueta: string;
  detalle?: string;
}

interface Rango {
  titulo: string;
  columnas: 2 | 3 | 4;
  opciones: Opcion[];
  /** Salida alternativa en texto ("No lo sé", "Prefiero escribir una cantidad") */
  extra?: Opcion;
}

export type TipoRango = Exclude<TipoWidget, "buttons" | "presupuesto_unificado">;

const RANGOS: Record<TipoRango, Rango> = {
  distance_slider: {
    titulo: "Tu trayecto más habitual",
    columnas: 2,
    opciones: [
      { valor: "Menos de 10 km", etiqueta: "Menos de 10 km", detalle: "Trayectos muy cortos" },
      { valor: "Entre 10 y 50 km", etiqueta: "10–50 km", detalle: "Trayectos medios" },
      { valor: "Entre 51 y 150 km", etiqueta: "51–150 km", detalle: "Trayectos largos" },
      { valor: "Más de 150 km", etiqueta: "Más de 150 km", detalle: "Largas distancias" },
    ],
  },
  km_anuales_slider: {
    titulo: "Kilómetros al año",
    columnas: 2,
    opciones: [
      { valor: "Sí, unos 10.000 km/año", etiqueta: "5.000–10.000", detalle: "Poco uso" },
      { valor: "Sí, unos 15.000 km/año", etiqueta: "10.000–20.000", detalle: "Uso habitual" },
      { valor: "Sí, unos 25.000 km/año", etiqueta: "20.000–30.000", detalle: "Bastante carretera" },
      { valor: "Sí, más de 30.000 km/año", etiqueta: "Más de 30.000", detalle: "Uso intensivo" },
    ],
    extra: { valor: "❌ No lo sé, ayúdame a calcularlo", etiqueta: "No lo sé, ayúdame a calcularlo" },
  },
  pasajeros_slider: {
    titulo: "Pasajeros habituales, sin contarte a ti",
    columnas: 4,
    opciones: [
      { valor: "1 persona", etiqueta: "1" },
      { valor: "2 personas", etiqueta: "2" },
      { valor: "3 personas", etiqueta: "3" },
      { valor: "4 o más", etiqueta: "4 o más" },
    ],
  },
  presupuesto_slider: {
    titulo: "Presupuesto",
    columnas: 3,
    opciones: [
      { valor: "Entre 5.000 y 10.000 euros", etiqueta: "5–10 mil €" },
      { valor: "Entre 10.000 y 20.000 euros", etiqueta: "10–20 mil €" },
      { valor: "Entre 20.000 y 30.000 euros", etiqueta: "20–30 mil €" },
      { valor: "Entre 30.000 y 40.000 euros", etiqueta: "30–40 mil €" },
      { valor: "Entre 40.000 y 60.000 euros", etiqueta: "40–60 mil €" },
      { valor: "Más de 60.000 euros", etiqueta: "Más de 60 mil €" },
    ],
    extra: { valor: "Prefiero indicar una cantidad específica", etiqueta: "Prefiero escribir una cantidad" },
  },
};

const COLUMNAS = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
} as const;

interface OpcionesRangoProps {
  tipo: TipoRango;
  onSelect: (valor: string) => void;
  isLoading: boolean;
}

export function OpcionesRango({ tipo, onSelect, isLoading }: OpcionesRangoProps) {
  const rango = RANGOS[tipo];
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-cb-tinta">{rango.titulo}</p>
      <div className={`grid gap-2 ${COLUMNAS[rango.columnas]}`}>
        {rango.opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => onSelect(opcion.valor)}
            disabled={isLoading}
            className={`${CHIP_NORMAL} flex-col gap-0 px-2`}
          >
            <span>{opcion.etiqueta}</span>
            {opcion.detalle && <span className="text-[11px] font-normal text-cb-tinta">{opcion.detalle}</span>}
          </button>
        ))}
      </div>
      {rango.extra && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onSelect(rango.extra!.valor)}
            disabled={isLoading}
            className={ENLACE_SECUNDARIO}
          >
            {rango.extra.etiqueta}
          </button>
        </div>
      )}
    </div>
  );
}
