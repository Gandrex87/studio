"use client";

// Mismo avatar y burbuja que los mensajes del agente (ChatMessage), para que
// el paso de "escribiendo..." a la respuesta no cambie de aspecto.
export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3" role="status" aria-label="El asistente está escribiendo">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden">
        <img
          src="/favicon_cb.webp"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex items-center space-x-1.5 rounded-2xl rounded-tl-none px-5 py-4 shadow-md bg-[#ECEBE7]">
        <div className="h-2 w-2 rounded-full bg-slate-500 typing-dot" />
        <div className="h-2 w-2 rounded-full bg-slate-500 typing-dot" />
        <div className="h-2 w-2 rounded-full bg-slate-500 typing-dot" />
      </div>
    </div>
  );
}
