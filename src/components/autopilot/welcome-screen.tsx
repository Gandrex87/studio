"use client";

import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
      <div className="mb-4 p-4 rounded-full bg-primary/20 text-primary">
         <Car className="w-16 h-16" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold font-headline mb-2 text-primary">
        AutoPilot AI
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Your personal AI car shopping assistant. Let's find the perfect ride for you.
      </p>
      <Button size="lg" onClick={onStart}>
        Start Conversation
      </Button>
    </div>
  );
}
