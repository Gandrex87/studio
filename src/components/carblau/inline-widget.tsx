"use client";

import { OpcionesRango } from "@/components/carblau/opciones-rango";
import { PresupuestoUnificado } from "@/components/carblau/presupuesto-unificado";
import { QuickReplies } from "@/components/carblau/quick-replies";
import type { QuickReplyConfig } from "@/lib/tipos";

interface InlineWidgetProps {
  config: QuickReplyConfig;
  onSelect: (texto: string) => void;
  isLoading: boolean;
  /** Botones sobre el fondo oscuro (acciones tras los resultados) */
  tono?: "papel" | "oscuro";
}

// Control de respuesta de la pregunta pendiente. Va DENTRO del mensaje del
// asesor (antes ocupaba un panel inferior que tapaba la pregunta). Todos
// responden al agente como texto; los valores son los que espera el backend.
export function InlineWidget({ config, onSelect, isLoading, tono = "papel" }: InlineWidgetProps) {
  switch (config.type) {
    case "buttons":
      if (!config.options || config.options.length === 0) return null;
      return (
        <QuickReplies
          key={config.options.join("|")}
          options={config.options}
          onSelect={onSelect}
          isLoading={isLoading}
          multiSelect={config.multi_select}
          submitLabel={config.submit_label}
          tono={tono}
        />
      );
    case "presupuesto_unificado":
      return <PresupuestoUnificado onSelect={onSelect} isLoading={isLoading} />;
    case "distance_slider":
    case "km_anuales_slider":
    case "pasajeros_slider":
    case "presupuesto_slider":
      return <OpcionesRango tipo={config.type} onSelect={onSelect} isLoading={isLoading} />;
    default:
      return null;
  }
}
