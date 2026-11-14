"use client";

import { MessageCircle, MoreHorizontal, Phone, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CONTACT_PHONE } from "@/lib/config";

const WHATSAPP_MSG = encodeURIComponent(
  "Hola, vengo del asesor virtual de CarBlau y prefiero hablar con una persona."
);
export const WHATSAPP_URL = `https://wa.me/34${CONTACT_PHONE}?text=${WHATSAPP_MSG}`;
export const TEL_URL = `tel:+34${CONTACT_PHONE}`;

interface ChatHeaderProps {
  onReiniciar: () => void;
}

const BOTON_ICONO =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-cb-crema/20 text-cb-crema transition-colors hover:bg-cb-crema/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cb-blau";

// Cabecera de la conversación: la identidad es el icono B + «Asesor CarBlau».
// El logotipo completo va en el panel lateral de escritorio (page.tsx) o lo
// pone la landing cuando se embebe; aquí duplicaba la marca y quedaba suelto.
export function ChatHeader({ onReiniciar }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-cb-crema/10 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src="/favicon_cb.webp"
          alt=""
          aria-hidden="true"
          className="h-[30px] w-[30px] shrink-0 rounded-[9px]"
        />
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="font-headline text-base font-semibold text-cb-crema">Asesor CarBlau</span>
          <span className="truncate text-[11px] text-cb-crema-tenue">
            IA supervisada por personas
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Hablar con una persona por WhatsApp"
          title="Hablar con una persona"
          className={BOTON_ICONO}
        >
          <MessageCircle className="h-[18px] w-[18px]" />
        </a>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Más opciones" className={BOTON_ICONO}>
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 border-cb-espresso/10 bg-cb-crema-2 text-cb-espresso">
            <DropdownMenuItem asChild>
              <a href={TEL_URL} className="cursor-pointer gap-2 focus:bg-cb-espresso/10">
                <Phone className="h-4 w-4" />
                Llamar a CarBlau
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer gap-2 focus:bg-cb-espresso/10"
              >
                <MessageCircle className="h-4 w-4" />
                Escribir por WhatsApp
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-cb-espresso/10" />
            <DropdownMenuItem onSelect={onReiniciar} className="cursor-pointer gap-2 focus:bg-cb-espresso/10">
              <RotateCcw className="h-4 w-4" />
              Empezar de cero
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
