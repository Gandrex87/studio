"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/carblau/welcome-screen";
import { ChatMessage } from "@/components/carblau/chat-message";
import { ChatInput } from "@/components/carblau/chat-input";
import { TypingIndicator } from "@/components/carblau/typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
}

// ✅ TU URL DE CLOUD RUN (está correcta)
const API_BASE_URL = "https://carblau-agent-api-1063747381969.europe-west1.run.app";

export default function Home() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/start`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to start session:", errorData);
        throw new Error(`Failed to start session: ${response.statusText}`);
      }

      const data = await response.json();
      
      // ✅ CORREGIDO: Usamos los datos directamente de la API como la "fuente de verdad"
      setThreadId(data.thread_id);
      setMessages(data.messages); // La API ya nos da la lista de mensajes iniciales
      setSessionStarted(true);

    } catch (error) {
      console.error("Error starting session:", error);
      toast({
        variant: "destructive",
        title: "Error Starting Session",
        description: "Could not start a new session. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (isLoading || !threadId) return;

    const userMessage: Message = {
      id: String(Date.now()), // ID temporal para la UI optimista
      role: "user",
      content,
    };
    // Actualización optimista de la UI
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${threadId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // ✅ CORREGIDO: El cuerpo de la petición ahora coincide con lo que espera el backend
        body: JSON.stringify({
          messages: [{ role: 'user', content: content }]
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to send message:", errorData);
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      
      // ✅ CORREGIDO: Reemplazamos TODO el historial con la respuesta del backend.
      // Esto mantiene el frontend perfectamente sincronizado.
      setMessages(data.messages);

    } catch (error) {
       console.error("Error sending message:", error);
       toast({
         variant: "destructive",
         title: "Error Sending Message",
         description: "Could not send your message. Please check your connection.",
       });
       // Si hay un error, eliminamos el mensaje optimista que añadimos
       setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSession = () => {
    setSessionStarted(false);
    setThreadId(null);
    setMessages([]);
    setIsLoading(false);
  };

  return (
    <main className="flex flex-col h-screen bg-background">
      {!sessionStarted ? (
        <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
      ) : (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-4 md:p-6">
           <div className="flex justify-between items-center mb-4 border-b pb-4">
             <h1 className="text-2xl font-bold">CarBlau AI</h1>
             <Button variant="outline" size="sm" onClick={handleResetSession}>
               <RotateCw className="mr-2 h-4 w-4" />
               Reiniciar Conversación
             </Button>
          </div>
          <ScrollArea className="flex-1 pr-4 -mr-4">
              <div className="space-y-6 pr-4">
                  {messages.map((message) => (
                    // ✨ MEJORA: Usar solo message.id como key, ya que la API lo proporciona y es único.
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
              </div>
          </ScrollArea>
          <div className="pt-6">
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </main>
  );
}