"use client";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { PhoneCall, ThumbsUp, ThumbsDown, Info } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { CarRecommendationPayload } from "@/app/page";
import { API_BASE_URL, PRIVACY_URL } from "@/lib/config";

// Actualiza el tipo para incluir los nuevos campos
type CarData = CarRecommendationPayload['cars'][0] & {
  carId?: string;
  sessionId?: string;
  actionType?: string;
};

interface CarResultsMessageProps {
  data: CarRecommendationPayload;
  threadId: string | null;
  mensajeId: string;   // id del mensaje de resultados: identifica la tanda valorada
}

type Voto = "up" | "down";

// Votos ya emitidos, por conversación: al recargar la página no se vuelve a
// pedir (ni a contar) el mismo voto. sessionStorage, como el thread_id.
const claveVotos = (threadId: string) => `carblau_feedback_${threadId}`;

function leerVoto(threadId: string, mensajeId: string): Voto | null {
  try {
    return JSON.parse(sessionStorage.getItem(claveVotos(threadId)) || "{}")[mensajeId] ?? null;
  } catch {
    return null;
  }
}

function guardarVoto(threadId: string, mensajeId: string, voto: Voto) {
  try {
    const votos = JSON.parse(sessionStorage.getItem(claveVotos(threadId)) || "{}");
    sessionStorage.setItem(claveVotos(threadId), JSON.stringify({ ...votos, [mensajeId]: voto }));
  } catch {
    /* sin persistencia: el voto se envía igual */
  }
}

// ═══════════════════════════════════════════════════════════════════
// 👍/👎 SOBRE LAS RECOMENDACIONES (métricas de satisfacción)
// ═══════════════════════════════════════════════════════════════════
const FeedbackRecomendaciones = ({ threadId, mensajeId }: { threadId: string | null; mensajeId: string }) => {
  const [enviado, setEnviado] = useState<Voto | null>(null);

  // Tras recargar: si esta tanda ya se votó, mostrar el agradecimiento
  useEffect(() => {
    if (threadId) setEnviado(leerVoto(threadId, mensajeId));
  }, [threadId, mensajeId]);

  const enviar = (valor: Voto) => {
    if (enviado || !threadId) return;
    setEnviado(valor);
    guardarVoto(threadId, mensajeId, valor);
    // Sin esperar respuesta: un fallo aquí no debe molestar al usuario
    fetch(`${API_BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id: threadId, mensaje_id: mensajeId, valor }),
    }).catch((e) => console.warn("No se pudo enviar el feedback:", e));
  };

  if (enviado) {
    return (
      <p className="mt-4 text-center text-xs text-slate-500">
        {enviado === "up" ? "¡Gracias! Nos alegra que te encajen." : "Gracias, nos ayuda a mejorar. Puedes afinar la búsqueda para ajustarlas."}
      </p>
    );
  }
  return (
    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
      <span>¿Te encajan estas recomendaciones?</span>
      <Button variant="outline" size="sm" aria-label="Sí, me encajan" onClick={() => enviar("up")}
              className="h-8 w-8 p-0 bg-white border-slate-300 hover:bg-[#082144] hover:text-white">
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" aria-label="No me encajan" onClick={() => enviar("down")}
              className="h-8 w-8 p-0 bg-white border-slate-300 hover:bg-[#082144] hover:text-white">
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};


const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// "25.990 €" → 25990, "25.990,50 €" → 25990.5, "25990.50" → 25990.5.
// Formato español: "." separa miles y "," decimales; un "." solo es decimal
// si no va seguido de grupos de 3 cifras. Sin número reconocible → null.
function parsearPrecio(precio: string): number | null {
  let limpio = precio.replace(/[^\d.,]/g, "");
  if (limpio.includes(",")) {
    limpio = limpio.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) {
    limpio = limpio.replace(/\./g, "");
  }
  const valor = parseFloat(limpio);
  return Number.isFinite(valor) ? valor : null;
}

function cleanCarName(name: string) {
  return name.replace(/^\d+\.\s*/, "");
}

// ═══════════════════════════════════════════════════════════════════
// SUB-COMPONENTE: FICHA DE COCHE MEJORADA (Card)
// ═══════════════════════════════════════════════════════════════════
const CarCard = ({ car }: { car: CarData }) => {
  const [showContactForm, setShowContactForm] = useState(false);
  // Registro del interés (lead_id) en curso o ya hecho: se comparte entre
  // el clic en el botón y el envío del formulario para no duplicar leads
  const capturaRef = useRef<Promise<string | null> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactData, setContactData] = useState({
    email: "",
    nombre: "",
    telefono: ""
  });
  // RGPD: los datos se ceden al concesionario, así que hace falta
  // consentimiento explícito (casilla sin marcar por defecto)
  const [consentimiento, setConsentimiento] = useState(false);
  const { toast } = useToast();

  const capturarLead = async (): Promise<string | null> => {
    if (!car.carId || !car.sessionId) {
      console.error("Faltan datos del coche para capturar lead");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/lead/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          car_id: car.carId,
          session_id: car.sessionId,
          car_nombre: car.name,
          car_precio: parsearPrecio(car.price),
          action: "view_details"
        })
      });

      if (!response.ok) throw new Error("Error capturando interés");
      
      const data = await response.json();
      return data.lead_id ?? null;
    } catch (error) {
      console.error("Error capturando lead:", error);
      return null;
    }
  };

  // Una sola captura por coche; si falla, se reintenta en la siguiente llamada
  const obtenerLeadId = () => {
    if (!capturaRef.current) {
      capturaRef.current = capturarLead().then((id) => {
        if (!id) capturaRef.current = null;
        return id;
      });
    }
    return capturaRef.current;
  };

  // El formulario se abre al instante; el interés (métrica de clic) se
  // registra en segundo plano y el envío espera a tener el lead_id
  const handleCarClick = () => {
    setShowContactForm(true);
    obtenerLeadId();
  };

  const handleSubmitContact = async () => {
    const email = contactData.email.trim();
    if (!EMAIL_VALIDO.test(email)) {
      toast({
        variant: "destructive",
        title: "Revisa tu email",
        description: "Introduce un email válido para que podamos contactarte."
      });
      return;
    }
    if (!consentimiento) return;  // el botón ya está deshabilitado sin él

    setIsSubmitting(true);

    try {
      const leadId = await obtenerLeadId();
      if (!leadId) throw new Error("Sin lead_id");

      const response = await fetch(`${API_BASE_URL}/api/lead/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          email,
          nombre: contactData.nombre,
          telefono: contactData.telefono,
          consentimiento: true
        })
      });

      if (!response.ok) throw new Error("Error enviando contacto");
      
      toast({
        title: "¡Datos enviados!",
        description: "El concesionario se pondrá en contacto contigo pronto.",
      });
      
      setShowContactForm(false);
      setContactData({ email: "", nombre: "", telefono: "" });
      setConsentimiento(false);

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
        className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-center hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
      >
        <h3 className="text-lg font-bold mt-0 mb-3 text-slate-900 group-hover:text-[#082144] transition-colors">
          {car.name}
        </h3>
        
        {car.imageUrl && (
          <div className="flex justify-center my-3 relative overflow-hidden rounded-lg">
            {/* Hueco reservado (aspect-ratio): al cargar la foto no se mueve el chat */}
            <img
              src={car.imageUrl}
              alt={`Foto de ${car.name}`}
              loading="lazy"
              decoding="async"
              className="w-full aspect-[16/10] rounded-lg border border-gray-100 shadow-sm bg-white object-contain transform group-hover:scale-105 transition-transform duration-500"
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
                {/* Popover (no Tooltip): se abre también con un toque en el móvil */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Qué significa la puntuación"
                      className="inline-flex items-center justify-center gap-1 text-xs text-slate-500 uppercase tracking-wide hover:text-[#082144]"
                    >
                      Puntuación
                      <Info className="h-3 w-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 bg-white text-slate-700 text-xs leading-relaxed border-slate-200">
                    Indica cuánto encaja este coche con lo que nos has contado: tu uso,
                    pasajeros, presupuesto y preferencias. Cuanto más alta, mejor encaje
                    contigo.
                  </PopoverContent>
                </Popover>
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
          <PhoneCall className="w-4 h-4 mr-2" />
          Quiero que me contacten
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

            <div className="flex items-start gap-2 pt-1">
              <Checkbox
                id="consentimiento"
                checked={consentimiento}
                onCheckedChange={(v) => setConsentimiento(v === true)}
                className="mt-0.5 border-slate-400 data-[state=checked]:bg-[#082144] data-[state=checked]:border-[#082144] data-[state=checked]:text-white"
              />
              <Label htmlFor="consentimiento" className="text-xs font-normal leading-snug text-slate-600">
                Acepto que CarBlau comparta mis datos con el concesionario para que me contacte sobre este coche.{" "}
                {PRIVACY_URL && (
                  <a
                    href={PRIVACY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#082144]"
                  >
                    Política de privacidad
                  </a>
                )}
                <span className="text-red-500"> *</span>
              </Label>
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
              disabled={isSubmitting || !consentimiento}
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
export function CarResultsMessage({ data, threadId, mensajeId }: CarResultsMessageProps) {
  return (
    <div className={cn("flex items-start gap-4")}>
      
      {/* 🖼️ AVATAR DEL AGENTE */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden">
        <img 
          src="/favicon_cb.webp" 
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

        <FeedbackRecomendaciones threadId={threadId} mensajeId={mensajeId} />
      </div>
    </div>
  );
}