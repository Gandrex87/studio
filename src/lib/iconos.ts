import {
  Backpack,
  Ban,
  BatteryCharging,
  Building2,
  Bus,
  Calendar,
  CalendarDays,
  Car,
  CarFront,
  Caravan,
  Check,
  CircleHelp,
  Clock,
  CreditCard,
  Expand,
  Feather,
  Footprints,
  Fuel,
  Gauge,
  Gem,
  Home,
  Joystick,
  Lightbulb,
  Luggage,
  Minus,
  Mountain,
  Package,
  RefreshCw,
  Route,
  Ruler,
  Scale,
  Settings2,
  Shrink,
  Shuffle,
  Square,
  Tag,
  ThumbsUp,
  TreePine,
  Truck,
  UserRound,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// El backend pone un emoji delante de cada opción de respuesta («💨 A diario»,
// «🏷️ No me gustan estas marcas»). La interfaz no enseña emojis: aquí se
// traduce cada uno a su icono de línea. Primero se busca la secuencia entera
// («👥🧳»), después el primer emoji. Sin emoji o sin traducción, sin icono.
const POR_EMOJI: Record<string, LucideIcon> = {
  // Uso del coche
  "💨": Zap,
  "🔄": RefreshCw,
  "🕐": Clock,
  "🗓️": CalendarDays,
  "🛣️": Route,
  "🏘️": Home,
  "🚦": Building2,
  "⛰️": Mountain,
  "🌲": TreePine,
  // Espacio y pasajeros
  "📦": Package,
  "🪶": Feather,
  "👤": UserRound,
  "👥": Users,
  "👥🧳": Luggage,
  "🚶": Footprints,
  "🚶🧳": Backpack,
  "🧳": Luggage,
  // Sí / no / no sé
  "✅": Check,
  "❌": X,
  "🤷": CircleHelp,
  "🤔": Shuffle,
  "➖": Minus,
  "💡": Lightbulb,
  "👍": ThumbsUp,
  // Dinero
  "💰": Wallet,
  "💳": CreditCard,
  "💎": Gem,
  "⚖️": Scale,
  // Motor y cambio
  "⚡": BatteryCharging,
  "⛽": Fuel,
  "⚙️": Settings2,
  "🕹️": Joystick,
  // Tamaño y carrocería
  "🔹": Shrink,
  "🔸": Square,
  "🔶": Expand,
  "🚙": Car,
  "🏔️": Mountain,
  "🛻": Truck,
  "🏎️": CarFront,
  "🚗": Car,
  "🚘": CarFront,
  "🚐": Bus,
  "🚚": Truck,
  "🏕️": Caravan,
  // Ronda «¿Qué no te convence?»
  "📅": Calendar,
  "📏": Ruler,
  "🏷️": Tag,
  "🏁": Gauge,
  "🚫": Ban,
};

// La secuencia de emojis con la que empieza el texto («👥🧳 Acompañado…» → «👥🧳»)
const EMOJIS_INICIALES = new RegExp("^(?:\\p{Extended_Pictographic}\\uFE0F?)+", "u");
const UN_EMOJI = new RegExp("^\\p{Extended_Pictographic}\\uFE0F?", "u");

export function iconoDeOpcion(texto: string): LucideIcon | null {
  const secuencia = texto.trim().match(EMOJIS_INICIALES)?.[0];
  if (!secuencia) return null;
  const primero = secuencia.match(UN_EMOJI)?.[0] ?? secuencia;
  return POR_EMOJI[secuencia] ?? POR_EMOJI[primero] ?? POR_EMOJI[primero.replace("️", "")] ?? null;
}

// Los iconos se enseñan solo cuando toda la lista los tiene: una lista a medias
// descoloca más que una sin iconos
export function iconosDeOpciones(options: string[]): (LucideIcon | null)[] | null {
  const iconos = options.map(iconoDeOpcion);
  return iconos.every(Boolean) ? iconos : null;
}
