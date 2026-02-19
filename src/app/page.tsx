"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/carblau/welcome-screen";
import { ChatMessage } from "@/components/carblau/chat-message";
import { CarResultsMessage } from "@/components/carblau/car-results-message";
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
import { RotateCw, Loader2 } from "lucide-react";

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
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  additional_kwargs?: {
    payload?: CarRecommendationPayload;
    quick_replies?: string[];
    quick_reply_config?: QuickReplyConfig;
  };
  isStreaming?: boolean; // ✅ NUEVO: Para indicador de "escribiendo..."
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN (sin cambios)
// ═══════════════════════════════════════════════════════════════════

const API_BASE_URL = "https://carblau-agent-api-v4-1063747381969.europe-west1.run.app";

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function Home() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para UI dinámica (sin cambios)
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[] | null>(null);
  const [showDistanceSlider, setShowDistanceSlider] = useState(false);
  const [showKmAnualesSlider, setShowKmAnualesSlider] = useState(false);
  const [showPasajerosSlider, setShowPasajerosSlider] = useState(false);
  const [showPresupuestoSlider, setShowPresupuestoSlider] = useState(false);
  const [showPresupuestoUnificado, setShowPresupuestoUnificado] = useState(false);
  
  // ✅ NUEVO: Estado para mensaje en streaming
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [currentProgressStatus, setCurrentProgressStatus] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const { toast } = useToast();

  // ✅ NUEVO: Ref para abortar streaming
  const abortControllerRef = useRef<AbortController | null>(null);

  // ═══════════════════════════════════════════════════════════════════
  // EFFECTS (sin cambios en estos)
  // ═══════════════════════════════════════════════════════════════════
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "end",
      inline: "nearest"
    });
    
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0 && !isLoading && messages[messages.length - 1].role === 'agent') {
      chatInputRef.current?.focus();
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.role === 'agent') {
        const quickReplyConfig = lastMessage.additional_kwargs?.quick_reply_config;
        
        if (quickReplyConfig) {
          const uiType = quickReplyConfig.type;
          
          if (uiType === 'distance_slider') {
            setShowDistanceSlider(true);
            setShowKmAnualesSlider(false);
            setShowPasajerosSlider(false);
            setShowPresupuestoSlider(false);
            setShowPresupuestoUnificado(false);
            setCurrentQuickReplies(null);
          } else if (uiType === 'km_anuales_slider') {
            setShowDistanceSlider(false);
            setShowKmAnualesSlider(true);
            setShowPasajerosSlider(false);
            setShowPresupuestoSlider(false);
            setShowPresupuestoUnificado(false);
            setCurrentQuickReplies(null);
          } else if (uiType === 'pasajeros_slider') {
            setShowDistanceSlider(false);
            setShowKmAnualesSlider(false);
            setShowPasajerosSlider(true);
            setShowPresupuestoSlider(false);
            setShowPresupuestoUnificado(false);
            setCurrentQuickReplies(null);
          } else if (uiType === 'presupuesto_slider') {
            setShowDistanceSlider(false);
            setShowKmAnualesSlider(false);
            setShowPasajerosSlider(false);
            setShowPresupuestoSlider(true);
            setShowPresupuestoUnificado(false);
            setCurrentQuickReplies(null);
          } else if (uiType === 'presupuesto_unificado') {
            setShowDistanceSlider(false);
            setShowKmAnualesSlider(false);
            setShowPasajerosSlider(false);
            setShowPresupuestoSlider(false);
            setShowPresupuestoUnificado(true);
            setCurrentQuickReplies(null);
          } else if (uiType === 'buttons' && quickReplyConfig.options) {
            setShowDistanceSlider(false);
            setShowKmAnualesSlider(false);
            setShowPasajerosSlider(false);
            setShowPresupuestoSlider(false);
            setShowPresupuestoUnificado(false);
            setCurrentQuickReplies(quickReplyConfig.options);
          } else {
            setShowDistanceSlider(false);
            setShowKmAnualesSlider(false);
            setShowPasajerosSlider(false);
            setShowPresupuestoSlider(false);
            setShowPresupuestoUnificado(false);
            setCurrentQuickReplies(null);
          }
        } else {
          setShowDistanceSlider(false);
          setShowKmAnualesSlider(false);
          setShowPasajerosSlider(false);
          setShowPresupuestoSlider(false);
          setShowPresupuestoUnificado(false);
          setCurrentQuickReplies(null);
        }
      } else {
        setShowDistanceSlider(false);
        setShowKmAnualesSlider(false);
        setShowPasajerosSlider(false);
        setShowPresupuestoSlider(false);
        setShowPresupuestoUnificado(false);
        setCurrentQuickReplies(null);
      }
    } else {
      setShowDistanceSlider(false);
      setShowKmAnualesSlider(false);
      setShowPasajerosSlider(false);
      setShowPresupuestoSlider(false);
      setShowPresupuestoUnificado(false);
      setCurrentQuickReplies(null);
    }
  }, [messages, isLoading]);

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
      setMessages(data.messages);
      setSessionStarted(true);
      
    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        variant: "destructive",
        title: "Error Starting Session",
        description: "Could not start a new session. Please try again later."
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

  // Limpiar quick replies inmediatamente
  setCurrentQuickReplies(null);

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

  // ✅ Crear mensaje vacío del agente para streaming
  const agentMessageId = `agent-${Date.now()}`;
  const agentMessage: Message = {
    id: agentMessageId,
    role: "agent",
    content: "",
    isStreaming: true
  };

  // Agregar mensaje vacío del agente
  setMessages((prev) => [...prev, agentMessage]);
  setStreamingMessageId(agentMessageId);

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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    // ✅ Procesar el stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = "";

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log("✅ Streaming completado");
        break;
      }

      // Decodificar el chunk
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      

      for (const line of lines) {
        if (!line.trim()) continue;
        
        // Quitar prefijo SSE estándar
        const data = line.startsWith('data: ') ? line.slice(6) : line;
        
        try {
          const event = JSON.parse(data);
          console.log("📦 Evento recibido:", event.type);
      
          if (event.type === "progress") {
            console.log(`🔄 ${event.status}`);
            setCurrentProgressStatus(event.status); // ✅ NUEVO: Actualizar estado de progreso
          }
          else if (event.type === "complete") {
            console.log("✅ Mensajes nuevos recibidos:", event.messages.length);
            
            setCurrentProgressStatus(null);
            
            // Quitar placeholder vacío del agente y añadir mensajes reales
            setMessages((prev) => {
              const sinPlaceholder = prev.filter(m => m.id !== agentMessageId);
              const nuevosMensajes = event.messages.map((msg: any) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                additional_kwargs: msg.additional_kwargs,
                isStreaming: false
              }));
              return [...sinPlaceholder, ...nuevosMensajes];
            });
          }
          else if (event.type === "done") {
            console.log("✅ Proceso completado");
          }
          else if (event.type === "error") {
            throw new Error(event.message);
          }
        } catch (parseError) {
          console.warn("⚠️ Error parseando línea:", line, parseError);
        }
      }
    } // ✅ AQUÍ CIERRA EL WHILE

    // ✅ Marcar streaming como completado (DESPUÉS del while)
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === agentMessageId
          ? { ...msg, isStreaming: false }
          : msg
      )
    );

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log("🛑 Streaming cancelado");
    } else {
      console.error("❌ Error en streaming:", error);
      
      toast({
        variant: "destructive",
        title: "Error Sending Message",
        description: "Could not send your message."
      });
      
      // Revertir mensajes en caso de error
      setMessages(prev => 
        prev.filter(m => m.id !== userMessage.id && m.id !== agentMessageId)
      );
    }
  } finally {
    setIsLoading(false);
    setStreamingMessageId(null);
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
    setMessages([]);
    setIsLoading(false);
    setStreamingMessageId(null);
    setCurrentProgressStatus(null);
    setCurrentQuickReplies(null);
    setShowDistanceSlider(false);
    setShowKmAnualesSlider(false);
    setShowPasajerosSlider(false);
    setShowPresupuestoSlider(false);
    setShowPresupuestoUnificado(false);
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER (sin cambios significativos)
  // ═══════════════════════════════════════════════════════════════════

  return (
    <main className="flex flex-col h-screen relative overflow-hidden bg-background">
      
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: "url('/fondo-pattern.webp')",
          backgroundRepeat: "repeat",
          backgroundSize: "800px", 
          backgroundPosition: "top left",
          opacity: 1 
        }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {!sessionStarted ? (
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

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetSession}
                className="bg-white/60 hover:bg-white/90 text-slate-900 border-slate-200 shadow-sm transition-all"
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Reiniciar Conversación
              </Button>
            </div>

            <div 
              className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
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
                      <CarResultsMessage 
                        key={message.id} 
                        data={carPayload} 
                      />
                    );
                  } else {
                    return (
                      <ChatMessage
                        key={message.id}
                        role={message.role}
                        content={message.content}
                        isStreaming={message.isStreaming} // ✅ Pasar prop
                      />
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
          src="/favicon_cb.jpeg" 
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
            
            <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-white/20 space-y-3 bg-white/10 backdrop-blur-md z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              
              {showDistanceSlider && (
                <DistanceSlider
                  onSelect={handleQuickReplySelect}
                  isLoading={isLoading}
                />
              )}

              {showKmAnualesSlider && (
                <KmAnualesSlider
                  onSelect={handleQuickReplySelect}
                  isLoading={isLoading}
                />
              )}

              {showPasajerosSlider && (
                <PasajerosSlider onSelect={handleQuickReplySelect} isLoading={isLoading} />
              )}
              
              {showPresupuestoSlider && (
                <PresupuestoSlider onSelect={handleQuickReplySelect} isLoading={isLoading} />
              )}

              {showPresupuestoUnificado && (
                <PresupuestoUnificado onSelect={handleQuickReplySelect} isLoading={isLoading} />
              )}
              
              {currentQuickReplies && currentQuickReplies.length > 0 && (
                <QuickReplies
                  options={currentQuickReplies}
                  onSelect={handleQuickReplySelect}
                  isLoading={isLoading}
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