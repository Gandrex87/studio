#!/usr/bin/env node
// Backend de mentira para desarrollar la interfaz sin gastar créditos de
// OpenAI ni tocar Redis/BigQuery. Reproduce el contrato de carblau-agent-api
// (README → "Contrato con el backend") con una conversación guionizada que
// pasa por TODOS los controles de respuesta, las fichas, la comparativa y los
// leads. Cada mensaje del usuario avanza un paso del guion.
//
//   npm run mock-api        # http://localhost:8000
//   npm run dev:mock        # Next.js apuntando al mock
//
// Variables: MOCK_PORT (8000), MOCK_DELAY_MS (retardo entre eventos, 350).

import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.MOCK_PORT || 8000);
const DELAY = Number(process.env.MOCK_DELAY_MS || 350);

const POST_RESULTADOS = ["⚖️ Comparar coches", "➕ Ver más opciones", "🎯 Afinar búsqueda", "💰 Cambiar presupuesto"];

const progreso = (paso, etiqueta) => ({ paso, total: 5, etiqueta });

function coches(threadId, sufijo = "") {
  return [
    {
      name: "1. Toyota Corolla 1.8 Hybrid Active",
      specs: ["Híbrido", "2019", "Delantera"],
      imageUrl: "https://placehold.co/640x400/ffffff/1C1714/png?text=Toyota+Corolla",
      hasImage: true,
      price: "16.500–18.900 €",
      priceLabel: "Rango típico",
      priceValue: 17500,
      priceRange: { min: 16500, max: 18900 },
      priceIsApprox: true,
      priceConfidence: "alta",
      score: "88.40 pts",
      analysis:
        "Fiabilidad de referencia y consumo real de unos 4,5 l/100 km en ciudad. Híbrido sin enchufe: nada que cambiar en tu rutina. Mantenimiento barato en red oficial.",
      carId: "corolla-2019" + sufijo,
      sessionId: threadId,
      actionType: "view_details",
    },
    {
      name: "2. Kia Sorento 2.2 CRDi 4x4 Drive",
      specs: ["Diésel", "2014", "4x4"],
      imageUrl: null,
      hasImage: false,
      price: "≈ 15.500 €",
      priceLabel: "Precio orientativo",
      priceValue: 15500,
      priceRange: null,
      priceIsApprox: true,
      priceConfidence: "baja",
      score: "81.05 pts",
      analysis:
        "Siete plazas reales y tracción total para caminos. El motor 2.2 CRDi es robusto si la cadena de distribución se ha revisado. Consume más que una berlina: unos 7,5 l/100 km.",
      carId: "sorento-2014" + sufijo,
      sessionId: threadId,
      actionType: "view_details",
    },
    {
      name: "3. Mercedes-Benz Clase C 220 CDI Elegance",
      specs: ["Diésel", "2011", "Trasera"],
      imageUrl: "https://localhost.invalid/no-existe.jpg",
      hasImage: true,
      price: "9.800–12.400 €",
      priceLabel: "Rango típico",
      priceValue: 11000,
      priceRange: { min: 9800, max: 12400 },
      priceIsApprox: true,
      priceConfidence: "media",
      score: "76.70 pts",
      analysis:
        "La berlina más cómoda de las tres para carretera. Con muchos kilómetros conviene revisar inyectores y volante bimasa. Mantenimiento de marca premium: reserva unos 600 € al año.",
      carId: "clasec-2011" + sufijo,
      sessionId: threadId,
      actionType: "view_details",
    },
  ];
}

// Guion: respuesta del agente tras cada mensaje del usuario
const GUION = [
  {
    content: "Perfecto, anoto. **¿Con qué frecuencia usarás el coche?**",
    additional_kwargs: {
      quick_reply_config: {
        type: "buttons",
        options: [
          "💨 A diario (incluso varias veces al día)",
          "🔄 Frecuentemente (varias veces por semana)",
          "🕐 Ocasionalmente (pocas veces al mes)",
        ],
      },
      progreso: progreso(1, "Uso del coche"),
    },
  },
  {
    content: "Entendido. **¿Cuál es la distancia aproximada de tu trayecto más habitual?**",
    additional_kwargs: {
      quick_reply_config: { type: "distance_slider", field: "distancia_trayecto" },
      progreso: progreso(1, "Uso del coche"),
    },
  },
  {
    content: "Con esos trayectos, **¿sabes aproximadamente cuántos kilómetros recorres al año?**",
    additional_kwargs: {
      quick_reply_config: { type: "km_anuales_slider", field: "km_anuales" },
      progreso: progreso(1, "Uso del coche"),
    },
  },
  {
    content: "Genial. **¿Circularás principalmente por ciudad o también por carretera?**",
    additional_kwargs: {
      quick_reply_config: {
        type: "buttons",
        options: ["🚦 Sí, principalmente ciudad", "⛰️ No, también carretera"],
      },
      progreso: progreso(2, "Por dónde circulas"),
    },
  },
  {
    content: "Vamos con el espacio. **¿Sueles ir acompañado y con equipaje?**",
    additional_kwargs: {
      quick_reply_config: {
        type: "buttons",
        options: [
          "👥 Acompañado, sin equipaje",
          "👥🧳 Acompañado, con equipaje",
          "🚶 Solo, sin equipaje",
          "🚶🧳 Solo, con equipaje",
        ],
      },
      progreso: progreso(3, "Espacio"),
    },
  },
  {
    content: "**¿Cuántos pasajeros sueles llevar?**",
    additional_kwargs: {
      quick_reply_config: { type: "pasajeros_slider", field: "num_otros_pasajeros" },
      progreso: progreso(3, "Espacio"),
    },
  },
  {
    content:
      "Anotado. **¿Cómo de importante es para ti que el coche sea económico de mantener** (consumo, impuestos, seguros)?",
    additional_kwargs: {
      quick_reply_config: { type: "buttons", options: ["💰 Mucho", "➖ Poco", "🤷 Indiferente"] },
      progreso: progreso(4, "Costes de uso"),
    },
  },
  {
    content:
      "Última: nuestro trabajo va incluido en el precio final del coche. **¿Cómo prefieres pagar el coche y cuál es tu presupuesto?**",
    additional_kwargs: {
      quick_reply_config: { type: "presupuesto_unificado", field: "presupuesto_unificado" },
      progreso: progreso(5, "Presupuesto"),
    },
  },
  (threadId) => ({
    content:
      "Con esta información he preparado una primera selección de modelos. Dime si voy bien encaminado o si profundizamos más en tus necesidades para ajustar los resultados.\n\n*¿Quieres **comparar** dos coches, **afinar la búsqueda**, **cambiar el presupuesto** o **empezar de nuevo**?*",
    additional_kwargs: {
      payload: {
        type: "car_recommendation",
        introText:
          "Con esta información he preparado una primera selección de modelos. Dime si voy bien encaminado o si profundizamos más en tus necesidades para ajustar los resultados.\n\n*¿Quieres **comparar** dos coches, **afinar la búsqueda**, **cambiar el presupuesto** o **empezar de nuevo**?*",
        cars: coches(threadId),
      },
      quick_reply_config: { type: "buttons", options: POST_RESULTADOS },
    },
  }),
  {
    content:
      "El Corolla (#1) es más barato de usar y el más fiable; el Sorento (#2) gana en espacio y tracción, pero consume bastante más.\n\n---\n*¿Quieres **afinar la búsqueda** con más detalles, **cambiar el presupuesto**? También puedes seguir preguntándome sobre estos coches.*",
    additional_kwargs: {
      car_comparison: {
        coches: [
          { indice: 1, nombre: "#1 Toyota Corolla 1.8 Hybrid Active" },
          { indice: 2, nombre: "#2 Kia Sorento 2.2 CRDi 4x4 Drive" },
        ],
        categorias: [
          {
            nombre: "Económico",
            icono: "💰",
            filas: [
              { etiqueta: "Precio típico", valores: ["16.500–18.900 €", "≈ 15.500 €"], mejor_idx: 1 },
              { etiqueta: "Consumo real", valores: ["4,5 l/100 km", "7,5 l/100 km"], mejor_idx: 0 },
              { etiqueta: "Mantenimiento anual estimado", valores: ["Unos 350 €", "Unos 500 €"], mejor_idx: 0 },
            ],
          },
          {
            nombre: "Espacio",
            icono: "📏",
            filas: [
              { etiqueta: "Plazas", valores: ["5", "7"], mejor_idx: 1 },
              { etiqueta: "Maletero", valores: ["361 litros", "660 litros"], mejor_idx: 1 },
            ],
          },
          {
            nombre: "Fiabilidad",
            icono: "🔧",
            filas: [
              {
                etiqueta: "Averías conocidas",
                valores: ["Muy fiable, pocos problemas reportados", "Pocas. Vigilar la cadena de distribución."],
                mejor_idx: null,
              },
            ],
          },
        ],
      },
      quick_reply_config: { type: "buttons", options: POST_RESULTADOS },
    },
  },
  {
    content:
      "Perfecto, afinamos. **¿Tienes preferencia por algún tipo de carrocería?**\n\n*Puedes seleccionar **una o varias opciones** y pulsar **Continuar** cuando termines.*",
    additional_kwargs: {
      quick_reply_config: {
        type: "buttons",
        options: ["🚙 SUV", "🏔️ Todoterreno", "🚘 Berlina", "🚐 Monovolumen", "🚚 Furgoneta", "🤷 Indiferente"],
        multi_select: true,
        submit_label: "Continuar",
      },
    },
  },
  (threadId) => ({
    content: "He actualizado la selección con lo que me has dicho:",
    additional_kwargs: {
      payload: {
        type: "car_recommendation",
        introText:
          "He actualizado la selección con lo que me has dicho:\n\n**¿Qué te gustaría hacer ahora?**\n* **Comparar** dos o más coches entre sí\n* **Afinar la búsqueda** con más detalles\n* **Cambiar el presupuesto**",
        cars: coches(threadId, "-b"),
      },
      quick_reply_config: { type: "buttons", options: POST_RESULTADOS },
    },
  }),
];

const SALUDO =
  "Hola, soy CarBlau 🚗\n\n**¿Qué necesitas que haga tu próximo coche?** Cuéntame sobre tus preferencias y buscaré las opciones que mejor se adapten.";

const PROGRESO_TURNO = ["Analizando tu mensaje", "Analizando tu respuesta", "Buscando vehículos que se ajustan a tu perfil"];

const hilos = new Map(); // thread_id → { paso, messages }

const mensaje = (role, content, additional_kwargs) => ({
  id: randomUUID(),
  role,
  content,
  ...(additional_kwargs ? { additional_kwargs } : {}),
});

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

function json(res, status, cuerpo) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(cuerpo === undefined ? "" : JSON.stringify(cuerpo));
}

function leerCuerpo(req) {
  return new Promise((resolve) => {
    let datos = "";
    req.on("data", (c) => (datos += c));
    req.on("end", () => {
      try {
        resolve(datos ? JSON.parse(datos) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return json(res, 204);

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const ruta = url.pathname;
  console.log(`${req.method} ${ruta}`);

  if (req.method === "GET" && ruta === "/") return json(res, 200, { message: "Mock del agente CarBlau" });

  // Capturas automáticas: responde tras `ms` milisegundos (retrasa el `load` de
  // una página contenedora para que la app dentro de un iframe termine de cargar)
  if (req.method === "GET" && ruta === "/espera") {
    await dormir(Math.min(Number(url.searchParams.get("ms") || 3000), 20000));
    return json(res, 204);
  }

  if (req.method === "POST" && ruta === "/start") {
    const thread_id = randomUUID();
    const saludo = mensaje("agent", SALUDO);
    hilos.set(thread_id, { paso: 0, messages: [saludo] });
    return json(res, 201, { thread_id, messages: [saludo] });
  }

  const m = ruta.match(/^\/conversation\/([^/]+)\/(message|messages)$/);
  if (m) {
    const hilo = hilos.get(m[1]);
    if (!hilo) return json(res, 404, { detail: "Conversación no encontrada." });

    if (req.method === "GET" && m[2] === "messages") {
      return json(res, 200, { thread_id: m[1], messages: hilo.messages });
    }

    if (req.method === "POST" && m[2] === "message") {
      const cuerpo = await leerCuerpo(req);
      const texto = cuerpo?.messages?.[0]?.content ?? "";
      if (!texto.trim()) return json(res, 400, { detail: "El contenido del mensaje no puede estar vacío." });
      if (texto.length > 1000) return json(res, 413, { detail: "El mensaje es demasiado largo (máximo 1000 caracteres)." });
      if (/^error$/i.test(texto.trim())) {
        // "error" fuerza un fallo del agente para probar el aviso
        res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
        res.write(`data: ${JSON.stringify({ type: "error", message: "Error interno del agente" })}\n\n`);
        return res.end();
      }

      hilo.messages.push(mensaje("user", texto));
      const entrada = GUION[hilo.paso % GUION.length];
      const respuesta = typeof entrada === "function" ? entrada(m[1]) : entrada;
      const nuevo = mensaje("agent", respuesta.content, respuesta.additional_kwargs);
      hilo.messages.push(nuevo);
      hilo.paso += 1;

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });
      res.write(`data: ${JSON.stringify({ type: "status", message: "Procesando tu mensaje..." })}\n\n`);
      const esBusqueda = Boolean(respuesta.additional_kwargs?.payload);
      const pasos = esBusqueda ? PROGRESO_TURNO : PROGRESO_TURNO.slice(0, 2);
      for (const estado of pasos) {
        await dormir(DELAY);
        res.write(`data: ${JSON.stringify({ type: "progress", node: "mock", status: estado })}\n\n`);
        res.write(": keepalive\n\n");
      }
      await dormir(esBusqueda ? DELAY * 3 : DELAY);
      res.write(`data: ${JSON.stringify({ type: "complete", messages: [nuevo] })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "done", message: "Proceso completado" })}\n\n`);
      return res.end();
    }
  }

  if (req.method === "POST" && ruta === "/api/lead/capture") {
    const cuerpo = await leerCuerpo(req);
    console.log("  lead/capture", cuerpo);
    return json(res, 200, {
      success: true,
      lead_id: randomUUID(),
      message: "Interés registrado correctamente",
      next_action: "show_contact_form",
    });
  }

  if (req.method === "POST" && ruta === "/api/lead/contact") {
    const cuerpo = await leerCuerpo(req);
    console.log("  lead/contact", { ...cuerpo, email: "***", telefono: "***" });
    if (!cuerpo.consentimiento) {
      return json(res, 400, { detail: "Necesitamos tu consentimiento para guardar tus datos de contacto." });
    }
    return json(res, 200, {
      success: true,
      lead_id: cuerpo.lead_id,
      message: "Información de contacto guardada. Te contactaremos pronto.",
      next_action: "show_confirmation",
    });
  }

  if (req.method === "POST" && ruta === "/api/feedback") {
    const cuerpo = await leerCuerpo(req);
    console.log("  feedback", cuerpo);
    return json(res, 204);
  }

  json(res, 404, { detail: "Not Found" });
});

server.listen(PORT, () => {
  console.log(`Mock del agente CarBlau en http://localhost:${PORT}`);
  console.log(`Arranca el front con: NEXT_PUBLIC_API_URL=http://localhost:${PORT} npm run dev`);
});
