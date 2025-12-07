"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/carblau/welcome-screen";
import { ChatMessage } from "@/components/carblau/chat-message";
import { CarResultsMessage } from "@/components/carblau/car-results-message";
import { ChatInput, type ChatInputHandle } from "@/components/carblau/chat-input";
import { QuickReplies } from "@/components/carblau/quick-replies"; // ✅ NUEVO
import { TypingIndicator } from "@/components/carblau/typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  additional_kwargs?: {
    payload?: CarRecommendationPayload;
    quick_replies?: string[]; // ✅ NUEVO
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
  
  // ✅ NUEVO: Estado para opciones de respuesta rápida
  const [currentQuickReplies, setCurrentQuickReplies] = useState<string[] | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const { toast } = useToast();

  // ═══════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0 && !isLoading && messages[messages.length - 1].role === 'agent') {
      chatInputRef.current?.focus();
    }
  }, [messages, isLoading]);

  // ✅ NUEVO: Actualizar quick replies cuando cambian los mensajes
  useEffect(() => {
    console.log("🔄 useEffect disparado - messages.length:", messages.length, "isLoading:", isLoading);
    
    if (messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];

      // ✅ VER EL CONTENIDO COMPLETO DE additional_kwargs
      console.log("🔍 additional_kwargs COMPLETO:", JSON.stringify(lastMessage.additional_kwargs, null, 2));
    
      
      console.log("🔍 Último mensaje:", {
        id: lastMessage.id,
        role: lastMessage.role,
        content: lastMessage.content.substring(0, 50) + "...",
        hasAdditionalKwargs: !!lastMessage.additional_kwargs,
        hasQuickReplies: !!lastMessage.additional_kwargs?.quick_replies
      });
      
      // Solo mostrar quick replies si el último mensaje es del agente
      if (lastMessage.role === 'agent') {
        const quickReplies = lastMessage.additional_kwargs?.quick_replies;
        
        if (quickReplies && quickReplies.length > 0) {
          setCurrentQuickReplies(quickReplies);
          console.log("🔘 Quick replies detectadas:", quickReplies);
        } else {
          setCurrentQuickReplies(null);
          console.log("📝 Sin quick replies en este mensaje");
        }
      } else {
        // Si el último mensaje es del usuario, limpiar quick replies
        setCurrentQuickReplies(null);
      }
    } else {
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
    setCurrentQuickReplies(null); // ✅ Limpiar quick replies
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <main className="flex flex-col h-screen bg-background">
      {!sessionStarted ? (
        <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
      ) : (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold">CarBlau AI</h1>
            <Button variant="outline" size="sm" onClick={handleResetSession}>
              <RotateCw className="mr-2 h-4 w-4" />
              Reiniciar Conversación
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="space-y-6 p-4">
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
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t space-y-3">
            {/* ✅ NUEVO: Quick Replies */}
            {currentQuickReplies && currentQuickReplies.length > 0 && (
              <QuickReplies
                options={currentQuickReplies}
                onSelect={handleQuickReplySelect}
                isLoading={isLoading}
              />
            )}
            
            {/* Input de texto */}
            <ChatInput 
              ref={chatInputRef} 
              onSubmit={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      )}
    </main>
  );
}