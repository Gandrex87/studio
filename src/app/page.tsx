"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/autopilot/welcome-screen";
import { ChatMessage } from "@/components/autopilot/chat-message";
import { ChatInput } from "@/components/autopilot/chat-input";
import { TypingIndicator } from "@/components/autopilot/typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
}

const cannedResponses = [
  "That's an interesting choice! Based on that, here are a few other options you might like:\n\n*   **Tesla Model 3:** Great for its cutting-edge tech and performance.\n*   **Ford Mustang Mach-E:** A stylish and sporty electric SUV with iconic branding.\n*   **Hyundai Ioniq 5:** Known for its unique retro-futuristic design and ultra-fast charging.",
  "I understand. To give you the best recommendations, what are your top 3 priorities in a new car? For example:\n- `Safety`\n- `Fuel Efficiency`\n- `Performance`\n- `Cargo Space`\n- `Infotainment System`",
  "Excellent points. Let me process that. Considering your need for **safety** and **fuel efficiency**, I'd recommend looking at these two strong contenders:\n\n1.  **Toyota Camry Hybrid:** A benchmark for reliability and exceptional fuel economy in the sedan class.\n2.  **Honda CR-V Hybrid:** A spacious, safe, and efficient SUV perfect for families or those needing more utility.",
  "Could you tell me more about your daily commute and typical weekend activities? This will help me understand which vehicle type would be the best fit for your lifestyle.",
  "Thinking about your budget is a smart step. What is the approximate price range you are comfortable with for your new vehicle?",
];

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
      // Mock API call to /start
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newThreadId = `thread_${Math.random().toString(36).substring(2, 9)}`;
      setThreadId(newThreadId);
      
      setMessages([
        {
          id: "0",
          role: "agent",
          content: "Hello! I'm AutoPilot AI. How can I help you find the perfect car today? Tell me a bit about what you're looking for.",
        },
      ]);
      setSessionStarted(true);
    } catch (error) {
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
    if (isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Mock API call to /conversation/{thread_id}/message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const randomResponse = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
      const agentMessage: Message = {
        id: String(Date.now() + 1),
        role: "agent",
        content: randomResponse,
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Sending Message",
        description: "Could not send your message. Please try again later.",
      });
       // Optional: remove optimistic user message on failure
       setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-background">
      {!sessionStarted ? (
        <WelcomeScreen onStartSession={handleStartSession} isLoading={isLoading} />
      ) : (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-4 md:p-6">
          <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                  {messages.map((message) => (
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
