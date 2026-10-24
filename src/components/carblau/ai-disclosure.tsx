import { CONTACT_PHONE } from "@/lib/config";

const WHATSAPP_MSG = encodeURIComponent("Hola, vengo del asistente virtual de CarBlau y prefiero hablar con una persona.");

// Aviso de que el usuario habla con una IA (art. 50.1 del Reglamento de IA).
// Lo pinta el frontend bajo la caja de texto, siempre visible, para no
// depender del modelo.
export function AiDisclosure() {
  return (
    <p className="-mt-1 text-center text-[11px] leading-snug text-slate-500">
      Estás hablando con el asistente de IA de CarBlau. Sus respuestas son orientativas y puede
      equivocarse. Si prefieres hablar con una persona,{" "}
      <a href={`tel:+34${CONTACT_PHONE}`} className="underline underline-offset-2 hover:text-[#082144]">
        llámanos
      </a>{" "}
      o escríbenos por{" "}
      <a
        href={`https://wa.me/34${CONTACT_PHONE}?text=${WHATSAPP_MSG}`}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-[#082144]"
      >
        WhatsApp
      </a>
      .
    </p>
  );
}
