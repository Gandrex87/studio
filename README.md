# Firebase Studio
Actualizacion 23 de noviembre

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

1.
docker buildx build --platform linux/amd64 -t my-app .s

2.
docker tag my-app europe-west1-docker.pkg.dev/thecarmentor-mvp2/my-frontend-repo/my-app:latest

3.
docker push europe-west1-docker.pkg.dev/thecarmentor-mvp2/my-frontend-repo/my-app:latest
**Desde aqui**
docker buildx build --platform linux/amd64 \
  -t europe-west1-docker.pkg.dev/thecarmentor-mvp2/my-frontend-repo/my-app:v2-needcarhelp \
  --push .
4.
gcloud run deploy my-frontend-app \
    --image=europe-west1-docker.pkg.dev/thecarmentor-mvp2/my-frontend-repo/my-app:v2-needcarhelp \
    --platform=managed \
    --region=europe-west1 \
    --allow-unauthenticated \
    --cpu-boost \
    --memory=1Gi

## Recomendado por claude para produccion

gcloud run deploy my-frontend-app \
  --image=europe-west1-docker.pkg.dev/thecarmentor-mvp2/my-frontend-repo/my-app:v2-needcarhelp \
  --platform=managed \
  --region=europe-west1 \
  --allow-unauthenticated \
  --port=3000 \
  --cpu=1 \
  --memory=1Gi \
  --min-instances=0 \
  --max-instances=5 \
  --concurrency=80 \
  --timeout=60s \
  --execution-environment=gen2 \
  --labels="environment=production,app=carblau-frontend"

  https://my-frontend-app-1063747381969.europe-west1.run.app
  

## Dominio Personalizado (Recomendado)
bash# 1. Mapear dominio personalizado
gcloud run domain-mappings create \
  --service=my-frontend-app-v3 \
  --domain=app.carblau.com \
  --region=europe-west1