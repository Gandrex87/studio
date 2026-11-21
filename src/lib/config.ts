// URL del backend (agente CarBlau). Se fija al compilar: las variables
// NEXT_PUBLIC_* se incrustan en el bundle del navegador.
//   NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev   → backend local
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://carblau-agent-api-v4-1063747381969.europe-west1.run.app";

// Política de privacidad enlazada en el consentimiento RGPD del formulario de
// contacto (la de carblau.com)
export const PRIVACY_URL =
  process.env.NEXT_PUBLIC_PRIVACY_URL || "https://carblau.com/politica-de-privacidad";

// Contacto humano que ofrece el aviso de IA del chat (mismo que carblau.com)
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "647530888";

// Tipo de evento de Cal.com para reservar la llamada con un especialista: lo que
// va detrás de cal.com/ («carblau/15min»). Con «off» no se ofrece elegir día y hora.
const CALCOM_BRUTO = process.env.NEXT_PUBLIC_CALCOM_EVENT || "carblau/15min";
export const CALCOM_EVENT =
  CALCOM_BRUTO === "off"
    ? ""
    : CALCOM_BRUTO.replace(/^https?:\/\/(?:app\.)?cal\.com\//, "").replace(/^\/+|\/+$/g, "");
