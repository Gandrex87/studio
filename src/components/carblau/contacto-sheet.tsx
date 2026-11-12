"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { BOTON_PRIMARIO } from "@/components/carblau/quick-replies";
import type { Car } from "@/lib/tipos";
import { nombreLimpio } from "@/lib/texto";
import { API_BASE_URL, PRIVACY_URL } from "@/lib/config";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// "25.990 €" → 25990. Solo como respaldo si el backend no manda priceValue.
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

const CAMPO =
  "h-12 w-full rounded-xl border border-cb-espresso/25 bg-cb-crema-2 px-3.5 text-base text-cb-espresso placeholder:text-cb-tinta/70 focus:outline-none focus:ring-2 focus:ring-cb-blau";

interface ContactoSheetProps {
  car: Car;
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
}

// "Me interesa": un asesor de CarBlau contacta al usuario sobre ese coche.
// Hoja inferior en vez de modal. Al abrirse se registra el interés (lead) en
// segundo plano; el envío del formulario espera a tener el lead_id.
export function ContactoSheet({ car, abierto, onOpenChange }: ContactoSheetProps) {
  const { toast } = useToast();
  // Registro del interés (lead_id) en curso o ya hecho: compartido entre la
  // apertura y el envío para no duplicar leads
  const capturaRef = useRef<Promise<string | null> | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [datos, setDatos] = useState({ nombre: "", email: "", telefono: "" });
  // RGPD: CarBlau usa los datos para contactar al usuario sobre la búsqueda del
  // coche (sin cesión a terceros); consentimiento explícito, casilla sin marcar
  const [consentimiento, setConsentimiento] = useState(false);

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
          // Precio típico que envía el backend; `price` es un rango y no se puede parsear
          car_precio: car.priceValue ?? parsearPrecio(car.price),
          action: "view_details",
        }),
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

  useEffect(() => {
    if (abierto) obtenerLeadId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  const enviar = async () => {
    const email = datos.email.trim();
    if (!EMAIL_VALIDO.test(email)) {
      toast({
        variant: "destructive",
        title: "Revisa tu email",
        description: "Introduce un email válido para que podamos contactarte.",
      });
      return;
    }
    if (!consentimiento) return; // el botón ya está deshabilitado sin él

    setEnviando(true);
    try {
      const leadId = await obtenerLeadId();
      if (!leadId) throw new Error("Sin lead_id");

      const response = await fetch(`${API_BASE_URL}/api/lead/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_id: leadId,
          email,
          nombre: datos.nombre,
          telefono: datos.telefono,
          consentimiento: true,
        }),
      });
      if (!response.ok) throw new Error("Error enviando contacto");
      setEnviado(true);
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "No hemos podido enviar tus datos",
        description: "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const cerrar = () => onOpenChange(false);
  const nombre = nombreLimpio(car.name);

  return (
    <Sheet open={abierto} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto w-full max-w-lg rounded-t-[24px] border-0 bg-cb-crema p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-cb-espresso"
      >
        <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-10 rounded-sm bg-cb-espresso/20" />

        {enviado ? (
          <div className="flex flex-col gap-3.5 py-1">
            <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-cb-agua">
              <Check className="h-6 w-6" strokeWidth={3} />
            </span>
            <SheetHeader className="space-y-1.5 text-left">
              <SheetTitle className="font-headline text-[26px] font-semibold leading-tight text-cb-espresso">
                Hecho. Nos ponemos con ello.
              </SheetTitle>
              <SheetDescription className="text-base leading-relaxed text-cb-espresso">
                Un asesor de CarBlau te contacta en cuanto tengamos opciones del {nombre}.
              </SheetDescription>
            </SheetHeader>
            <p className="text-sm leading-relaxed text-cb-tinta">
              No compartimos tus datos con nadie. Si nuestra propuesta no te interesa, no volveremos a
              escribirte.
            </p>
            <button type="button" onClick={cerrar} className={`${BOTON_PRIMARIO} mt-1 h-[52px] w-full`}>
              Seguir afinando la búsqueda
            </button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            <SheetHeader className="space-y-1 text-left">
              <SheetTitle className="font-headline text-2xl font-semibold leading-tight text-cb-espresso">
                Un asesor de CarBlau te contacta
              </SheetTitle>
              <SheetDescription className="text-sm text-cb-tinta">
                Sobre el {nombre} · {car.price}. Buscamos una unidad para ti, sin compromiso.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor={`nombre-${car.carId}`} className="text-[13px] font-semibold">
                  Nombre
                </label>
                <input
                  id={`nombre-${car.carId}`}
                  type="text"
                  autoComplete="name"
                  placeholder="Cómo te llamas"
                  className={CAMPO}
                  value={datos.nombre}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`email-${car.carId}`} className="text-[13px] font-semibold">
                  Email <span className="text-cb-tinta">(obligatorio)</span>
                </label>
                <input
                  id={`email-${car.carId}`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@email.com"
                  required
                  className={CAMPO}
                  value={datos.email}
                  onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`telefono-${car.carId}`} className="text-[13px] font-semibold">
                  Teléfono <span className="font-normal text-cb-tinta">(si prefieres que te llamemos)</span>
                </label>
                <input
                  id={`telefono-${car.carId}`}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="600 123 456"
                  className={CAMPO}
                  value={datos.telefono}
                  onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox
                id={`consentimiento-${car.carId}`}
                checked={consentimiento}
                onCheckedChange={(v) => setConsentimiento(v === true)}
                className="mt-0.5 h-5 w-5 border-cb-espresso/50 data-[state=checked]:border-cb-espresso data-[state=checked]:bg-cb-espresso data-[state=checked]:text-cb-crema"
              />
              <label
                htmlFor={`consentimiento-${car.carId}`}
                className="text-[13px] leading-snug text-cb-espresso"
              >
                Acepto que CarBlau me contacte sobre la búsqueda de este coche. Mis datos no se ceden a
                terceros.{" "}
                {PRIVACY_URL && (
                  <a
                    href={PRIVACY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2"
                  >
                    Política de privacidad
                  </a>
                )}
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <button
                type="submit"
                disabled={enviando || !consentimiento}
                className={`${BOTON_PRIMARIO} h-[52px] w-full`}
              >
                {enviando ? "Enviando…" : "Que me contacten"}
              </button>
              <button
                type="button"
                onClick={cerrar}
                disabled={enviando}
                className="inline-flex h-11 items-center justify-center text-sm font-semibold text-cb-tinta hover:text-cb-espresso"
              >
                Ahora no
              </button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
