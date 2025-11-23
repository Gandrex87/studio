"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/carblau/welcome-screen";
import { ChatMessage } from "@/components/carblau/chat-message";
import { CarResultsMessage } from "@/components/carblau/car-results-message";
import { ChatInput, type ChatInputHandle } from "@/components/carblau/chat-input";
import { TypingIndicator } from "@/components/carblau/typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

// ✅ 1. Definimos las interfaces para que coincidan con la nueva estructura del backend
interface Car {
  name: string;
  specs: string[];
  imageUrl?: string;
  price: string;
  score: string;
  analysis: string;
  // Nuevos campos para el sistema de leads
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
  content: string; // El contenido principal siempre será un string
  additional_kwargs?: { // El payload opcional con los datos estructurados
    payload?: CarRecommendationPayload;
  };
}

// version 1 del backend corriendo para NEEDCARHELP
//const API_BASE_URL = "https://carblau-agent-api-1063747381969.europe-west1.run.app";
// version 2 del backend con mejoras y listo para carticket, a partir del 10 de oct tambien NEEDCARHELP
const API_BASE_URL = "https://carblau-agent-api-v2-1063747381969.europe-west1.run.app";

export default function Home() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const { toast } = useToast();

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);
  useEffect(() => { if (messages.length > 0 && !isLoading && messages[messages.length - 1].role === 'agent') { chatInputRef.current?.focus(); } }, [messages, isLoading]);
  const handleStartSession = async () => { setIsLoading(true); try { const response = await fetch(`${API_BASE_URL}/start`, { method: "POST" }); if (!response.ok) throw new Error("Failed to start session"); const data = await response.json(); setThreadId(data.thread_id); setMessages(data.messages); setSessionStarted(true); } catch (error) { console.error("Error starting session:", error); toast({ variant: "destructive", title: "Error Starting Session", description: "Could not start a new session. Please try again later." }); } finally { setIsLoading(false); } };
  const handleSendMessage = async (content: string) => { if (isLoading || !threadId) return; const userMessage: Message = { id: String(Date.now()), role: "user", content }; setMessages((prev) => [...prev, userMessage]); setIsLoading(true); try { const response = await fetch(`${API_BASE_URL}/conversation/${threadId}/message`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: 'user', content: content }] }) }); if (!response.ok) throw new Error("Failed to send message"); const data = await response.json(); setMessages(data.messages); } catch (error) { console.error("Error sending message:", error); toast({ variant: "destructive", title: "Error Sending Message", description: "Could not send your message." }); setMessages(prev => prev.filter(m => m.id !== userMessage.id)); } finally { setIsLoading(false); } };
  const handleResetSession = () => { setSessionStarted(false); setThreadId(null); setMessages([]); setIsLoading(false); };

  return (
    <main className="flex flex-col h-screen bg-background">
      {!sessionStarted ? (
        <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
      ) : (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
           <div className="flex justify-between items-center p-4 border-b">
             <h1 className="text-2xl font-bold">CarBlau AI</h1>
             <Button variant="outline" size="sm" onClick={handleResetSession}>
               <RotateCw className="mr-2 h-4 w-4" />
               Reiniciar Conversación
             </Button>
          </div>
          <ScrollArea className="flex-1">
              <div className="space-y-6 p-4">
                  {messages.map((message) => {
                    // ✅ 2. La lógica de renderizado ahora busca en 'additional_kwargs'
                    const carPayload = message.additional_kwargs?.payload;
                    const isCarRecommendation = 
                      message.role === 'agent' && 
                      carPayload && 
                      carPayload.type === 'car_recommendation';

                    if (isCarRecommendation) {
                      // Pasamos el payload directamente al componente de resultados
                      return <CarResultsMessage key={message.id} data={carPayload} />;
                    } else {
                      // Para todos los demás mensajes, mostramos el texto simple
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
          <div className="p-4 border-t">
            <ChatInput ref={chatInputRef} onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </main>
  );
}
