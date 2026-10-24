#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
# Despliegue del frontend CarBlau en Cloud Run
#
#   ./deploy.sh                 → etiqueta = commit actual (p. ej. 924fc70)
#   ./deploy.sh v3-ux           → etiqueta propia
#   ./deploy.sh --yes           → sin pedir confirmación
#   ./deploy.sh --allow-dirty   → permite cambios sin commitear (desaconsejado)
#
# Variables del bundle (se fijan AL COMPILAR; vacías = valor por defecto del código):
#   NEXT_PUBLIC_API_URL  NEXT_PUBLIC_PRIVACY_URL  NEXT_PUBLIC_CONTACT_PHONE
#   NEXT_PUBLIC_API_URL=https://otro-backend ./deploy.sh
#
# Volver a una versión anterior: ./deploy.sh --rollback <etiqueta>
# ═══════════════════════════════════════════════════════════════════
set -euo pipefail

PROJECT="thecarmentor-mvp2"
REGION="europe-west1"
REPO="my-frontend-repo"
IMAGE_NAME="my-app"
SERVICE="my-frontend-app"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT}/${REPO}/${IMAGE_NAME}"

cd "$(dirname "$0")"

# ── Argumentos ──────────────────────────────────────────────────────
TAG=""
YES=false
ALLOW_DIRTY=false
ROLLBACK=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --yes|-y)      YES=true ;;
    --allow-dirty) ALLOW_DIRTY=true ;;
    --rollback)    ROLLBACK=true ;;
    -h|--help)     sed -n '2,15p' "$0"; exit 0 ;;
    -*)            echo "Opción desconocida: $1" >&2; exit 1 ;;
    *)             TAG="$1" ;;
  esac
  shift
done

paso() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }
aviso() { printf '\033[1;33m⚠ %s\033[0m\n' "$*"; }
error() { printf '\033[1;31m✖ %s\033[0m\n' "$*" >&2; exit 1; }

confirmar() {
  $YES && return 0
  read -r -p "$1 [s/N] " r
  [[ "$r" =~ ^[sSyY]$ ]] || error "Cancelado."
}

# ── Despliegue en Cloud Run (también lo usa --rollback) ─────────────
desplegar() {
  gcloud run deploy "$SERVICE" \
    --project="$PROJECT" \
    --image="${IMAGE}:$1" \
    --platform=managed \
    --region="$REGION" \
    --allow-unauthenticated \
    --port=3000 \
    --cpu=1 \
    --memory=1Gi \
    --min-instances=0 \
    --max-instances=5 \
    --concurrency=80 \
    --timeout=60s \
    --execution-environment=gen2 \
    --labels="environment=production,app=carblau-frontend,version=$(echo "$1" | tr '[:upper:].' '[:lower:]-' | cut -c1-63)"
}

# ── Requisitos ──────────────────────────────────────────────────────
command -v gcloud >/dev/null || error "Falta gcloud."

if $ROLLBACK; then
  [[ -n "$TAG" ]] || error "Indica la etiqueta: ./deploy.sh --rollback <etiqueta>"
  gcloud artifacts docker images describe "${IMAGE}:${TAG}" --project="$PROJECT" >/dev/null 2>&1 \
    || error "No existe la imagen ${IMAGE}:${TAG}"
  confirmar "¿Volver $SERVICE a la imagen :$TAG?"
  paso "Desplegando :$TAG"
  desplegar "$TAG"
  exit 0
fi

command -v docker >/dev/null || error "Falta docker."
docker info >/dev/null 2>&1 || error "Docker no está arrancado."

# ── Código: limpio y con etiqueta ───────────────────────────────────
if [[ -n "$(git status --porcelain)" ]]; then
  $ALLOW_DIRTY || error "Hay cambios sin commitear. Haz commit o usa --allow-dirty."
  aviso "Desplegando con cambios sin commitear: la imagen no corresponderá a ningún commit."
fi

COMMIT="$(git rev-parse --short HEAD)"
if [[ -z "$TAG" ]]; then
  TAG="$COMMIT"
  $ALLOW_DIRTY && [[ -n "$(git status --porcelain)" ]] && TAG="${COMMIT}-dirty"
fi
[[ "$TAG" =~ ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$ ]] || error "Etiqueta no válida para Docker: $TAG"

if gcloud artifacts docker images describe "${IMAGE}:${TAG}" --project="$PROJECT" >/dev/null 2>&1; then
  aviso "La etiqueta :$TAG ya existe y se sobrescribirá (la anterior quedará sin nombre)."
fi

if [[ "$(git rev-parse --abbrev-ref HEAD)" == "master" ]] && \
   git rev-parse --verify -q origin/master >/dev/null && \
   [[ -n "$(git log --oneline origin/master..HEAD)" ]]; then
  aviso "master tiene commits sin subir a GitHub (git push)."
fi

# ── Resumen ─────────────────────────────────────────────────────────
cat <<EOF

  Servicio : $SERVICE ($REGION)
  Imagen   : ${IMAGE}:${TAG}
  Commit   : $COMMIT  $(git log -1 --format=%s)
  API      : ${NEXT_PUBLIC_API_URL:-(por defecto en src/lib/config.ts)}
  Privacidad: ${NEXT_PUBLIC_PRIVACY_URL:-(por defecto en src/lib/config.ts)}
  Teléfono : ${NEXT_PUBLIC_CONTACT_PHONE:-(por defecto en src/lib/config.ts)}
EOF
confirmar "¿Desplegar a producción?"

# ── Comprobaciones previas (rápidas, antes del build de Docker) ─────
paso "Comprobando tipos"
npx --no-install tsc --noEmit

# ── Build y push ────────────────────────────────────────────────────
paso "Construyendo y subiendo la imagen"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet >/dev/null 2>&1 || true
docker buildx build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}" \
  --build-arg NEXT_PUBLIC_PRIVACY_URL="${NEXT_PUBLIC_PRIVACY_URL:-}" \
  --build-arg NEXT_PUBLIC_CONTACT_PHONE="${NEXT_PUBLIC_CONTACT_PHONE:-}" \
  --label "org.opencontainers.image.revision=$(git rev-parse HEAD)" \
  -t "${IMAGE}:${TAG}" \
  --push .

# ── Deploy ──────────────────────────────────────────────────────────
paso "Desplegando en Cloud Run"
desplegar "$TAG"

URL="$(gcloud run services describe "$SERVICE" --project="$PROJECT" --region="$REGION" --format='value(status.url)')"
paso "Listo: $URL  (imagen :$TAG)"
echo "Para volver atrás: ./deploy.sh --rollback <etiqueta-anterior>"
