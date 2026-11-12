"use client";

import { respuestasEncargo, type ItemEncargo } from "@/lib/encargo";

// "Tu encargo": lo que el usuario ya ha contado. En móvil, una fila de chips
// bajo la cabecera; en escritorio, el panel lateral. Solo lectura: para
// cambiar algo se le dice al asesor (el backend acepta correcciones en texto).

export function EncargoChips({ items }: { items: ItemEncargo[] }) {
  const respuestas = respuestasEncargo(items);
  if (respuestas.length === 0) return null;
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto px-4 py-2 cb-scroll-x" aria-label="Tu encargo">
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-cb-crema-tenue">
        Tu encargo
      </span>
      {respuestas.map((r, i) => (
        <span
          key={`${r.tema}-${i}`}
          title={r.tema}
          className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-full border border-cb-crema/20 bg-cb-crema/[0.06] px-2.5 text-xs font-medium text-cb-crema"
        >
          {r.respuesta}
        </span>
      ))}
    </div>
  );
}

export function EncargoPanel({ items, completo }: { items: ItemEncargo[]; completo: boolean }) {
  return (
    <aside aria-label="Tu encargo" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <h2 className="font-headline text-xl font-semibold text-cb-crema">Tu encargo</h2>
        <span className="text-xs font-bold uppercase tracking-[0.08em] text-cb-agua">
          {completo ? "Completo" : items.length > 0 ? "En curso" : ""}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="rounded-[14px] border border-cb-crema/[0.14] p-4 text-sm leading-relaxed text-cb-crema-suave">
          Aquí irá apareciendo lo que nos cuentes: uso, pasajeros, kilómetros, presupuesto…
        </p>
      ) : (
        <dl className="overflow-hidden rounded-[14px] border border-cb-crema/[0.14]">
          {items.map((item) => (
            <div
              key={item.tema}
              className="flex flex-col gap-0.5 px-3.5 py-2.5 [&+&]:border-t [&+&]:border-cb-crema/10"
            >
              <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-cb-crema-tenue">{item.tema}</dt>
              <dd className="text-[15px] leading-snug text-cb-crema">{item.respuestas.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      )}

      <p className="text-xs leading-relaxed text-cb-crema-tenue">
        ¿Algo no es correcto? Díselo al asesor en el chat y lo corregirá.
      </p>

      <div className="flex flex-col gap-2 rounded-[14px] bg-cb-crema/[0.06] p-4">
        <span className="font-headline text-base font-semibold text-cb-crema">Así trabajamos</span>
        <p className="text-sm leading-relaxed text-cb-crema-suave">
          Sin stock ni comisiones de concesionarios. Buscamos la unidad, la revisamos, la preparamos y
          te la entregamos en casa con garantía. Nuestro trabajo va dentro del precio final.
        </p>
        <a
          href="https://carblau.com/sobre-nosotros"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-cb-agua underline underline-offset-[3px] hover:text-cb-crema"
        >
          Quiénes somos
        </a>
      </div>
    </aside>
  );
}
