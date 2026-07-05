# Frontend Next.js (interface facon NotebookLM). Build multi-stage -> image slim
# basee sur la sortie "standalone" de Next (node server.js, sans node_modules complet).

# --- Dependances ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- Build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# URL publique du backend, appelee depuis le NAVIGATEUR : inlinee au build
# (prefixe NEXT_PUBLIC_). En Docker (ports publies), c'est http://localhost:8000.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000 HOSTNAME=0.0.0.0

# Sortie standalone : serveur minimal + assets statiques + fichiers publics.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
