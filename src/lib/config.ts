// URL del backend (agente CarBlau). Se fija al compilar: las variables
// NEXT_PUBLIC_* se incrustan en el bundle del navegador.
//   NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev   → backend local
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://carblau-agent-api-v4-1063747381969.europe-west1.run.app";

// Política de privacidad enlazada en el consentimiento del formulario de
// contacto. Sin ella, el texto del consentimiento se muestra sin enlace.
export const PRIVACY_URL = process.env.NEXT_PUBLIC_PRIVACY_URL || "";

// Contacto humano que ofrece el aviso de IA del chat (mismo que carblau.com)
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "647530888";
