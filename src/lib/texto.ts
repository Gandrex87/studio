// Utilidades de texto compartidas por los componentes del chat.

// Las opciones del backend llevan un emoji delante o detrás ("🚙 SUV",
// "Ninguno ❌"). Se ENSEÑAN sin él y se ENVÍAN tal cual: el interceptor del
// backend compara el texto completo. Solo pictogramas (no dígitos ni símbolos
// de texto), con sus modificadores (variación, tono de piel, ZWJ, banderas).
const PICTO =
  "(?:\\p{Extended_Pictographic}|[\\u{1F3FB}-\\u{1F3FF}]|[\\u{1F1E6}-\\u{1F1FF}]|\\u200D|\\uFE0F)";
const EMOJI_INICIAL = new RegExp(`^(?:${PICTO}|\\s)+`, "u");
const EMOJI_FINAL = new RegExp(`(?:${PICTO}|\\s)+$`, "u");
// Respuestas de selección múltiple («⛽ Gasolina y 🔋 Híbrido»): el emoji de cada opción
const EMOJI_TRAS_SEPARADOR = new RegExp(`(\\s+y\\s+|,\\s*)(?:${PICTO})+\\s*`, "gu");

export function sinEmoji(texto: string): string {
  const limpio = texto
    .replace(EMOJI_INICIAL, "")
    .replace(EMOJI_FINAL, "")
    .replace(EMOJI_TRAS_SEPARADOR, "$1")
    .trim();
  return limpio || texto.trim();
}

// "1. Toyota Corolla" → "Toyota Corolla"; "#2 Mazda" → "Mazda"
export function nombreLimpio(nombre: string): string {
  return nombre.replace(/^(?:\d+\.|#\d+)\s*/, "").trim();
}

// "1. Toyota Corolla" → 1; sin número → null
export function numeroFicha(nombre: string): number | null {
  const m = nombre.match(/^(?:(\d+)\.|#(\d+))\s*/);
  if (!m) return null;
  return Number(m[1] ?? m[2]);
}

// "85.23 pts" → "85"; "N/A" → null
export function puntuacionEntera(score: string): string | null {
  const m = score.replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = Math.round(parseFloat(m[0]));
  return Number.isFinite(n) ? String(n) : null;
}

// Resumen corto para los chips del encargo
export function resumir(texto: string, max = 36): string {
  const plano = texto.replace(/\s+/g, " ").trim();
  if (plano.length <= max) return plano;
  const corte = plano.lastIndexOf(" ", max - 1);
  return `${plano.slice(0, corte > max / 2 ? corte : max - 1)}…`;
}

// Miles con punto, siempre (toLocaleString no agrupa 4 cifras)
export function miles(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
