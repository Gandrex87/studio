# # --- Etapa 1: Builder ---
# # Construye la aplicación de Next.js
# FROM node:18-alpine AS builder

# # Establece el directorio de trabajo
# WORKDIR /app

# # Copia los archivos de dependencias y las instala
# COPY package*.json ./
# RUN npm install

# # Copia el resto del código de la aplicación
# COPY . .

# # Construye la aplicación para producción
# # ❗️ IMPORTANTE: No usamos 'npx next export' aquí
# RUN npm run build

# # --- Etapa 2: Runner ---
# # Crea la imagen final y ligera que se ejecutará en Cloud Run
# FROM node:18-alpine

# WORKDIR /app

# # Copia solo los artefactos necesarios de la etapa 'builder'
# # Esto mantiene la imagen final lo más pequeña posible
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/package.json ./package.json

# # Expone el puerto 3000, que es el que Next.js usa por defecto
# EXPOSE 3000

# # El comando para iniciar la aplicación en producción.
# # Next.js automáticamente respeta la variable de entorno PORT que Cloud Run le proporciona.
# CMD ["npm", "start"]

# --- Etapa 1: Builder ---
# Usa la versión LTS actual de Node.js para un mejor rendimiento y seguridad.
FROM node:22-alpine AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias y las instala
COPY package*.json ./
RUN npm ci

# Copia el resto del código de la aplicación
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# URL del backend: se incrusta en el bundle al compilar (opcional;
# sin ella se usa la de producción definida en src/lib/config.ts)
#   docker buildx build --build-arg NEXT_PUBLIC_API_URL=https://... .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Política de privacidad enlazada en el formulario de contacto
# (opcional; por defecto https://carblau.com/politica-de-privacidad)
ARG NEXT_PUBLIC_PRIVACY_URL
ENV NEXT_PUBLIC_PRIVACY_URL=$NEXT_PUBLIC_PRIVACY_URL

# Teléfono de contacto humano del aviso de IA (opcional; hay valor por defecto)
ARG NEXT_PUBLIC_CONTACT_PHONE
ENV NEXT_PUBLIC_CONTACT_PHONE=$NEXT_PUBLIC_CONTACT_PHONE

# Construye la aplicación para producción.
# Next.js detectará automáticamente la configuración 'output: standalone' en next.config.js
RUN npm run build

# --- Etapa 2: Runner ---
# Usa la misma base ligera y actualizada
FROM node:22-alpine AS runner
WORKDIR /app

# Crea un grupo y usuario no-root para ejecutar la aplicación por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia los artefactos de la compilación standalone desde la etapa 'builder'
# Esto es mucho más pequeño que copiar todo el node_modules
# '--chown' asigna la propiedad de los archivos al usuario no-root
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambia al usuario no-root
USER nextjs

# Expone el puerto que usará la aplicación
EXPOSE 3000

# Establece la variable de entorno para el puerto (Cloud Run la sobrescribirá si es necesario)
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# El comando para iniciar el servidor de Next.js en modo standalone.
CMD ["node", "server.js"]
