// Cal.com incrustado (embed.js oficial) para reservar la llamada con un
// especialista. El script se carga bajo demanda y una sola vez; hasta que carga,
// las llamadas a `Cal(...)` se encolan (es el snippet que da Cal.com, en TS).
// Documentado en cal.com/help/embedding: `inline` monta el calendario en un
// elemento, `config` rellena el formulario (name, email, notes,
// attendeePhoneNumber si el evento tiene la pregunta «Phone number») y el evento
// `bookingSuccessfulV2` trae `startTime`/`endTime` de la cita.
const EMBED_JS = "https://app.cal.com/embed/embed.js";
export const NS_CAL = "llamada";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Llamable = (...args: any[]) => void;
type CalApi = Llamable & { ns: Record<string, Llamable>; loaded?: boolean; q?: unknown[] };

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

export function cargarCal(): CalApi {
  if (window.Cal) return window.Cal;
  const encolar = (a: { q?: unknown[] }, ar: unknown) => {
    (a.q = a.q || []).push(ar);
  };
  const Cal = function (...ar: unknown[]) {
    const cal = window.Cal as CalApi;
    if (!cal.loaded) {
      cal.ns = {};
      cal.q = cal.q || [];
      document.head.appendChild(document.createElement("script")).src = EMBED_JS;
      cal.loaded = true;
    }
    if (ar[0] === "init") {
      const api = function (...args: unknown[]) {
        encolar(api, args);
      } as Llamable & { q?: unknown[] };
      api.q = api.q || [];
      const namespace = ar[1];
      if (typeof namespace === "string") {
        cal.ns[namespace] = cal.ns[namespace] || api;
        encolar(cal.ns[namespace] as Llamable & { q?: unknown[] }, ar);
        encolar(cal, ["initNamespace", namespace]);
      } else {
        encolar(cal, ar);
      }
      return;
    }
    encolar(cal, ar);
  } as CalApi;
  Cal.ns = {};
  window.Cal = Cal;
  return Cal;
}

// Un solo oyente de reservas por página (el embed no documenta cómo quitar uno):
// se registra la primera vez y avisa a quien esté escuchando en ese momento
let escuchando = false;
let alReservar: ((inicio: Date, fin: Date | null) => void) | null = null;

export function escucharReserva(fn: ((inicio: Date, fin: Date | null) => void) | null) {
  alReservar = fn;
  if (escuchando || !fn) return;
  escuchando = true;
  cargarCal().ns[NS_CAL]("on", {
    action: "bookingSuccessfulV2",
    callback: (e: { detail?: { data?: { startTime?: string; endTime?: string } } }) => {
      const datos = e?.detail?.data;
      const inicio = datos?.startTime ? new Date(datos.startTime) : null;
      if (!inicio || Number.isNaN(inicio.getTime())) return;
      const fin = datos?.endTime ? new Date(datos.endTime) : null;
      alReservar?.(inicio, fin && !Number.isNaN(fin.getTime()) ? fin : null);
    },
  });
}

// «el martes 24 de noviembre a las 17:30»
export function textoCita(inicio: Date): string {
  const dia = inicio.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).replace(",", "");
  const hora = inicio.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return `el ${dia} a las ${hora}`;
}

// "600 123 456" → "+34600123456" (Cal.com quiere el teléfono en formato E.164).
// Sin prefijo claro, null: que lo escriba en la reserva.
export function telefonoE164(telefono: string): string | null {
  const limpio = telefono.replace(/[^\d+]/g, "");
  if (!limpio) return null;
  if (limpio.startsWith("+")) return limpio;
  if (limpio.startsWith("00")) return `+${limpio.slice(2)}`;
  if (/^[6789]\d{8}$/.test(limpio)) return `+34${limpio}`;
  return null;
}
