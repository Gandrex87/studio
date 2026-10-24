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

La URL del backend está en [`src/lib/config.ts`](src/lib/config.ts). Al ser
`NEXT_PUBLIC_*`, se incrusta en el bundle **al compilar**, no al arrancar.
Lo mismo con `NEXT_PUBLIC_PRIVACY_URL`, el enlace a la política de privacidad
del consentimiento en el formulario de contacto (por defecto,
https://carblau.com/politica-de-privacidad).

## Estructura

| Ruta | Qué hay |
| --- | --- |
| `src/app/page.tsx` | Estado del chat, llamadas al backend y streaming |
| `src/components/carblau/` | Componentes del chat: mensajes, fichas de coches, tabla comparativa, sliders y botones de respuesta |
| `src/components/ui/` | Componentes shadcn/ui (no tocar salvo para regenerarlos) |
| `src/lib/config.ts` | URL del backend |

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

- `payload` con `type: "car_recommendation"` → fichas de coches.
- `car_comparison` → tabla comparativa.
- `quick_reply_config` (solo el último mensaje) → control de respuesta:
  `buttons` (con `multi_select` opcional), `distance_slider`,
  `km_anuales_slider`, `pasajeros_slider`, `presupuesto_slider` o
  `presupuesto_unificado`. Todos responden al agente como texto.
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

Dominio personalizado (pendiente):

```bash
gcloud run domain-mappings create \
  --service=my-frontend-app \
  --domain=app.carblau.com \
  --region=europe-west1
```
