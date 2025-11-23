"use client";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { Car, ExternalLink, Phone, Mail } from "lucide-react"; 
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

// Mismo API_BASE_URL que en page.tsx
const API_BASE_URL = "https://carblau-agent-api-v2-1063747381969.europe-west1.run.app";

// Función para limpiar el nombre del coche (eliminar numeración inicial)
function cleanCarName(name: string) {
  return name.replace(/^\d+\.\s*/, "");
}

// Sub-componente mejorado con funcionalidad de lead
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

  // Función para capturar el interés inicial
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
      setShowContactForm(true); // Mostrar formulario de contacto
      
      toast({
        title: "¡Excelente elección!",
        description: `Te interesa el ${car.name}. Déjanos tus datos para contactarte.`,
      });
      
    } catch (error) {
      console.error("Error:", error);
      // Aún así mostrar el formulario aunque falle la captura inicial
      setShowContactForm(true);
    }
  };

  // Función para enviar datos de contacto
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
        // Si tenemos lead_id, actualizar
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
        className="bg-background/50 rounded-lg p-3 shadow-sm text-center cursor-pointer hover:shadow-lg transition-shadow"
      >
        <h3 className="text-lg font-bold mt-0 mb-2">{car.name}</h3>
        
        {car.imageUrl && (
          <div className="flex justify-center my-3">
            <img
              src={car.imageUrl}
              alt={`Foto de ${car.name}`}
              className="rounded-lg border shadow-md max-w-full h-auto"
            />
          </div>
        )}

        <div className="flex justify-center gap-2 my-3 flex-wrap not-prose">
          {car.specs.map((spec: string, i: number) => (
            <span key={i} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
              {spec}
            </span>
          ))}
        </div>

        <p className="font-semibold text-base my-2">
          <strong>Precio:</strong> {car.price} | <strong>Puntuación:</strong> {car.score}
        </p>

        <p className="text-xs text-muted-foreground/80 italic mt-3">
          {car.analysis}
        </p>

        {/* ✅ BOTÓN SIMPLIFICADO - solo un handler */}
        <Button 
        variant="outline" 
        size="sm" 
        className="mt-3 w-full"
        onClick={handleCarClick}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Ver detalles y solicitar información
      </Button>
      </div>

      {/* Modal de contacto */}
      <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Solicitar información sobre {cleanCarName(car.name)}
            </DialogTitle>
            <DialogDescription>
              Déjanos tus datos y el concesionario se pondrá en contacto contigo pronto.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={contactData.email}
                onChange={(e) => setContactData({...contactData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Tu nombre"
                value={contactData.nombre}
                onChange={(e) => setContactData({...contactData, nombre: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                placeholder="600 123 456"
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
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitContact}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar información"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Componente principal
export function CarResultsMessage({ data }: CarResultsMessageProps) {
  console.log("Datos recibidos por CarResultsMessage:", data);
  console.log("DEBUG cars:", data.cars);
  return (
    <div className={cn("flex items-start gap-4")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Car className="w-5 h-5" />
      </div>

      <div className={cn("rounded-lg px-4 py-3 text-sm shadow-md w-full max-w-lg bg-muted text-muted-foreground")}>
        <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
          {data.introText}
        </ReactMarkdown>


        <div className="flex flex-col gap-4 mt-4">
          {data.cars.map((car, index) => (
            <CarCard key={index} car={car as CarData} />
          ))}
        </div>

        {data.outroText && (
          <p className="prose prose-sm dark:prose-invert max-w-none mt-4">{data.outroText}</p>
        )}
      </div>
    </div>
  );
}


// "use client";

// import { useState } from "react";
// import { Car, ExternalLink } from "lucide-react"; 
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
// import type { CarRecommendationPayload } from "@/app/page";
// import ReactMarkdown from "react-markdown";

// // Actualiza el tipo para incluir los nuevos campos
// type CarData = CarRecommendationPayload['cars'][0] & {
//   carId?: string;
//   sessionId?: string;
//   actionType?: string;
// };

// interface CarResultsMessageProps {
//   data: CarRecommendationPayload;
// }

// const API_BASE_URL = "https://carblau-agent-api-v2-1063747381969.europe-west1.run.app";

// // Sub-componente mejorado con funcionalidad de lead
// const CarCard = ({ car }: { car: CarData }) => {
//   const [showContactForm, setShowContactForm] = useState(false);
//   const [leadId, setLeadId] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [contactData, setContactData] = useState({
//     email: "",
//     nombre: "",
//     telefono: ""
//   });
//   const { toast } = useToast();

//   const handleCarClick = async () => {
//     if (!car.carId || !car.sessionId) {
//       console.error("Faltan datos del coche para capturar lead");
//       setShowContactForm(true);
//       return;
//     }

//     // Parsear precio de forma segura
//     const numericPrice = parseFloat(car.price.replace(/[^\d.,]/g, "").replace(",", "."));
//     if (isNaN(numericPrice)) {
//       console.error("Precio inválido:", car.price);
//       setShowContactForm(true);
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/lead/capture`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           car_id: car.carId,
//           session_id: car.sessionId,
//           car_nombre: car.name,
//           car_precio: numericPrice,
//           action: "view_details"
//         })
//       });

//       if (!response.ok) throw new Error("Error capturando interés");
      
//       const data = await response.json();
//       setLeadId(data.lead_id);
//       setShowContactForm(true); // Mostrar formulario de contacto
      
//       toast({
//         title: "¡Excelente elección!",
//         description: `Te interesa el ${car.name}. Déjanos tus datos para contactarte.`,
//       });
      
//     } catch (error) {
//       console.error("Error:", error);
//       setShowContactForm(true);
//     }
//   };

//   const handleSubmitContact = async () => {
//     if (!contactData.email) {
//       toast({
//         variant: "destructive",
//         title: "Email requerido",
//         description: "Por favor ingresa tu email para continuar."
//       });
//       return;
//     }

//     setIsSubmitting(true);
    
//     try {
//       if (leadId) {
//         const response = await fetch(`${API_BASE_URL}/api/lead/contact`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             lead_id: leadId,
//             email: contactData.email,
//             nombre: contactData.nombre,
//             telefono: contactData.telefono
//           })
//         });

//         if (!response.ok) throw new Error("Error enviando contacto");
        
//         toast({
//           title: "¡Datos enviados!",
//           description: "El concesionario se pondrá en contacto contigo pronto.",
//         });
//       }
      
//       setShowContactForm(false);
//       setContactData({ email: "", nombre: "", telefono: "" });
      
//     } catch (error) {
//       console.error("Error:", error);
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "No pudimos enviar tus datos. Por favor intenta de nuevo."
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <div 
//         className="bg-background/50 rounded-lg p-3 shadow-sm text-center cursor-pointer hover:shadow-lg transition-shadow"
//       >
//         <h3 className="text-lg font-bold mt-0 mb-2">{car.name}</h3>
        
//         {car.imageUrl && (
//           <div className="flex justify-center my-3">
//             <img
//               src={car.imageUrl}
//               alt={`Foto de ${car.name}`}
//               className="rounded-lg border shadow-md max-w-full h-auto"
//             />
//           </div>
//         )}

//         <div className="flex justify-center gap-2 my-3 flex-wrap not-prose">
//           {car.specs.map((spec: string, i: number) => (
//             <span key={i} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
//               {spec}
//             </span>
//           ))}
//         </div>

//         <p className="font-semibold text-base my-2">
//           <strong>Precio:</strong> {car.price} | <strong>Puntuación:</strong> {car.score}
//         </p>

//         <p className="text-xs text-muted-foreground/80 italic mt-3">
//           {car.analysis}
//         </p>

//         {/* Botón con handler */}
//         <Button 
//           variant="outline" 
//           size="sm" 
//           className="mt-3 w-full"
//           onClick={handleCarClick}
//         >
//           <ExternalLink className="w-4 h-4 mr-2" />
//           Ver detalles y solicitar información
//         </Button>
//       </div>

//       {/* Modal de contacto */}
//       <Dialog open={showContactForm} onOpenChange={setShowContactForm}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Solicitar información sobre {car.name}</DialogTitle>
//             <DialogDescription>
//               Déjanos tus datos y el concesionario se pondrá en contacto contigo pronto.
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="email">
//                 Email <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="tu@email.com"
//                 value={contactData.email}
//                 onChange={(e) => setContactData({...contactData, email: e.target.value})}
//                 required
//               />
//             </div>
            
//             <div className="grid gap-2">
//               <Label htmlFor="nombre">Nombre</Label>
//               <Input
//                 id="nombre"
//                 placeholder="Tu nombre"
//                 value={contactData.nombre}
//                 onChange={(e) => setContactData({...contactData, nombre: e.target.value})}
//               />
//             </div>
            
//             <div className="grid gap-2">
//               <Label htmlFor="telefono">Teléfono</Label>
//               <Input
//                 id="telefono"
//                 type="tel"
//                 placeholder="600 123 456"
//                 value={contactData.telefono}
//                 onChange={(e) => setContactData({...contactData, telefono: e.target.value})}
//               />
//             </div>
//           </div>
          
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setShowContactForm(false)}
//               disabled={isSubmitting}
//             >
//               Cancelar
//             </Button>
//             <Button 
//               onClick={handleSubmitContact}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? "Enviando..." : "Enviar información"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   );
// };

// // Componente principal con Markdown
// export function CarResultsMessage({ data }: CarResultsMessageProps) {
//   console.log("Datos recibidos por CarResultsMessage:", data);

//   return (
//     <div className={cn("flex items-start gap-4")}>
//       <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
//         <Car className="w-5 h-5" />
//       </div>

//       <div className={cn("rounded-lg px-4 py-3 text-sm shadow-md w-full max-w-lg bg-muted text-muted-foreground")}>
//         {/* Intro con Markdown */}
//         {data.introText && (
//           <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
//             {data.introText}
//           </ReactMarkdown>
//         )}

//         <div className="flex flex-col gap-4 mt-4">
//           {data.cars.map((car, index) => (
//             <CarCard key={index} car={car as CarData} />
//           ))}
//         </div>

//         {/* Outro con Markdown opcional */}
//         {data.outroText && (
//           <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none mt-4">
//             {data.outroText}
//           </ReactMarkdown>
//         )}
//       </div>
//     </div>
//   );
// }
