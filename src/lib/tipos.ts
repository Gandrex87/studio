// Contrato con el backend (carblau-agent-api). Lo que llega en cada mensaje
// del agente va en `additional_kwargs`; el detalle está en el README y en el
// CLAUDE.md del backend («Agent message contract»). Todo lo de la fase 2
// (encargo, encaje, razones, aviso, datos, veredicto…) es opcional: el front
// funciona sin ello.

export interface DatosCoche {
  combustible?: string;
  anio?: number;
  traccion?: string;
  plazas?: number;
  cambio?: string;
  carroceria?: string;
}

export interface Car {
  name: string;                        // "1. Toyota Corolla…" (numerado por el backend)
  specs: string[];                     // tipo de mecánica, año, tracción (texto)
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
  // Fase 2 (utils/fichas.py del backend): deterministas, sin LLM
  encaje?: number | null;              // 0–99, monótono con la puntuación
  razones?: string[];                  // 2–3 frases ligadas a las respuestas del usuario
  aviso?: string | null;               // la pega principal para este usuario
  datos?: DatosCoche;                  // specs con clave, ya legibles
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
  campo?: string;                      // campo preguntado (fase 2)
}

// "Tu encargo": lo que el usuario ya ha contado, desde los valores guardados
// en el estado del agente (fase 2). Para cambiar un dato el front envía
// `Quiero cambiar: <etiqueta o tema>` y el backend vuelve a preguntarlo.
export interface ItemEncargoApi {
  campo: string;
  etiqueta: string;
  texto: string;
}

export interface EncargoApi {
  completo: boolean;
  temas: { tema: string; items: ItemEncargoApi[] }[];
}

export interface CocheComparado {
  indice: number;
  nombre: string;                      // "#1 Toyota Corolla…"
  carId?: string | null;               // fase 2: el mismo que en la ficha
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
  narrativa?: string;                  // fase 2: el texto sin el veredicto
  veredicto?: string | null;           // fase 2: 1–2 frases con la recomendación
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
    encargo?: EncargoApi;
  };
}

export type CanalContacto = "whatsapp" | "llamada" | "email";
export type FranjaContacto = "manana" | "tarde" | "cualquiera";
