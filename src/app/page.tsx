"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/carblau/welcome-screen";
import { ChatMessage } from "@/components/carblau/chat-message";
import { CarResultsMessage } from "@/components/carblau/car-results-message";
import { ChatInput, type ChatInputHandle } from "@/components/carblau/chat-input";
import { QuickReplies } from "@/components/carblau/quick-replies"; // ✅ NUEVO
import { DistanceSlider } from "@/components/carblau/distance-slider";
import { PresupuestoSlider } from "@/components/carblau/presupuesto-slider";
import { PresupuestoUnificado } from "@/components/carblau/presupuesto-unificado";
import { PasajerosSlider } from "@/components/carblau/pasajeros-slider";
import { KmAnualesSlider } from "@/components/carblau/km-anuales-slider";
import { TypingIndicator } from "@/components/carblau/typing-indicator";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// INTERFACES
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
// ✅ NUEVO: Interface para configuración de quick replies
export interface QuickReplyConfig {
  type: "buttons" | "distance_slider" | "km_anuales_slider" | "pasajeros_slider" | "presupuesto_slider"  | "presupuesto_unificado";  // ✅ NUEVO;  // ✅ Añadir nuevo tipo
  options?: string[];  // Para botones
  field?: string;      // Para sliders (ej: "distancia_trayecto", "km_anuales")
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  additional_kwargs?: {
    payload?: CarRecommendationPayload;
    quick_replies?: string[]; // ✅ NUEVO
    quick_reply_config?: QuickReplyConfig;  // ✅ AÑADIR
  };
}

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
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
  
  // ✅ Estados para UI dinámica
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[] | null>(null);
  const [showDistanceSlider, setShowDistanceSlider] = useState(false);
  const [showKmAnualesSlider, setShowKmAnualesSlider] = useState(false);
  const [showPasajerosSlider, setShowPasajerosSlider] = useState(false);
  const [showPresupuestoSlider, setShowPresupuestoSlider] = useState(false);
  const [showPresupuestoUnificado, setShowPresupuestoUnificado] = useState(false); 
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);  // ✅ NUEVO
  const chatInputRef = useRef<ChatInputHandle>(null);
  const { toast } = useToast();

  // ═══════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════
  const scrollToBottom = () => {
    // Opción 1: Scroll al elemento final
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth",
      block: "end",
      inline: "nearest"
    });
    
    // Opción 2: Scroll directo al contenedor (más confiable en móvil)
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

// ✅ Detectar tipo de UI a mostrar (quick replies, slider, etc.)
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
          setShowPresupuestoSlider(false);  // ✅
          setShowPresupuestoUnificado(false);  // ✅ AÑADIR
          setCurrentQuickReplies(null);
        } else if (uiType === 'km_anuales_slider') {
          setShowDistanceSlider(false);
          setShowKmAnualesSlider(true);
          setShowPasajerosSlider(false);
          setShowPresupuestoSlider(false);  // ✅
          setShowPresupuestoUnificado(false);  // ✅ AÑADIR
          setCurrentQuickReplies(null);
        } else if (uiType === 'pasajeros_slider') {
          setShowDistanceSlider(false);
          setShowKmAnualesSlider(false);
          setShowPasajerosSlider(true);
          setShowPresupuestoSlider(false);  // ✅
          setShowPresupuestoUnificado(false); 
          setCurrentQuickReplies(null);
        } else if (uiType === 'presupuesto_slider') {  // ✅ NUEVO
          setShowDistanceSlider(false);
          setShowKmAnualesSlider(false);
          setShowPasajerosSlider(false);
          setShowPresupuestoSlider(true);
          setShowPresupuestoUnificado(false);  // ✅ AÑADIR
          setCurrentQuickReplies(null);
          console.log("🎚️ Mostrando presupuesto slider");
        } 
        // ✅ NUEVO: Presupuesto unificado
        else if (uiType === 'presupuesto_unificado') {
          setShowDistanceSlider(false);
          setShowKmAnualesSlider(false);
          setShowPasajerosSlider(false);
          setShowPresupuestoSlider(false);
          setShowPresupuestoUnificado(true);
          setCurrentQuickReplies(null);
          console.log("🎚️ Mostrando presupuesto unificado (tabs + slider)");
        }
        else if (uiType === 'buttons' && quickReplyConfig.options) {
          setShowDistanceSlider(false);
          setShowKmAnualesSlider(false);
          setShowPasajerosSlider(false);
          setShowPresupuestoSlider(false);  // ✅
          setShowPresupuestoUnificado(false);  // ✅ AÑADIR
          setCurrentQuickReplies(quickReplyConfig.options);
        } 
        else {
           // Clear all
          setShowDistanceSlider(false);
          setShowKmAnualesSlider(false);
          setShowPasajerosSlider(false);
          setShowPresupuestoSlider(false);  // ✅
          setShowPresupuestoUnificado(false);  // ✅ AÑADIR
          setCurrentQuickReplies(null);
        }
      } else {
        // No quick reply config
        setShowDistanceSlider(false);
        setShowKmAnualesSlider(false);
        setShowPasajerosSlider(false);
        setShowPresupuestoSlider(false);  // ✅
        setShowPresupuestoUnificado(false);  // ✅ AÑADIR
        setCurrentQuickReplies(null);
      }
    } else {
      // User message
      setShowDistanceSlider(false);
      setShowKmAnualesSlider(false);
      setShowPasajerosSlider(false);
      setShowPresupuestoSlider(false);
      setShowPresupuestoUnificado(false);  // ✅
      setCurrentQuickReplies(null);
    }
  } else {
    // No messages or loading
    setShowDistanceSlider(false);
    setShowKmAnualesSlider(false);
    setShowPasajerosSlider(false);
    setShowPresupuestoSlider(false);  // ✅
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

  const handleSendMessage = async (content: string) => {
    if (isLoading || !threadId) {
      console.warn("⚠️ No se puede enviar: isLoading o threadId faltante");
      return;
    }

    // ✅ Limpiar quick replies inmediatamente al enviar
    setCurrentQuickReplies(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content
    };

    console.log("📤 Enviando mensaje:", content);

    // Actualización optimista
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${threadId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: content }]
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      console.log("📥 Respuesta del backend:");
      console.log("   Mensajes recibidos:", data.messages.length);

      // Reemplazar todo el estado
      setMessages(data.messages);
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      toast({
        variant: "destructive",
        title: "Error Sending Message",
        description: "Could not send your message."
      });
      
      // Revertir mensaje optimista
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NUEVO: Handler para quick replies
  const handleQuickReplySelect = (option: string) => {
    console.log("🔘 Quick reply seleccionada:", option);
    handleSendMessage(option);
  };

  const handleResetSession = () => {
    console.log("🔄 Reiniciando sesión");
    setSessionStarted(false);
    setThreadId(null);
    setMessages([]);
    setIsLoading(false);
    setCurrentQuickReplies(null);
    setShowDistanceSlider(false);
    setShowKmAnualesSlider(false);
    setShowPasajerosSlider(false);     // ✅ AÑADIR
    setShowPresupuestoSlider(false);   // ✅ AÑADIR
    setShowPresupuestoUnificado(false);  // ✅ AÑADIR
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <main className="flex flex-col h-screen relative overflow-hidden bg-background">
      
      {/* 🖼️ CAPA 1: TU IMAGEN PURA */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: "url('/fondo-pattern.png')",
          backgroundRepeat: "repeat", // Se repite como mosaico
          
          // 🔧 AQUÍ ESTÁ LA SOLUCIÓN DEL ZOOM:
          // "auto" = Usa el tamaño real de la imagen (sin zoom).
          // Si aún se ven grandes, pon un número pequeño, ej: "150px"
          backgroundSize: "800px", 
          
          backgroundPosition: "top left", // Empieza desde la esquina
          opacity: 1 
        }}
      />

      {/* ❌ ELIMINADAS TODAS LAS CAPAS DE OSCURECIMIENTO (OVERLAYS) */}

      {/* 💬 CAPA 2: EL CONTENIDO */}
      <div className="relative z-10 flex flex-col h-full">
        {!sessionStarted ? (
          <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
        ) : (
          <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
            
            {/* Header: Transparente para ver el fondo + Logo */}
            <div className="flex justify-between items-center p-4 border-b border-black/5 bg-transparent backdrop-blur-sm">
              
              {/* LOGO DE LA COMPAÑÍA */}
              <div className="flex items-center">
                <img 
                  src="/logo2.png" 
                  alt="CarBlau Logo" 
                  className="h-10 w-auto object-contain" // Ajusta h-10 a h-12 si lo quieres más grande
                />
              </div>

              {/* BOTÓN DE REINICIAR */}
              {/* Lo hacemos blanco semitransparente para que contraste bien sobre el patrón */}
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

            {/* Messages Area: FONDO TRANSPARENTE para ver tu imagen bonita */}
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
                      />
                    );
                  }
                })}
                
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Input Area: Fondo sólido/semitransparente para que sea funcional */}
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
  )};