"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Check } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { BOTON_PRIMARIO, CHIP_COMPACTO_ACTIVO, CHIP_COMPACTO_NORMAL } from "@/components/carblau/quick-replies";
import type { CanalContacto, Car, FranjaContacto } from "@/lib/tipos";
import { nombreLimpio } from "@/lib/texto";
import { API_BASE_URL, CALCOM_EVENT, PRIVACY_URL } from "@/lib/config";
import { CitaCalendario } from "@/components/carblau/cita-calendario";
import { textoCita } from "@/lib/calcom";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO_VALIDO = /^\+?[\d\s().-]{9,}$/;

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
  "h-12 w-full rounded-xl border border-cb-espresso/25 bg-cb-crema-2 px-3.5 text-base text-cb-espresso placeholder:text-cb-tinta/70 focus:outline-none focus:ring-2 focus:ring-cb-agua";
const SEGMENTO =
  "h-10 rounded-[9px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua disabled:opacity-50";

const CANALES: { valor: CanalContacto; etiqueta: string; cta: string }[] = [
  { valor: "whatsapp", etiqueta: "WhatsApp", cta: "Que me escriban por WhatsApp" },
  { valor: "llamada", etiqueta: "Llamada", cta: "Que me llamen" },
  { valor: "email", etiqueta: "Email", cta: "Que me escriban un email" },
];

const FRANJAS: { valor: FranjaContacto; etiqueta: string }[] = [
  { valor: "manana", etiqueta: "Mañanas" },
  { valor: "tarde", etiqueta: "Tardes" },
  { valor: "cualquiera", etiqueta: "Cuando sea" },
];

interface ContactoSheetProps {
  /** «Me interesa»: el coche. Sin coche, es la petición de un especialista */
  car?: Car;
  /** Petición de especialista: la conversación (el backend lee de ella el encargo) */
  sessionId?: string | null;
  abierto: boolean;
  onOpenChange: (abierto: boolean) => void;
}

// "Me interesa": un especialista de CarBlau contacta al usuario sobre ese coche
// por el canal y en la franja que elija. Textos iguales a los de Telegram y
// WhatsApp (backend, 21-11-2026): nunca «concesionario», «sin coste» ni «sin compromiso». Hoja inferior en vez de modal. Al abrirse
// se registra el interés (lead) en segundo plano; el envío espera al lead_id.
// Reglas del backend (utils/leads.py:validar_contacto): WhatsApp y llamada
// exigen teléfono; email exige email; siempre hace falta uno de los dos.
// Dos usos: «Me interesa» (lead con coche) y «Hablar con un especialista» (lead sin
// coche, tipo «especialista»: el backend saca el encargo y los coches vistos de la
// conversación). El formulario y el envío son los mismos; cambian los textos.
export function ContactoSheet({ car, sessionId, abierto, onOpenChange }: ContactoSheetProps) {
  const { toast } = useToast();
  const esEspecialista = !car;
  const clave = car?.carId ?? "especialista";
  // Registro del interés (lead_id) en curso o ya hecho: compartido entre la
  // apertura y el envío para no duplicar leads
  const capturaRef = useRef<Promise<string | null> | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState<string | null>(null); // texto de «contacto previsto»
  const [canal, setCanal] = useState<CanalContacto>("whatsapp");
  const [franja, setFranja] = useState<FranjaContacto>("cualquiera");
  const [datos, setDatos] = useState({ nombre: "", email: "", telefono: "" });
  // RGPD: CarBlau usa los datos para contactar al usuario sobre la búsqueda del
  // coche (sin cesión a terceros); consentimiento explícito, casilla sin marcar
  const [consentimiento, setConsentimiento] = useState(false);
  // Reserva de la llamada con Cal.com (si hay tipo de evento): con «Llamada» se
  // ofrece elegir día y hora en vez de la franja. El lead se guarda antes de abrir
  // el calendario, así no se pierde aunque no termine de reservar.
  const puedeCita = Boolean(CALCOM_EVENT);
  const [conCita, setConCita] = useState(true);
  const [calendario, setCalendario] = useState(false);
  const [leadIdEnviado, setLeadIdEnviado] = useState<string | null>(null);
  const [cita, setCita] = useState<Date | null>(null);
  const eligeCita = puedeCita && canal === "llamada" && conCita;

  const capturarLead = async (): Promise<string | null> => {
    const cuerpo = car
      ? {
          car_id: car.carId,
          session_id: car.sessionId,
          car_nombre: car.name,
          // Precio típico que envía el backend; `price` es un rango y no se puede parsear
          car_precio: car.priceValue ?? parsearPrecio(car.price),
          action: "view_details",
        }
      : { session_id: sessionId, tipo: "especialista" };
    if (car ? !car.carId || !car.sessionId : !sessionId) {
      console.error("Faltan datos para capturar el lead");
      return null;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/lead/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
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

  const necesitaTelefono = canal !== "email";
  const necesitaEmail = canal === "email";

  const enviar = async () => {
    const email = datos.email.trim();
    const telefono = datos.telefono.trim();
    if (necesitaTelefono && !TELEFONO_VALIDO.test(telefono)) {
      toast({
        variant: "destructive",
        title: "Revisa tu teléfono",
        description: "Necesitamos tu teléfono para contactarte por WhatsApp o por llamada.",
      });
      return;
    }
    if (necesitaEmail && !EMAIL_VALIDO.test(email)) {
      toast({
        variant: "destructive",
        title: "Revisa tu email",
        description: "Introduce un email válido para que podamos escribirte.",
      });
      return;
    }
    if (email && !EMAIL_VALIDO.test(email)) {
      toast({ variant: "destructive", title: "Revisa tu email", description: "El email no parece válido." });
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
          email: email || null,
          nombre: datos.nombre.trim() || null,
          telefono: telefono || null,
          canal,
          franja: eligeCita ? null : franja,
          consentimiento: true,
        }),
      });
      if (!response.ok) {
        // 400: el backend explica qué falta («Necesitamos tu teléfono…»)
        let detalle = "";
        try {
          const cuerpo = await response.json();
          detalle = typeof cuerpo?.detail === "string" ? cuerpo.detail : "";
        } catch {
          /* sin cuerpo JSON */
        }
        const error: any = new Error(`HTTP ${response.status}`);
        if (response.status === 400 && detalle) error.detalleUsuario = detalle;
        throw error;
      }
      const data = await response.json();
      // El backend compone la frase con canal, franja y plazo («Te escribimos por
      // WhatsApp por la tarde, en menos de 24 horas.»): se enseña tal cual.
      setEnviado(
        typeof data?.contacto_previsto === "string" && data.contacto_previsto
          ? data.contacto_previsto
          : "Te contactaremos en menos de 24 horas."
      );
      if (eligeCita) {
        setLeadIdEnviado(leadId);
        setCalendario(true);
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "No hemos podido enviar tus datos",
        description: error?.detalleUsuario || "Inténtalo de nuevo en unos segundos.",
      });
    } finally {
      setEnviando(false);
    }
  };

  // Cierre sin enviar («Ahora no», gesto o Escape): se le dice al usuario que no
  // queda nada suyo guardado. El registro de interés al abrir no lleva datos personales.
  const cambiarAbierto = (valor: boolean) => {
    if (!valor && !enviado && !enviando) {
      toast({ title: "Sin problema, no guardamos tus datos.", duration: 4000 });
    }
    onOpenChange(valor);
  };
  const cerrar = () => cambiarAbierto(false);
  const nombre = car ? nombreLimpio(car.name) : "";
  const cta = CANALES.find((c) => c.valor === canal)?.cta ?? "Que me contacten";

  return (
    <Sheet open={abierto} onOpenChange={cambiarAbierto}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[24px] border-0 bg-cb-crema p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-cb-espresso"
      >
        <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-10 rounded-sm bg-cb-espresso/20" />

        {enviado ? (
          <div className="flex flex-col gap-3.5 py-1">
            <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-cb-agua">
              <Check className="h-6 w-6" strokeWidth={3} />
            </span>
            <SheetHeader className="space-y-1.5 text-left">
              <SheetTitle className="font-headline text-[26px] font-semibold leading-tight text-cb-espresso">
                {cita ? `¡Hecho! Te llamamos ${textoCita(cita)}.` : "¡Hecho! Nos ponemos a buscarlo."}
              </SheetTitle>
              <SheetDescription className="text-base leading-relaxed text-cb-espresso">
                {cita ? "Tienes la cita en tu email por si quieres cambiarla." : enviado}{" "}
                {esEspecialista
                  ? "Un especialista de CarBlau sigue con tu búsqueda."
                  : `Un especialista de CarBlau se ocupa del ${nombre}.`}
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
                {esEspecialista
                  ? "Un especialista de CarBlau busca contigo tu coche"
                  : "Un especialista de CarBlau te ayuda con este coche"}
              </SheetTitle>
              <SheetDescription className="text-sm text-cb-tinta">
                {esEspecialista
                  ? "Te contactaremos en menos de 24 horas."
                  : `${nombre} · ${car?.price}. Te contactaremos en menos de 24 horas.`}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-cb-tinta">¿Por dónde prefieres?</span>
              <div role="group" aria-label="Canal de contacto" className="grid grid-cols-3 gap-1 rounded-xl bg-cb-espresso/[0.08] p-1">
                {CANALES.map((c) => (
                  <button
                    key={c.valor}
                    type="button"
                    aria-pressed={canal === c.valor}
                    onClick={() => setCanal(c.valor)}
                    disabled={enviando}
                    className={`${SEGMENTO} ${canal === c.valor ? "bg-cb-espresso text-cb-crema" : "text-cb-espresso hover:bg-cb-espresso/10"}`}
                  >
                    {c.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label htmlFor={`nombre-${clave}`} className="text-[13px] font-semibold">
                  Nombre
                </label>
                <input
                  id={`nombre-${clave}`}
                  type="text"
                  autoComplete="name"
                  placeholder="Cómo te llamas"
                  className={CAMPO}
                  value={datos.nombre}
                  onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`telefono-${clave}`} className="text-[13px] font-semibold">
                  Teléfono{" "}
                  <span className="font-normal text-cb-tinta">{necesitaTelefono ? "(obligatorio)" : "(opcional)"}</span>
                </label>
                <input
                  id={`telefono-${clave}`}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="600 123 456"
                  required={necesitaTelefono}
                  className={CAMPO}
                  value={datos.telefono}
                  onChange={(e) => setDatos({ ...datos, telefono: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor={`email-${clave}`} className="text-[13px] font-semibold">
                  Email{" "}
                  <span className="font-normal text-cb-tinta">{necesitaEmail ? "(obligatorio)" : "(opcional)"}</span>
                </label>
                <input
                  id={`email-${clave}`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@email.com"
                  required={necesitaEmail}
                  className={CAMPO}
                  value={datos.email}
                  onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-cb-tinta">¿Cuándo te va bien?</span>
              {puedeCita && canal === "llamada" && (
                <button
                  type="button"
                  aria-pressed={conCita}
                  onClick={() => setConCita(true)}
                  disabled={enviando}
                  className={`flex min-h-[64px] items-center gap-3 rounded-2xl border-2 bg-cb-crema-2 px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-agua disabled:opacity-50 ${
                    conCita ? "border-cb-navy" : "border-cb-espresso/[0.18] hover:border-cb-espresso/40"
                  }`}
                >
                  <span
                    className={`inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] ${
                      conCita ? "bg-cb-navy text-cb-crema" : "bg-cb-agua/40 text-cb-navy"
                    }`}
                  >
                    <CalendarDays className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-bold">Elige día y hora</span>
                    <span className="text-[13px] text-cb-tinta">Una llamada corta, cuando mejor te venga</span>
                  </span>
                  {conCita && (
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cb-navy text-cb-crema">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
                    </span>
                  )}
                </button>
              )}
              <div className="flex items-center gap-2">
                {puedeCita && canal === "llamada" && (
                  <span className="shrink-0 text-[13px] text-cb-tinta">o una franja:</span>
                )}
                {FRANJAS.map((f) => (
                  <button
                    key={f.valor}
                    type="button"
                    aria-pressed={!eligeCita && franja === f.valor}
                    onClick={() => {
                      setFranja(f.valor);
                      setConCita(false);
                    }}
                    disabled={enviando}
                    className={`${!eligeCita && franja === f.valor ? CHIP_COMPACTO_ACTIVO : CHIP_COMPACTO_NORMAL} min-h-[40px] flex-1 rounded-full`}
                  >
                    {f.etiqueta}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox
                id={`consentimiento-${clave}`}
                checked={consentimiento}
                onCheckedChange={(v) => setConsentimiento(v === true)}
                className="mt-0.5 h-5 w-5 border-cb-espresso/50 data-[state=checked]:border-cb-espresso data-[state=checked]:bg-cb-espresso data-[state=checked]:text-cb-crema"
              />
              <label
                htmlFor={`consentimiento-${clave}`}
                className="text-[13px] leading-snug text-cb-espresso"
              >
                Acepto que CarBlau me contacte sobre mi búsqueda. No cedemos tus datos a terceros.{" "}
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
                {enviando ? "Enviando…" : eligeCita ? "Elegir día y hora" : cta}
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

        {puedeCita && (
          <CitaCalendario
            abierto={calendario}
            onOpenChange={setCalendario}
            datos={datos}
            leadId={leadIdEnviado}
            cocheNombre={nombre || undefined}
            onReservada={(inicio) => {
              setCita(inicio);
              setCalendario(false);
            }}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
