"use client";

import { useEffect, useRef, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Check, X } from "lucide-react";
import { CALCOM_EVENT } from "@/lib/config";
import { cargarCal, escucharReserva, NS_CAL, telefonoE164 } from "@/lib/calcom";

interface CitaCalendarioProps {
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
  datos: { nombre: string; email: string; telefono: string };
  leadId: string | null;
  cocheNombre?: string;
  onReservada: (inicio: Date) => void;
}

// Calendario de Cal.com para reservar la llamada con un especialista: a pantalla
// completa en móvil, diálogo centrado en escritorio. Se abre con el lead ya
// guardado: cerrar sin reservar deja la confirmación de siempre («…en menos de
// 24 horas»). Nombre, email y teléfono van rellenos; en las notas, «Lead: <id>».
export function CitaCalendario({ abierto, onOpenChange, datos, leadId, cocheNombre, onReservada }: CitaCalendarioProps) {
  // Ref de callback: el contenido del diálogo se monta un instante después de
  // abrirse (Radix), y el efecto tiene que esperar a que exista el contenedor
  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null);
  const [cargado, setCargado] = useState(false);
  const reservada = useRef(onReservada);
  reservada.current = onReservada;
  const nombre = datos.nombre.trim();
  const email = datos.email.trim();
  const telefono = datos.telefono.trim();

  useEffect(() => {
    const el = contenedor;
    if (!abierto || !el || !CALCOM_EVENT) return;
    const Cal = cargarCal();
    Cal("init", NS_CAL, { origin: "https://cal.com" });
    const config: Record<string, string> = { layout: "month_view", theme: "light" };
    if (nombre) config.name = nombre;
    if (email) config.email = email;
    const e164 = telefonoE164(telefono);
    if (e164) {
      // El teléfono de la ubicación «llamada telefónica al asistente» se rellena con
      // `location`; `attendeePhoneNumber` solo rellena una pregunta «Phone number» aparte
      config.location = JSON.stringify({ value: "phone", optionValue: e164 });
      config.attendeePhoneNumber = e164;
    }
    config.notes = [leadId ? `Lead: ${leadId}` : null, cocheNombre ? `Coche: ${cocheNombre}` : null]
      .filter(Boolean)
      .join("\n");
    Cal.ns[NS_CAL]("inline", { elementOrSelector: el, calLink: CALCOM_EVENT, config });
    Cal.ns[NS_CAL]("ui", {
      hideEventTypeDetails: false,
      layout: "month_view",
      cssVarsPerTheme: { light: { "cal-brand": "#082144" } },
    });
    escucharReserva((inicio) => reservada.current(inicio));
    const observador = new MutationObserver(() => {
      if (el.querySelector("iframe")) setCargado(true);
    });
    observador.observe(el, { childList: true, subtree: true });
    return () => {
      observador.disconnect();
      escucharReserva(null);
      el.innerHTML = "";
      setCargado(false);
    };
  }, [abierto, contenedor, nombre, email, telefono, leadId, cocheNombre]);

  return (
    <DialogPrimitive.Root open={abierto} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-cb-espresso/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-0 z-50 flex flex-col bg-cb-crema text-cb-espresso outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-[min(720px,calc(100dvh-2rem))] sm:w-[940px] sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:overflow-hidden sm:rounded-[20px] sm:shadow-2xl">
          <header className="flex items-center justify-between gap-3 border-b border-cb-espresso/10 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 flex-col gap-0.5">
              <DialogPrimitive.Title className="font-headline text-xl font-semibold leading-tight">
                Elige día y hora
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[13px] leading-snug text-cb-tinta">
                Llamada con un especialista de CarBlau. Si cierras sin reservar, te llamamos en menos de 24 horas.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              aria-label="Cerrar sin reservar"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cb-espresso/20 bg-cb-crema-2 transition-colors hover:bg-cb-espresso/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua"
            >
              <X className="h-[18px] w-[18px]" aria-hidden="true" />
            </DialogPrimitive.Close>
          </header>

          {(nombre || telefono) && (
            <p className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-cb-espresso/[0.06] px-3 py-2 text-[13px] sm:mx-6">
              <Check className="h-4 w-4 shrink-0 text-cb-navy" strokeWidth={2.5} aria-hidden="true" />
              <span>
                Tus datos ya van rellenos: <strong>{[nombre, telefono].filter(Boolean).join(" · ")}</strong>
              </span>
            </p>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2 sm:px-4">
            {!cargado && (
              <p className="px-2 py-6 text-center text-sm text-cb-tinta" aria-live="polite">
                Cargando el calendario…
              </p>
            )}
            <div ref={setContenedor} className="min-h-[420px]" />
          </div>

          <footer className="flex justify-center border-t border-cb-espresso/10 px-4 py-2 sm:py-3">
            <DialogPrimitive.Close className="inline-flex h-11 items-center px-3 text-sm font-semibold text-cb-tinta underline underline-offset-[3px] hover:text-cb-espresso focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua">
              Prefiero que me llamen cuando puedan
            </DialogPrimitive.Close>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
