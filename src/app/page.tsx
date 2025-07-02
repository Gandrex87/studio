"use client";

import { useState, useRef, useEffect } from "react";
import { WelcomeScreen } from "@/components/autopilot/welcome-screen";
import { ChatMessage } from "@/components/autopilot/chat-message";
import { ChatInput } from "@/components/autopilot/chat-input";
import { TypingIndicator } from "@/components/autopilot/typing-indicator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleStart = () => {
    setMessages([
      {
        id: "0",
        role: "agent",
        content:
          "Hello! I'm AutoPilot AI. How can I help you find the perfect car today? Tell me a bit about what you're looking for.",
      },
    ]);
    setHasStarted(true);
  };

  const handleSendMessage = (content: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const randomResponse = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
      const agentMessage: Message = {
        id: String(Date.now() + 1),
        role: "agent",
        content: randomResponse,
      };
      setMessages((prev) => [...prev, agentMessage]);
      setIsLoading(false);
    }, 1500 + Math.random() * 500);
  };

  return (
    <main className="flex flex-col h-screen bg-background">
      {!hasStarted ? (
        <WelcomeScreen onStart={handleStart} />
      ) : (
        <div className="flex flex-col h-full w-full max-w-3xl mx-auto p-4 md:p-6">
          <div className="flex-1 overflow-y-auto pr-4">
             <ScrollArea className="h-full" ref={scrollAreaRef}>
              <div className="space-y-6" ref={viewportRef}>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      role={message.role}
                      content={message.content}
                    />
                  ))}
                  {isLoading && <TypingIndicator />}
              </div>
            </ScrollArea>
          </div>
          <div className="pt-6">
            <ChatInput onSubmit={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </main>
  );
}
