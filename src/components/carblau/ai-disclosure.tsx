import { TEL_URL, WHATSAPP_URL } from "@/components/carblau/chat-header";

// Aviso de que el usuario habla con una IA (art. 50.1 del Reglamento de IA).
// Lo pinta el frontend bajo la caja de texto, siempre visible, para no
// depender del modelo.
export function AiDisclosure() {
  return (
    <p className="text-center text-[11px] leading-snug text-cb-crema-tenue">
      Hablas con la IA de CarBlau: respuestas orientativas, puede equivocarse.{" "}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cb-agua underline underline-offset-2 hover:text-cb-crema"
      >
        Hablar con una persona
      </a>{" "}
      o{" "}
      <a href={TEL_URL} className="text-cb-agua underline underline-offset-2 hover:text-cb-crema">
        llamar
      </a>
      .
    </p>
  );
}
