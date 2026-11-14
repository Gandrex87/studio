# CarBlau — frontend

Chat web con el agente de IA de CarBlau, que recomienda coches a partir de una
conversación guiada. Este repositorio es solo la interfaz: la lógica del agente
vive en el backend (`carblau-agent-api`, Cloud Run).

**Stack:** Next.js 15 (App Router, `output: standalone`), React 18, Tailwind,
shadcn/ui (Radix), framer-motion, react-markdown.

## Desarrollo

```bash
npm install
npm run dev                                          # backend de producción
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev  # backend local
npm run typecheck
```

Sin backend (ni créditos de OpenAI): `scripts/mock-api.mjs` imita el contrato
con una conversación guionizada que pasa por todos los controles, las fichas,
la comparativa y los leads. En dos terminales:

```bash
npm run mock-api   # http://localhost:8000
npm run dev:mock   # Next.js apuntando al mock
```

`?thread=<id>` abre una conversación concreta (QA, soporte); `?embed=1` oculta
el logo (dentro de carblau.com/asesor) y `?autostart=1` salta la bienvenida.

La URL del backend está en [`src/lib/config.ts`](src/lib/config.ts). Al ser
`NEXT_PUBLIC_*`, se incrusta en el bundle **al compilar**, no al arrancar.
Lo mismo con `NEXT_PUBLIC_PRIVACY_URL`, el enlace a la política de privacidad
del consentimiento en el formulario de contacto (por defecto,
https://carblau.com/politica-de-privacidad).

## Estructura

| Ruta | Qué hay |
| --- | --- |
| `src/app/page.tsx` | Estado del chat, llamadas al backend y streaming; layout móvil y de escritorio |
| `src/app/globals.css`, `tailwind.config.ts` | Tema de marca (el de carblau.com): colores `cb-*`, Source Serif 4 + Source Sans 3 |
| `src/lib/tipos.ts` | Contrato con el backend (tipos de los mensajes) |
| `src/lib/encargo.ts`, `texto.ts` | «Tu encargo» deducido de la conversación; limpieza de emojis y nombres |
| `src/components/carblau/` | Componentes del chat: cabecera, mensajes, controles de respuesta en línea (`inline-widget`, `opciones-rango`, `presupuesto-unificado`, `quick-replies`), fichas (`car-results-message`, `foto-coche`, `contacto-sheet`), comparativa, estado de búsqueda y bienvenida |
| `src/components/ui/` | Componentes shadcn/ui (no tocar salvo para regenerarlos) |
| `src/lib/config.ts` | URL del backend |
| `scripts/mock-api.mjs` | Backend de mentira para desarrollar sin el agente |

Diseño de referencia (lienzo con las pantallas y los fundamentos de marca):
<https://claude.ai/artifact/WSgBeNDTtL38wyCzfbPs6H>.

## Contrato con el backend

| Endpoint | Uso |
| --- | --- |
| `POST /start` | Crea la conversación → `thread_id` y mensajes iniciales |
| `POST /conversation/{thread_id}/message` | Envía un mensaje. Responde en streaming, una línea `data: {json}` por evento: `progress` (texto de estado), `complete` (mensajes nuevos) o `error` |
| `GET /conversation/{thread_id}/messages` | Recupera la conversación al recargar (el `thread_id` se guarda en `sessionStorage`) |
| `POST /api/lead/capture` | Interés por un coche → `lead_id` |
| `POST /api/lead/contact` | Datos de contacto asociados a un `lead_id` |
| `POST /api/feedback` | 👍/👎 sobre una tanda de recomendaciones (`thread_id`, `mensaje_id`, `valor`) |

Qué se pinta depende de `additional_kwargs` en cada mensaje del agente:

- `payload` con `type: "car_recommendation"` → fichas de coches. Sin foto
  (`imageUrl` null o URL rota) se enseña `public/coche-sin-foto.webp` con el
  rótulo «Foto no disponible» (placeholder de marca, origen en el backend:
  `docs/recursos/placeholder_coche`).
- `car_comparison` → tabla comparativa.
- `quick_reply_config` (solo el último mensaje) → control de respuesta, dentro
  del propio mensaje del agente: `buttons` (con `multi_select` opcional),
  `distance_slider`, `km_anuales_slider`, `pasajeros_slider`,
  `presupuesto_slider` o `presupuesto_unificado`. Todos responden al agente
  como texto; las opciones se enseñan sin su emoji y se envían tal cual.
- `encargo` (fase 2, en cada mensaje del agente) → chips «Tu encargo» y panel
  lateral en escritorio. Cada dato se puede cambiar: el front envía
  `Quiero cambiar: <etiqueta>` y el agente vuelve a preguntarlo. Sin `encargo`
  (backend anterior) se deduce de `progreso.etiqueta` + la respuesta del
  usuario, sin poder cambiarlo.
- Fichas: `encaje` (0–99) como «Encaje N» (sin él, la puntuación redondeada),
  `razones` como «Por qué encaja contigo», `aviso` como «Ten en cuenta» y
  `datos` como línea de características (sin ellos, `specs`). «Comparar» en
  dos o más fichas envía al agente `Compara el 1 y el 2`.
- `car_comparison`: `veredicto` destacado sobre la tabla, `narrativa` como
  texto del mensaje (si no llega, `content`) y «Me interesa» por coche cuando
  traen `carId`.
- «Me interesa» abre la hoja de contacto: un asesor de CarBlau contacta al
  usuario (`/api/lead/capture` al abrir, `/api/lead/contact` al enviar con
  `canal` whatsapp | llamada | email y `franja` manana | tarde | cualquiera;
  WhatsApp y llamada exigen teléfono, email exige email). La respuesta trae
  `contacto_previsto` («Te escribimos por WhatsApp por la tarde, en menos de
  24 horas.»), que se enseña tal cual en la confirmación. Al cerrar sin enviar
  se avisa «Sin problema, no guardamos tus datos».
- Stream: cada evento `progress` se enseña como un paso; el backend emite uno
  por nodo y sub-pasos dentro de la búsqueda.
- `progreso` (opcional) → barra "Paso X de Y" bajo la cabecera:
  `{ "paso": 3, "total": 7, "etiqueta": "Presupuesto" }`. Se usa el de la
  última pregunta que lo traiga y se oculta al llegar las recomendaciones.

Errores: con 429 (límite de uso) y 413 (mensaje largo) se muestra el `detail`
del backend. El mensaje máximo es de 1.000 caracteres en ambos lados.

## Despliegue (Cloud Run, europe-west1)

Con [`deploy.sh`](deploy.sh), desde un árbol sin cambios pendientes:

```bash
./deploy.sh                      # etiqueta = commit actual
./deploy.sh v3-ux                # etiqueta propia
./deploy.sh --rollback 924fc70   # volver a una imagen ya publicada
NEXT_PUBLIC_API_URL=https://otro-backend ./deploy.sh   # cambiar una variable
```

Comprueba tipos, construye la imagen `linux/amd64` con las variables
`NEXT_PUBLIC_*`, la sube a Artifact Registry y despliega `my-frontend-app` con
la configuración de producción. Pide confirmación antes (`--yes` para omitirla)
y `./deploy.sh --help` muestra todas las opciones.

URL actual: <https://my-frontend-app-1063747381969.europe-west1.run.app>

### Probar antes de publicar (QA)

```bash
./deploy.sh --qa        # revisión SIN tráfico con la etiqueta «qa» en el mismo servicio
./deploy.sh --publicar  # cuando esté probada: el 100 % del tráfico a esa revisión
```

La revisión de QA se prueba en `https://qa---my-frontend-app-…run.app` (el
script imprime la URL) con el backend real; producción sigue sirviendo la
revisión anterior. El backend tiene que admitir esa URL en CORS
(`CORS_ORIGINS_DEFECTO` en `api/main.py`). Para probar en local contra el
backend desplegado basta `npm run dev` (admite `http://localhost:3000`).

Dominio personalizado (pendiente):

```bash
gcloud run domain-mappings create \
  --service=my-frontend-app \
  --domain=app.carblau.com \
  --region=europe-west1
```
