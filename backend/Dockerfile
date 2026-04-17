# ---- Base ----
FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma/

# ---- Dependencies ----
FROM base AS deps
RUN npm ci --legacy-peer-deps

# ---- Build ----
FROM deps AS builder
COPY . .
RUN npx prisma generate
RUN npm run build
RUN ls -la dist/ && echo "Build OK"

# ---- Production ----
FROM node:20-slim AS production
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY prisma ./prisma
COPY package*.json ./

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
