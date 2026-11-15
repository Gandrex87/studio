"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { WelcomeScreen } from "@/components/carblau/welcome-screen";
import { ChatHeader } from "@/components/carblau/chat-header";
import { ChatMessage } from "@/components/carblau/chat-message";
import { CarResultsMessage } from "@/components/carblau/car-results-message";
import { CarComparisonTable } from "@/components/carblau/car-comparison-table";
import { ChatInput, type ChatInputHandle } from "@/components/carblau/chat-input";
import { InlineWidget } from "@/components/carblau/inline-widget";
import { sonAcciones } from "@/components/carblau/quick-replies";
import { BuscandoEstado } from "@/components/carblau/buscando-estado";
import { Arranque } from "@/components/carblau/arranque";
import { ProgresoCuestionario, textoProgreso } from "@/components/carblau/progreso-cuestionario";
import { EncargoChips, EncargoPanel, EncargoResumen } from "@/components/carblau/encargo";
import { ContactoSheet } from "@/components/carblau/contacto-sheet";
import { leerEncargo, textoCambio } from "@/lib/encargo";
import type { Car, Message, Progreso } from "@/lib/tipos";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Columns2, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

// Los tipos del contrato viven en src/lib/tipos.ts
export type { Message, CarRecommendationPayload, QuickReplyConfig } from "@/lib/tipos";

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════

const CLAVE_THREAD = "carblau_thread_id";

// sessionStorage puede no estar disponible (modo privado, bloqueado): nunca rompe la app.
// ?thread=<id> abre una conversación concreta (QA, soporte): manda sobre la guardada.
function leerThreadGuardado(): string | null {
  const deLaUrl = new URLSearchParams(window.location.search).get("thread");
  if (deLaUrl) return deLaUrl;
  try {
    return sessionStorage.getItem(CLAVE_THREAD);
  } catch {
    return null;
  }
}

function guardarThread(threadId: string | null) {
  try {
    if (threadId) sessionStorage.setItem(CLAVE_THREAD, threadId);
    else sessionStorage.removeItem(CLAVE_THREAD);
  } catch {
    /* sin persistencia: la conversación se pierde al recargar, como antes */
  }
}

// ?autostart=1: se llega desde un botón que ya expresa "quiero empezar"
// (carblau.com/asesor), así que la pantalla de bienvenida sobra
const inicioAutomatico = () =>
  new URLSearchParams(window.location.search).get("autostart") === "1";

const esRecomendacion = (m: Message) =>
  m.role === "agent" && m.additional_kwargs?.payload?.type === "car_recommendation";

// "Compara el 1 y el 3": la ruta consulta_coches_mostrados del backend lo entiende
function textoComparacion(numeros: number[]): string {
  const n = [...numeros].sort((a, b) => a - b);
  if (n.length === 2) return `Compara el ${n[0]} y el ${n[1]}`;
  return `Compara el ${n.slice(0, -1).join(", el ")} y el ${n[n.length - 1]}`;
}

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function Home() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Pasos que el backend va anunciando mientras procesa (eventos `status` y
  // `progress`): "Analizando tu respuesta", "Buscando vehículos…"
  const [pasosTurno, setPasosTurno] = useState<string[]>([]);

  // Fichas marcadas para comparar (números de la última tanda de resultados)
  const [comparar, setComparar] = useState<number[]>([]);
  // Móvil: la píldora «Tu encargo · n datos» despliega los chips
  const [encargoAbierto, setEncargoAbierto] = useState(false);

  // «Me interesa» desde la comparativa: coche para la hoja de contacto
  const [contactoCar, setContactoCar] = useState<Car | null>(null);
  // «Hablar con un especialista»: el agente respondió con solicitud_especialista y
  // se abre el formulario de contacto sin coche (una vez por mensaje)
  const [especialistaMsgId, setEspecialistaMsgId] = useState<string | null>(null);

  const [confirmarReinicio, setConfirmarReinicio] = useState(false);

  const isMobile = useIsMobile();
  // ?embed=1: dentro de carblau.com/asesor, que ya muestra el logo en su barra
  const [embebido, setEmbebido] = useState(false);
  useEffect(() => {
    setEmbebido(new URLSearchParams(window.location.search).get("embed") === "1");
  }, []);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const { toast } = useToast();

  // Ref para abortar streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mientras se intenta recuperar una conversación guardada (recarga de página)
  const [restaurando, setRestaurando] = useState(true);

  // ═══════════════════════════════════════════════════════════════════
  // RECUPERAR CONVERSACIÓN AL RECARGAR
  // El thread_id vive en sessionStorage: sobrevive a recargar la página,
  // no a cerrar la pestaña. Si caducó en el backend (404), se empieza de cero.
  // ═══════════════════════════════════════════════════════════════════
  // Con ?autostart=1 (botón de carblau.com) si no hay nada que recuperar se
  // empieza ya, sin pasar por la pantalla de bienvenida.
  useEffect(() => {
    const guardado = leerThreadGuardado();
    (async () => {
      if (guardado) {
        try {
          const response = await fetch(`${API_BASE_URL}/conversation/${guardado}/messages`);
          if (!response.ok) throw new Error(`status ${response.status}`);
          const data = await response.json();
          setThreadId(data.thread_id);
          guardarThread(data.thread_id);
          setMessages(data.messages);
          setSessionStarted(true);
          setRestaurando(false);
          return;
        } catch (error) {
          console.log("ℹ️ No se pudo recuperar la conversación guardada:", error);
          guardarThread(null);
        }
      }
      // Si falla, handleStartSession avisa con un toast y queda la bienvenida
      if (inicioAutomatico()) await handleStartSession();
      setRestaurando(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // SCROLL
  // Con mensajes del usuario y mientras el agente piensa, al fondo.
  // Cuando llega respuesta del agente, al INICIO de esa respuesta: si es larga
  // (fichas de coches, comparativa) se lee desde el principio y no desde el
  // texto final. Si es corta, el navegador limita el scroll y queda igual que
  // ir al fondo. El control de respuesta va dentro del mensaje, así que no
  // hace falta recolocar nada cuando aparece.
  // ═══════════════════════════════════════════════════════════════════
  const mensajesPreviosRef = useRef(0);

  const scrollTo = (top: number) => {
    // requestAnimationFrame asegura que el DOM se haya actualizado con el nuevo texto
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({
        top,
        behavior: "auto", // "auto" evita que el streaming sature el móvil con animaciones
      });
    });
  };

  useEffect(() => {
    const previos = mensajesPreviosRef.current;
    mensajesPreviosRef.current = messages.length;
    const container = scrollAreaRef.current;
    if (!container) return;

    // previos === 0: conversación nueva o recuperada → al fondo
    const primerNuevoAgente =
      previos > 0 ? messages.slice(previos).find((m) => m.role === "agent") : undefined;

    if (!primerNuevoAgente) {
      scrollTo(container.scrollHeight);
      return;
    }
    requestAnimationFrame(() => {
      const el = container.querySelector<HTMLElement>(
        `[data-msg-id="${CSS.escape(primerNuevoAgente.id)}"]`
      );
      if (!el) return scrollTo(container.scrollHeight);
      const margen = 16;
      scrollTo(
        container.scrollTop + el.getBoundingClientRect().top - container.getBoundingClientRect().top - margen
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Al empezar a cargar aparece el estado de búsqueda: que se vea.
  // Al terminar no se mueve, para no deshacer el scroll a la respuesta.
  useEffect(() => {
    if (isLoading && scrollAreaRef.current) scrollTo(scrollAreaRef.current.scrollHeight);
  }, [isLoading]);

  useEffect(() => {
    if (!isMobile && messages.length > 0 && !isLoading && messages[messages.length - 1].role === "agent") {
      chatInputRef.current?.focus();
    }
  }, [messages, isLoading, isMobile]);

  // ═══════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════

  const handleStartSession = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to start session");
      }

      const data = await response.json();

      console.log("📥 Inicio de sesión - datos recibidos:", data);

      setThreadId(data.thread_id);
      guardarThread(data.thread_id);
      setMessages(data.messages);
      setSessionStarted(true);
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        variant: "destructive",
        title: "No hemos podido iniciar la conversación",
        description: "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const anotarPaso = (texto: string) => {
    if (!texto) return;
    setPasosTurno((prev) => (prev[prev.length - 1] === texto ? prev : [...prev, texto]));
  };

  // Envío con STREAMING (SSE): progress → complete | error
  const handleSendMessage = async (content: string) => {
    if (isLoading || !threadId) {
      console.warn("⚠️ No se puede enviar: isLoading o threadId faltante");
      return;
    }

    // Mensaje del usuario
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    console.log("📤 Enviando mensaje:", content);

    // Actualización optimista del mensaje del usuario
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setPasosTurno([]);

    // Crear AbortController para poder cancelar
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${threadId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: content }],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // 429 (límite de uso) / 413 (mensaje largo): el backend explica qué pasa
        let detalle = "";
        try {
          detalle = (await response.json())?.detail ?? "";
        } catch {
          /* sin cuerpo JSON */
        }
        const error: any = new Error(`HTTP ${response.status}`);
        if (response.status === 429 || response.status === 413) error.detalleUsuario = detalle;
        throw error;
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      // Procesar el stream línea a línea (una línea `data: {json}` por evento)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let recibioRespuesta = false;
      let errorBackend = false;

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("✅ Streaming completado");
          break;
        }

        // Acumular en buffer: un chunk puede traer media línea
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // fragmento incompleto para el siguiente chunk

        for (const line of lines) {
          if (!line.trim()) continue;

          // Quitar prefijo SSE estándar
          const data = line.startsWith("data: ") ? line.slice(6) : line;

          // Ignorar líneas de keepalive (empiezan con ":")
          if (data.startsWith(":")) continue;

          // Solo el parseo va en try/catch: un evento "error" del backend NO
          // debe tragarse aquí.
          let event: any;
          try {
            event = JSON.parse(data);
          } catch (parseError) {
            console.warn("⚠️ Error parseando línea:", line, parseError);
            continue;
          }
          console.log("📦 Evento recibido:", event.type);

          if (event.type === "status") {
            anotarPaso(event.message);
          } else if (event.type === "progress") {
            anotarPaso(event.status);
          } else if (event.type === "complete") {
            recibioRespuesta = true;
            setPasosTurno([]);

            const nuevosMensajes: Message[] = event.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              additional_kwargs: msg.additional_kwargs,
            }));
            // Nueva tanda de resultados: la selección para comparar ya no vale
            if (nuevosMensajes.some(esRecomendacion)) setComparar([]);
            setMessages((prev) => [...prev, ...nuevosMensajes]);
            const pideEspecialista = nuevosMensajes.find(
              (m) => m.role === "agent" && m.additional_kwargs?.solicitud_especialista
            );
            if (pideEspecialista) setEspecialistaMsgId(pideEspecialista.id);
          } else if (event.type === "error") {
            console.error("❌ Error del backend:", event.message);
            errorBackend = true;
          }
        }
      }

      // Error del agente, o el stream se cortó sin traer respuesta
      if (!recibioRespuesta) {
        throw new Error(errorBackend ? "Error del agente" : "El stream terminó sin respuesta");
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("🛑 Streaming cancelado");
      } else {
        console.error("❌ Error en streaming:", error);

        toast({
          variant: "destructive",
          title: "No hemos podido responder",
          description:
            error.detalleUsuario ||
            "Ha habido un problema técnico. Tu mensaje sigue en la caja de texto: vuelve a enviarlo en unos segundos.",
        });

        // Quitar el mensaje de la conversación y devolverlo a la caja de texto
        // para que el usuario pueda reenviarlo sin reescribirlo
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        chatInputRef.current?.setText(content);
      }
    } finally {
      setIsLoading(false);
      setPasosTurno([]);
      abortControllerRef.current = null;
    }
  };

  const handleQuickReplySelect = (option: string) => {
    console.log("🔘 Quick reply seleccionada:", option);
    handleSendMessage(option);
  };

  const toggleComparar = (numero: number) => {
    setComparar((prev) => (prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]));
  };

  const enviarComparacion = () => {
    if (comparar.length < 2) return;
    const texto = textoComparacion(comparar);
    setComparar([]);
    handleSendMessage(texto);
  };

  const handleResetSession = () => {
    console.log("🔄 Reiniciando sesión");

    // Cancelar streaming si está activo
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setConfirmarReinicio(false);
    setSessionStarted(false);
    setThreadId(null);
    guardarThread(null);
    setMessages([]);
    setIsLoading(false);
    setPasosTurno([]);
    setComparar([]);
    setContactoCar(null);
    if (inicioAutomatico()) handleStartSession();
  };

  // "Tu encargo": pulsar un dato pide al agente volver a preguntarlo
  // («Quiero cambiar: Presupuesto», ruta corregir_tema del backend)
  const cambiarDato = (etiqueta: string) => {
    if (isLoading) return;
    handleSendMessage(textoCambio(etiqueta));
  };

  // Coche de una tanda de resultados por su carId (para la comparativa)
  const buscarCoche = (carId: string): Car | undefined => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const coche = messages[i].additional_kwargs?.payload?.cars?.find((c) => c.carId === carId);
      if (coche) return coche;
    }
    return undefined;
  };

  // ═══════════════════════════════════════════════════════════════════
  // DERIVADOS
  // ═══════════════════════════════════════════════════════════════════

  // Progreso: el de la última pregunta del agente que lo traiga. Se oculta en
  // cuanto llegan recomendaciones (el cuestionario ha terminado) o si el
  // backend no lo manda.
  const progreso: Progreso | null = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const kwargs = messages[i].additional_kwargs;
      if (messages[i].role !== "agent" || !kwargs) continue;
      if (kwargs.payload?.type === "car_recommendation") return null;
      const p = kwargs.progreso;
      if (p && Number.isFinite(p.paso) && Number.isFinite(p.total) && p.total > 0) return p;
    }
    return null;
  })();

  // "Tu encargo": del backend (fase 2) o, si no llega, leído de la conversación
  const encargo = useMemo(() => leerEncargo(messages), [messages]);

  // Solo la última tanda de resultados se puede comparar (el backend numera
  // los coches de la tanda actual)
  const indiceUltimaRecomendacion = (() => {
    for (let i = messages.length - 1; i >= 0; i--) if (esRecomendacion(messages[i])) return i;
    return -1;
  })();

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  // Arranque: solo el saludo del agente y nada del usuario todavía. Se enseña la
  // pregunta inicial en grande con tres formas de empezar (components/carblau/arranque.tsx).
  const esArranque = !isLoading && messages.length === 1 && messages[0].role === "agent";

  return (
    <main className="relative flex h-[100dvh] flex-col overflow-hidden bg-cb-espresso text-cb-crema">
      {restaurando ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-cb-agua" />
        </div>
      ) : !sessionStarted ? (
        <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} embebido={embebido} />
      ) : (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-[1280px]">
          {/* Escritorio: panel lateral con el encargo */}
          <div
            className={`hidden lg:flex lg:w-[320px] lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-cb-crema/10 lg:px-6 lg:pb-6 ${embebido ? "lg:pt-6" : "lg:pt-3"} cb-scroll`}
          >
            {/* Marca, a la altura de la cabecera del chat. Dentro de carblau.com la pone la landing. */}
            {!embebido && (
              <div className="mb-5 flex h-10 items-center">
                <img src="/logo3.png" alt="CarBlau" className="h-6 w-auto" />
              </div>
            )}
            <EncargoPanel encargo={encargo} onCambiar={cambiarDato} disabled={isLoading} />
          </div>

          <section className="relative isolate flex h-full min-w-0 flex-1 flex-col" aria-label="Conversación">
            {/* Luz de fondo: resplandor arriba que se funde en espresso (globals.css) */}
            <div aria-hidden="true" className="cb-luz pointer-events-none absolute inset-0 -z-10" />
            <ChatHeader onReiniciar={() => setConfirmarReinicio(true)} />

            {/* Una sola fila fina: línea de progreso, píldora del encargo (móvil) y paso */}
            {(progreso || encargo.temas.length > 0) && (
              <div className={`flex flex-col ${progreso ? "" : "lg:hidden"}`}>
                {progreso && <ProgresoCuestionario progreso={progreso} />}
                <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-2.5">
                  <div className="min-w-0 lg:hidden">
                    <EncargoResumen
                      encargo={encargo}
                      abierto={encargoAbierto}
                      onToggle={() => setEncargoAbierto((v) => !v)}
                    />
                  </div>
                  {progreso && (
                    <span className="ml-auto truncate text-xs text-cb-crema-suave">{textoProgreso(progreso)}</span>
                  )}
                </div>
                {encargoAbierto && (
                  <div className="lg:hidden">
                    <EncargoChips encargo={encargo} onCambiar={cambiarDato} disabled={isLoading} />
                  </div>
                )}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden cb-scroll" ref={scrollAreaRef}>
              <div
                className={`mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 ${comparar.length >= 2 ? "pb-40" : "pb-28"} ${esArranque ? "min-h-full" : ""}`}
              >
                {esArranque && <Arranque onElegir={handleSendMessage} disabled={isLoading} />}
                {!esArranque &&
                  messages.map((message, index) => {
                  const esUltimo = index === messages.length - 1;
                  const config =
                    esUltimo && !isLoading && message.role === "agent"
                      ? message.additional_kwargs?.quick_reply_config
                      : undefined;

                  if (esRecomendacion(message)) {
                    const esUltimaTanda = index === indiceUltimaRecomendacion;
                    return (
                      <div key={message.id} data-msg-id={message.id}>
                        <CarResultsMessage
                          data={message.additional_kwargs!.payload!}
                          threadId={threadId}
                          mensajeId={message.id}
                          comparar={esUltimaTanda ? comparar : undefined}
                          onToggleComparar={esUltimaTanda ? toggleComparar : undefined}
                          acciones={
                            config ? (
                              <InlineWidget
                                config={config}
                                onSelect={handleQuickReplySelect}
                                isLoading={isLoading}
                                tono="oscuro"
                              />
                            ) : undefined
                          }
                        />
                      </div>
                    );
                  }

                  const comparacion = message.additional_kwargs?.car_comparison;
                  // Con comparativa, `content` repite el veredicto que ya pinta la tabla
                  const contenido = comparacion?.narrativa ?? message.content;
                  // Acciones («qué hacemos ahora») tras la comparativa o sin resultados:
                  // sobre el fondo, como tras las fichas; las respuestas a una pregunta, en la tarjeta
                  const esAccion = config?.type === "buttons" && !config.multi_select && sonAcciones(config.options);
                  return (
                    <div key={message.id} data-msg-id={message.id} className="flex flex-col gap-4">
                      <ChatMessage role={message.role} content={contenido} pendiente={Boolean(config) && !esAccion}>
                        {comparacion && (
                          <CarComparisonTable
                            data={comparacion}
                            disabled={isLoading}
                            onInteresa={(carId) => {
                              const coche = buscarCoche(carId);
                              if (coche) setContactoCar(coche);
                            }}
                          />
                        )}
                        {config && !esAccion && (
                          <div className={comparacion ? "mt-4" : undefined}>
                            <InlineWidget config={config} onSelect={handleQuickReplySelect} isLoading={isLoading} />
                          </div>
                        )}
                      </ChatMessage>
                      {config && esAccion && (
                        <div className="flex flex-col gap-2">
                          <span className="pl-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-cb-crema-tenue">
                            ¿Qué hacemos ahora?
                          </span>
                          <InlineWidget config={config} onSelect={handleQuickReplySelect} isLoading={isLoading} tono="oscuro" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {isLoading && <BuscandoEstado pasos={pasosTurno} />}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Caja de texto flotante sobre la conversación (el contenido pasa por debajo) */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
              <div className="pointer-events-auto mx-auto flex w-full max-w-3xl flex-col gap-2">
                {comparar.length >= 2 && !isLoading && (
                  <button
                    type="button"
                    onClick={enviarComparacion}
                    className="inline-flex h-[46px] items-center justify-center gap-2 rounded-full bg-cb-agua text-[15px] font-bold text-cb-navy shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-crema"
                  >
                    <Columns2 className="h-[18px] w-[18px]" />
                    Comparar {comparar.length} coches
                  </button>
                )}
                <ChatInput
                  ref={chatInputRef}
                  onSubmit={handleSendMessage}
                  isLoading={isLoading}
                  placeholder={esArranque ? "Escríbelo con tus palabras…" : undefined}
                />
              </div>
            </div>
          </section>
        </div>
      )}

      {/* «Me interesa» desde la comparativa (las fichas llevan su propia hoja) */}
      {contactoCar && (
        <ContactoSheet
          key={contactoCar.carId}
          car={contactoCar}
          abierto
          onOpenChange={(abierto) => {
            if (!abierto) setContactoCar(null);
          }}
        />
      )}

      {/* «Hablar con un especialista»: lead sin coche con el encargo de la conversación */}
      {especialistaMsgId && threadId && (
        <ContactoSheet
          key={especialistaMsgId}
          sessionId={threadId}
          abierto
          onOpenChange={(abierto) => {
            if (!abierto) setEspecialistaMsgId(null);
          }}
        />
      )}

      {/* Reiniciar borra toda la conversación: se confirma antes */}
      <AlertDialog open={confirmarReinicio} onOpenChange={setConfirmarReinicio}>
        <AlertDialogContent className="border-cb-crema/15 bg-cb-espresso-2 text-cb-crema">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-xl">¿Empezar de cero?</AlertDialogTitle>
            <AlertDialogDescription className="text-cb-crema-suave">
              Se borrarán tus respuestas y las propuestas de esta conversación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-cb-crema/25 bg-transparent text-cb-crema hover:bg-cb-crema/10 hover:text-cb-crema">
              Seguir conversando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetSession}
              className="rounded-full bg-cb-agua font-bold text-cb-navy hover:bg-cb-agua/90"
            >
              Empezar de cero
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
