"use client";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { ExternalLink } from "lucide-react"; 
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { CarRecommendationPayload } from "@/app/page";

// Actualiza el tipo para incluir los nuevos campos
type CarData = CarRecommendationPayload['cars'][0] & {
  carId?: string;
  sessionId?: string;
  actionType?: string;
};

interface CarResultsMessageProps {
  data: CarRecommendationPayload;
}

const API_BASE_URL = "https://carblau-agent-api-v4-1063747381969.europe-west1.run.app";

function cleanCarName(name: string) {
  return name.replace(/^\d+\.\s*/, "");
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: FICHA DE COCHE MEJORADA (Card)
// ═══════════════════════════════════════════════════════════════════
const CarCard = ({ car }: { car: CarData }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    nombre: "",
    telefono: ""
  });
  const { toast } = useToast();

  const handleCarClick = async () => {
    if (!car.carId || !car.sessionId) {
      console.error("Faltan datos del coche para capturar lead");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/lead/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: car.carId,
          session_id: car.sessionId,
          car_nombre: car.name,
          car_precio: parseFloat(car.price.replace(/[^\d]/g, "")),
          action: "view_details"
        })
      });

      if (!response.ok) throw new Error("Error capturando interés");
      
      const data = await response.json();
      setLeadId(data.lead_id);
      setShowContactForm(true); 
      
      toast({
        title: "¡Excelente elección!",
        description: `Te interesa el ${car.name}. Déjanos tus datos para contactarte.`,
      });
      
    } catch (error) {
      console.error("Error:", error);
      setShowContactForm(true);
    }
  };

  const handleSubmitContact = async () => {
    if (!contactData.email) {
      toast({
        variant: "destructive",
        title: "Email requerido",
        description: "Por favor ingresa tu email para continuar."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (leadId) {
        const response = await fetch(`${API_BASE_URL}/api/lead/contact`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lead_id: leadId,
            email: contactData.email,
            nombre: contactData.nombre,
            telefono: contactData.telefono
          })
        });

        if (!response.ok) throw new Error("Error enviando contacto");
        
        toast({
          title: "¡Datos enviados!",
          description: "El concesionario se pondrá en contacto contigo pronto.",
        });
      }
      
      setShowContactForm(false);
      setContactData({ email: "", nombre: "", telefono: "" });
      
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No pudimos enviar tus datos. Por favor intenta de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center cursor-pointer hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
      >
        <h3 className="text-lg font-bold mt-0 mb-3 text-slate-900 group-hover:text-[#082144] transition-colors">
          {car.name}
        </h3>
        
        {car.imageUrl && (
          <div className="flex justify-center my-3 relative overflow-hidden rounded-lg">
            <img
              src={car.imageUrl}
              alt={`Foto de ${car.name}`}
              className="rounded-lg border border-gray-100 shadow-sm max-w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="flex justify-center gap-2 my-3 flex-wrap">
          {car.specs.map((spec: string, i: number) => (
            <span 
              key={i} 
              className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-2.5 py-1 rounded-full"
            >
              {spec}
            </span>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 my-3 text-sm border-t border-b border-gray-100 py-2">
            <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Precio</span>
                <span className="font-bold text-slate-900">{car.price}</span>
            </div>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Puntuación</span>
                <span className="font-bold text-[#082144]">{car.score}</span>
            </div>
        </div>

        <p className="text-xs text-slate-600 italic mt-3 px-2 leading-relaxed">
          "{car.analysis}"
        </p>

        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4 w-full bg-[#082144] text-white hover:bg-[#082144]/90 border-transparent shadow-sm"
          onClick={handleCarClick}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Ver detalles y solicitar info
        </Button>
      </div>

      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent className="sm:max-w-md bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-[#082144]">
              Solicitar información sobre {cleanCarName(car.name)}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Déjanos tus datos y el concesionario se pondrá en contacto contigo pronto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="bg-white border-slate-300 focus-visible:ring-[#082144]"
                value={contactData.email}
                onChange={(e) => setContactData({...contactData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nombre" className="text-slate-700">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Tu nombre"
                className="bg-white border-slate-300 focus-visible:ring-[#082144]"
                value={contactData.nombre}
                onChange={(e) => setContactData({...contactData, nombre: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="telefono" className="text-slate-700">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="600 123 456"
                className="bg-white border-slate-300 focus-visible:ring-[#082144]"
                value={contactData.telefono}
                onChange={(e) => setContactData({...contactData, telefono: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowContactForm(false)}
              disabled={isSubmitting}
              className="border-slate-300 text-slate-700"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitContact}
              disabled={isSubmitting}
              className="bg-[#082144] hover:bg-[#082144]/90 text-white"
            >
              {isSubmitting ? "Enviando..." : "Enviar información"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════
export function CarResultsMessage({ data }: CarResultsMessageProps) {
  return (
    <div className={cn("flex items-start gap-4")}>
      
      {/* 🖼️ AVATAR DEL AGENTE */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden">
        <img 
          src="/favicon_cb.jpeg" 
          alt="CarBlau Agent" 
          className="h-full w-full object-cover" 
        />
      </div>

      {/* 🗨️ BURBUJA DE CHAT */}
      <div className={cn(
        "rounded-2xl px-5 py-4 text-sm shadow-md w-full max-w-lg bg-[#ECEBE7] text-slate-900 rounded-tl-none leading-relaxed"
      )}>
        
        {/* Intro Text - CENTRADO */}
        {/* Añadimos 'text-center' y forzamos el componente 'p' a ser centrado */}
        <ReactMarkdown 
          className="prose prose-sm prose-neutral text-slate-800 marker:text-slate-800 max-w-none text-center"
          components={{
            p: ({node, ...props}) => <p className="text-center" {...props} />
          }}
        >
          {data.introText}
        </ReactMarkdown>

        {/* 🚗 GRID DE COCHES */}
        <div className="flex flex-col gap-5 mt-5">
          {data.cars.map((car, index) => (
            <CarCard key={index} car={car as CarData} />
          ))}
        </div>

        {/* Outro Text - CENTRADO */}
        {/* Centramos el contenedor y el contenido Markdown */}
        {data.outroText && (
          <div className="mt-5 pt-3 border-t border-slate-200/60 text-center">
            <ReactMarkdown 
              className="prose prose-sm prose-neutral text-slate-800 max-w-none inline-block"
              components={{
                p: ({node, ...props}) => <p className="text-center" {...props} />
              }}
            >
                {data.outroText}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}