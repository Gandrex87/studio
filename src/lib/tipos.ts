// Contrato con el backend (carblau-agent-api). Lo que llega en cada mensaje
// del agente va en `additional_kwargs`; el detalle está en el README.

export interface Car {
  name: string;                        // "1. Toyota Corolla…" (numerado por el backend)
  specs: string[];                     // tipo de mecánica, año, tracción
  // null si el coche no tiene foto (se dibuja un placeholder); nunca cadena vacía
  imageUrl?: string | null;
  hasImage?: boolean;
  // Rango típico de mercado de la versión y año ("6.250–7.500 €"); sin referencia
  // fiable, "≈ 8.500 €". CarBlau recomienda un modelo, no un anuncio concreto.
  price: string;
  priceLabel?: string | null;          // "Rango típico" | "Precio orientativo"
  priceValue?: number | null;          // precio típico, como número (para el lead)
  priceRange?: { min: number; max: number } | null;
  priceIsApprox?: boolean;
  priceConfidence?: "alta" | "media" | "baja" | "muy_baja" | "sin_datos";
  score: string;                       // "85.23 pts" | "N/A"
  analysis: string;                    // análisis personalizado (texto)
  carId?: string;
  sessionId?: string;
  actionType?: string;
}

export interface CarRecommendationPayload {
  type: "car_recommendation";
  introText: string;
  cars: Car[];
  outroText?: string;
}

export type TipoWidget =
  | "buttons"
  | "distance_slider"
  | "km_anuales_slider"
  | "pasajeros_slider"
  | "presupuesto_slider"
  | "presupuesto_unificado";

export interface QuickReplyConfig {
  type: TipoWidget;
  options?: string[];
  field?: string;
  multi_select?: boolean;
  submit_label?: string;
}

// Progreso del cuestionario inicial: pasos por TEMA (5), no por pregunta
export interface Progreso {
  paso: number;
  total: number;
  etiqueta?: string;
}

export interface CocheComparado {
  indice: number;
  nombre: string;                      // "#1 Toyota Corolla…"
}

export interface FilaComparacion {
  etiqueta: string;
  valores: string[];
  mejor_idx: number | null;
}

export interface CategoriaComparacion {
  nombre: string;
  icono: string;                       // emoji; se muestra sin él
  filas: FilaComparacion[];
}

export interface CarComparisonData {
  coches: CocheComparado[];
  categorias: CategoriaComparacion[];
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  additional_kwargs?: {
    payload?: CarRecommendationPayload;
    quick_replies?: string[];
    quick_reply_config?: QuickReplyConfig;
    car_comparison?: CarComparisonData;
    progreso?: Progreso;
  };
}
