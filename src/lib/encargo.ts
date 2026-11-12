import type { Message } from "@/lib/tipos";
import { resumir, sinEmoji } from "@/lib/texto";

// "Tu encargo": lo que el usuario ya ha contado, deducido de la conversación.
// Cada pregunta del cuestionario trae `progreso.etiqueta` (el tema); la
// respuesta es el mensaje del usuario que la sigue. Un tema puede tener varias
// respuestas (uso del coche: frecuencia, distancia, km al año). El backend no
// envía hoy el perfil extraído: esto es una lectura fiel de la conversación,
// no del estado interno del agente (fase 2: `encargo` en additional_kwargs).
export interface ItemEncargo {
  tema: string;
  respuestas: string[];
}

export function derivarEncargo(messages: Message[]): ItemEncargo[] {
  const items: ItemEncargo[] = [];
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
    const item = items.find((it) => it.tema === tema);
    if (!item) items.push({ tema, respuestas: [texto] });
    else if (!item.respuestas.includes(texto)) item.respuestas.push(texto);
  }
  return items;
}

// Lista plana para los chips (una por respuesta)
export function respuestasEncargo(items: ItemEncargo[]): { tema: string; respuesta: string }[] {
  return items.flatMap((it) => it.respuestas.map((respuesta) => ({ tema: it.tema, respuesta })));
}
