"use client";

import { useState, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { WelcomeScreen } from "@/components/carblau/welcome-screen";
import { ChatMessage } from "@/components/carblau/chat-message";
import { CarResultsMessage } from "@/components/carblau/car-results-message";
import { CarComparisonTable, type CarComparisonData } from "@/components/carblau/car-comparison-table";
import { ChatInput, type ChatInputHandle } from "@/components/carblau/chat-input";
import { QuickReplies } from "@/components/carblau/quick-replies";
import { DistanceSlider } from "@/components/carblau/distance-slider";
import { PresupuestoSlider } from "@/components/carblau/presupuesto-slider";
import { PresupuestoUnificado } from "@/components/carblau/presupuesto-unificado";
import { PasajerosSlider } from "@/components/carblau/pasajeros-slider";
import { KmAnualesSlider } from "@/components/carblau/km-anuales-slider";
import { TypingIndicator } from "@/components/carblau/typing-indicator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RotateCw, Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";

// ═══════════════════════════════════════════════════════════════════
// INTERFACES (sin cambios)
// ═══════════════════════════════════════════════════════════════════

interface Car {
  name: string;
  specs: string[];
  imageUrl?: string;
  price: string;
  score: string;
  analysis: string;
  carId?: string;
  sessionId?: string;
  actionType?: string;
}

export interface CarRecommendationPayload {
  type: "car_recommendation";
  introText: string;
  cars: Car[];
  outroText?: string;
}

export interface QuickReplyConfig {
  type: "buttons" | "distance_slider" | "km_anuales_slider" | "pasajeros_slider" | "presupuesto_slider" | "presupuesto_unificado";
  options?: string[];
  field?: string;
  multi_select?: boolean;
  submit_label?: string;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  additional_kwargs?: {
    payload?: CarRecommendationPayload;
    quick_replies?: string[];
    quick_reply_config?: QuickReplyConfig;
    car_comparison?: CarComparisonData;
  };
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN (sin cambios)
// ═══════════════════════════════════════════════════════════════════


const CLAVE_THREAD = "carblau_thread_id";

// sessionStorage puede no estar disponible (modo privado, bloqueado): nunca rompe la app
function leerThreadGuardado(): string | null {
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

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function Home() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Texto de progreso que manda el backend mientras procesa ("Buscando coches...")
  const [currentProgressStatus, setCurrentProgressStatus] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const { toast } = useToast();

  // ✅ NUEVO: Ref para abortar streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mientras se intenta recuperar una conversación guardada (recarga de página)
  const [restaurando, setRestaurando] = useState(true);

  // ═══════════════════════════════════════════════════════════════════
  // RECUPERAR CONVERSACIÓN AL RECARGAR
  // El thread_id vive en sessionStorage: sobrevive a recargar la página,
  // no a cerrar la pestaña. Si caducó en el backend (404), se empieza de cero.
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    const guardado = leerThreadGuardado();
    if (!guardado) {
      setRestaurando(false);
      return;
    }
    (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/conversation/${guardado}/messages`);
        if (!response.ok) throw new Error(`status ${response.status}`);
        const data = await response.json();
        setThreadId(data.thread_id);
        setMessages(data.messages);
        setSessionStarted(true);
      } catch (error) {
        console.log("ℹ️ No se pudo recuperar la conversación guardada:", error);
        guardarThread(null);
      } finally {
        setRestaurando(false);
      }
    })();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // EFFECTS (sin cambios en estos)
  // ═══════════════════════════════════════════════════════════════════
  
  // Scroll: con mensajes del usuario y mientras el agente piensa, al fondo.
  // Cuando llega respuesta del agente, al INICIO de esa respuesta: si es larga
  // (fichas de coches, comparativa) se lee desde el principio y no desde el
  // texto final. Si es corta, el navegador limita el scroll y queda igual que
  // ir al fondo.
  const mensajesPreviosRef = useRef(0);

  const scrollTo = (top: number) => {
    // requestAnimationFrame asegura que el DOM se haya actualizado con el nuevo texto
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({
        top,
        behavior: "auto" // "auto" evita que el streaming sature el móvil con animaciones
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
  }, [messages]);

  // Al empezar a cargar aparece el indicador de "escribiendo": que se vea.
  // Al terminar no se mueve, para no deshacer el scroll a la respuesta.
  useEffect(() => {
    if (isLoading && scrollAreaRef.current) scrollTo(scrollAreaRef.current.scrollHeight);
  }, [isLoading]);

  useEffect(() => {
    if (!isMobile && messages.length > 0 && !isLoading && messages[messages.length - 1].role === 'agent') {
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
        method: "POST"
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
        description: "Inténtalo de nuevo en unos segundos."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ MODIFICADO: handleSendMessage con STREAMING
const handleSendMessage = async (content: string) => {
  if (isLoading || !threadId) {
    console.warn("⚠️ No se puede enviar: isLoading o threadId faltante");
    return;
  }

  // Mensaje del usuario
  const userMessage: Message = {
    id: `user-${Date.now()}`,
    role: "user",
    content
  };

  console.log("📤 Enviando mensaje:", content);

  // Actualización optimista del mensaje del usuario
  setMessages((prev) => [...prev, userMessage]);
  setIsLoading(true);

  // Crear AbortController para poder cancelar
  abortControllerRef.current = new AbortController();

  try {
    const response = await fetch(`${API_BASE_URL}/conversation/${threadId}/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: content }]
      }),
      signal: abortControllerRef.current.signal
    });

    if (!response.ok) {
      // 429 (límite de uso) / 413 (mensaje largo): el backend explica qué pasa
      let detalle = "";
      try {
        detalle = (await response.json())?.detail ?? "";
      } catch { /* sin cuerpo JSON */ }
      const error: any = new Error(`HTTP ${response.status}`);
      if (response.status === 429 || response.status === 413) error.detalleUsuario = detalle;
      throw error;
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    // ✅ Procesar el stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = ""; // ✅ CAMBIO: era "accumulatedContent", ahora es buffer acumulador
    let recibioRespuesta = false;
    let errorBackend = false;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log("✅ Streaming completado");
        break;
      }

      // ✅ CAMBIO: Acumular en buffer en lugar de procesar chunk directo
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ""; // ✅ CAMBIO: guardar fragmento incompleto para el siguiente chunk

      for (const line of lines) {
        if (!line.trim()) continue;
        
        // Quitar prefijo SSE estándar
        const data = line.startsWith('data: ') ? line.slice(6) : line;

        // ✅ Ignorar líneas de keepalive (empiezan con ":")
        if (data.startsWith(':')) continue;

        // Solo el parseo va en try/catch: un evento "error" del backend NO
        // debe tragarse aquí (antes acababa en este catch como un simple warn).
        let event: any;
        try {
          event = JSON.parse(data);
        } catch (parseError) {
          console.warn("⚠️ Error parseando línea:", line, parseError);
          continue;
        }
        console.log("📦 Evento recibido:", event.type);

        if (event.type === "progress") {
          setCurrentProgressStatus(event.status);
        }
        else if (event.type === "complete") {
          recibioRespuesta = true;
          setCurrentProgressStatus(null);

          setMessages((prev) => {
            const nuevosMensajes = event.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              additional_kwargs: msg.additional_kwargs,
            }));
            return [...prev, ...nuevosMensajes];
          });
        }
        else if (event.type === "error") {
          console.error("❌ Error del backend:", event.message);
          errorBackend = true;
        }
      }
    } // ✅ AQUÍ CIERRA EL WHILE

    // Error del agente, o el stream se cortó sin traer respuesta
    if (!recibioRespuesta) {
      throw new Error(errorBackend ? "Error del agente" : "El stream terminó sin respuesta");
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log("🛑 Streaming cancelado");
    } else {
      console.error("❌ Error en streaming:", error);
      
      toast({
        variant: "destructive",
        title: "No hemos podido responder",
        description: error.detalleUsuario
          || "Ha habido un problema técnico. Tu mensaje sigue en la caja de texto: vuelve a enviarlo en unos segundos."
      });
      
      // Quitar el mensaje de la conversación y devolverlo a la caja de texto
      // para que el usuario pueda reenviarlo sin reescribirlo
      setMessages(prev => 
        prev.filter(m => m.id !== userMessage.id)
      );
      chatInputRef.current?.setText(content);
    }
  } finally {
    setIsLoading(false);
    setCurrentProgressStatus(null);
    abortControllerRef.current = null;
  }
}; // ✅ AQUÍ CIERRA LA FUNCIÓN
  const handleQuickReplySelect = (option: string) => {
    console.log("🔘 Quick reply seleccionada:", option);
    handleSendMessage(option);
  };

  const handleResetSession = () => {
    console.log("🔄 Reiniciando sesión");
    
    // ✅ Cancelar streaming si está activo
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setSessionStarted(false);
    setThreadId(null);
    guardarThread(null);
    setMessages([]);
    setIsLoading(false);
    setCurrentProgressStatus(null);
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER (sin cambios significativos)
  // ═══════════════════════════════════════════════════════════════════

  const lastAgentMessage =
    messages.length > 0 && messages[messages.length - 1].role === "agent"
      ? messages[messages.length - 1]
      : null;
  const lastQuickReplyConfig =
    lastAgentMessage?.additional_kwargs?.quick_reply_config ?? null;

  // Widget de respuesta: se deriva del último mensaje del agente (antes, 5
  // booleanos sincronizados a mano en un useEffect). Oculto mientras carga.
  const widget = !isLoading && lastQuickReplyConfig ? lastQuickReplyConfig.type : null;
  const opcionesBotones = widget === "buttons" ? lastQuickReplyConfig?.options ?? [] : [];

  return (
    <main className="flex flex-col h-[100dvh] relative overflow-hidden bg-background">
      
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: "url('/fondo-pattern.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "1100px", 
          backgroundPosition: "top left",
          opacity: 1 
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {restaurando ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#082144]" />
          </div>
        ) : !sessionStarted ? (
          <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
        ) : (
          <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
            
            <div className="flex justify-between items-center p-4 border-b border-black/5 bg-transparent backdrop-blur-sm">
              <div className="flex items-center">
                <img 
                  src="/logo2.png" 
                  alt="CarBlau Logo" 
                  className="h-10 w-auto object-contain"
                />
              </div>

              {/* Reiniciar borra toda la conversación: se confirma antes */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/60 hover:bg-white/90 text-slate-900 border-slate-200 shadow-sm transition-all"
                  >
                    <RotateCw className="mr-2 h-4 w-4" />
                    Reiniciar Conversación
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white text-slate-900">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[#082144]">¿Empezar de cero?</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-500">
                      Se borrarán tus respuestas y las recomendaciones de esta conversación.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50">
                      Seguir conversando
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleResetSession}
                      className="bg-[#082144] hover:bg-[#082144]/90 text-white"
                    >
                      Reiniciar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
                ref={scrollAreaRef}
              >
              <div className="space-y-6 p-4 pb-20">
                {messages.map((message) => {
                  const carPayload = message.additional_kwargs?.payload;
                  const isCarRecommendation = 
                    message.role === 'agent' && 
                    carPayload && 
                    carPayload.type === 'car_recommendation';

                  if (isCarRecommendation) {
                    return (
                      <div key={message.id} data-msg-id={message.id}>
                        <CarResultsMessage
                          data={carPayload}
                          threadId={threadId}
                          mensajeId={message.id}
                        />
                      </div>
                    );
                  } else {
                    const carComparison = message.additional_kwargs?.car_comparison;
                    return (
                      <div key={message.id} data-msg-id={message.id} className="flex flex-col gap-2">
                        <ChatMessage
                          role={message.role}
                          content={message.content}
                        />
                        {carComparison && (
                          <CarComparisonTable data={carComparison} />
                        )}
                      </div>
                    );
                  }
                })}
                
                {isLoading && (
  currentProgressStatus ? (
    // ✅ Mostrar mensaje de progreso específico
    <div className="flex items-start gap-3">
      {/* Avatar del agente */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden">
        <img 
          src="/favicon_cb.webp" 
          alt="CarBlau Agent" 
          className="h-full w-full object-cover"
        />
      </div>
      
      {/* Burbuja con mensaje de progreso */}
      <div className="rounded-2xl px-5 py-4 text-sm shadow-md bg-[#ECEBE7] text-slate-900 rounded-tl-none">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#082144]" />
          <span className="text-slate-700">{currentProgressStatus}</span>
        </div>
      </div>
    </div>
  ) : (
    // ✅ Fallback: mostrar TypingIndicator genérico si no hay mensaje de progreso
    <TypingIndicator />
  )
)}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="shrink-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/20 space-y-3 bg-white/10 backdrop-blur-md z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              
              {widget === "distance_slider" && (
                <DistanceSlider
                  onSelect={handleQuickReplySelect}
                  isLoading={isLoading}
                />
              )}

              {widget === "km_anuales_slider" && (
                <KmAnualesSlider
                  onSelect={handleQuickReplySelect}
                  isLoading={isLoading}
                />
              )}

              {widget === "pasajeros_slider" && (
                <PasajerosSlider onSelect={handleQuickReplySelect} isLoading={isLoading} />
              )}
              
              {widget === "presupuesto_slider" && (
                <PresupuestoSlider onSelect={handleQuickReplySelect} isLoading={isLoading} />
              )}

              {widget === "presupuesto_unificado" && (
                <PresupuestoUnificado onSelect={handleQuickReplySelect} isLoading={isLoading} />
              )}
              
              {opcionesBotones.length > 0 && (
                <QuickReplies
                  key={opcionesBotones.join(",")}
                  options={opcionesBotones}
                  onSelect={handleQuickReplySelect}
                  isLoading={isLoading}
                  multiSelect={lastQuickReplyConfig?.multi_select}
                  submitLabel={lastQuickReplyConfig?.submit_label}
                />
              )}
              
              <ChatInput 
                ref={chatInputRef} 
                onSubmit={handleSendMessage} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}