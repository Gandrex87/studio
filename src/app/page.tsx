"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/autopilot/welcome-screen";
import { ChatMessage } from "@/components/autopilot/chat-message";
import { ChatInput } from "@/components/autopilot/chat-input";
import { TypingIndicator } from "@/components/autopilot/typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
}

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
      
      const newThreadId = data.thread_id;
      const initialMessage: Message = {
        id: String(Date.now()),
        role: 'agent',
        content: data.message.content
      };

      setThreadId(newThreadId);
      setMessages([initialMessage]);
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
      id: String(Date.now()),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${threadId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Failed to send message:", errorData);
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const data = await response.json();
      
      const agentResponse: Message = {
          id: String(Date.now() + 1),
          role: 'agent',
          content: data.content
      };
      setMessages(prev => [...prev, agentResponse]);
    } catch (error) {
       console.error("Error sending message:", error);
       toast({
         variant: "destructive",
         title: "Error Sending Message",
         description: "Could not send your message. Please check your connection.",
       });
       // Rollback user message on error
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
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={`${message.id}-${index}`}
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
