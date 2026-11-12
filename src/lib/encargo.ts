import type { Message } from "@/lib/tipos";
import { resumir, sinEmoji } from "@/lib/texto";

// "Tu encargo": lo que el usuario ya ha contado.
//
// Con el backend de la fase 2 llega en `additional_kwargs.encargo` de cada
// mensaje del agente, calculado desde los valores guardados (vale con datos
// dados de golpe, correcciones e inferencias). Cada item se puede cambiar: el
// front envía `Quiero cambiar: <etiqueta>` y el agente vuelve a preguntarlo.
//
// Sin ese campo (backend anterior) se deduce de la conversación: la pregunta
// con `progreso.etiqueta` y la respuesta que la sigue. Esos items no se pueden
// cambiar desde aquí.

export interface ItemEncargo {
  etiqueta: string;
  texto: string;
  cambiable: boolean;
}

export interface TemaEncargo {
  tema: string;
  items: ItemEncargo[];
}

export interface Encargo {
  temas: TemaEncargo[];
  completo: boolean;
  delBackend: boolean;
}

export const ENCARGO_VACIO: Encargo = { temas: [], completo: false, delBackend: false };

export const textoCambio = (etiqueta: string) => `Quiero cambiar: ${etiqueta}`;

export function leerEncargo(messages: Message[]): Encargo {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const e = m.role === "agent" ? m.additional_kwargs?.encargo : undefined;
    if (!e || !Array.isArray(e.temas)) continue;
    return {
      delBackend: true,
      completo: Boolean(e.completo),
      temas: e.temas
        .map((t) => ({
          tema: t.tema,
          items: (t.items ?? [])
            .filter((it) => it.texto)
            .map((it) => ({ etiqueta: it.etiqueta, texto: it.texto, cambiable: true })),
        }))
        .filter((t) => t.items.length > 0),
    };
  }
  return { delBackend: false, completo: false, temas: derivarEncargo(messages) };
}

export function derivarEncargo(messages: Message[]): TemaEncargo[] {
  const temas: TemaEncargo[] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    const pregunta = messages[i];
    const respuesta = messages[i + 1];
    if (pregunta.role !== "agent" || respuesta.role !== "user") continue;
    const tema = pregunta.additional_kwargs?.progreso?.etiqueta;
    if (!tema) continue;
    // Sin el emoji ni la aclaración entre paréntesis: "A diario (incluso varias
    // veces al día)" → "A diario"
    const texto = resumir(sinEmoji(respuesta.content).replace(/\s*\([^)]*\)/g, "").trim());
    if (!texto) continue;
    const existente = temas.find((t) => t.tema === tema);
    const item = { etiqueta: tema, texto, cambiable: false };
    if (!existente) temas.push({ tema, items: [item] });
    else if (!existente.items.some((it) => it.texto === texto)) existente.items.push(item);
  }
  return temas;
}

// Lista plana para los chips (una por respuesta)
export function itemsEncargo(encargo: Encargo): ItemEncargo[] {
  return encargo.temas.flatMap((t) => t.items);
}
