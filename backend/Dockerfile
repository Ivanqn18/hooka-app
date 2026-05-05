FROM node:24-bookworm AS builder

WORKDIR /app

# Instalar dependencias necesarias para Prisma y dependencias del sistema (para puppeteer si lo usas)
RUN apt-get update -y && apt-get install -y openssl libnss3 libnspr4 libgbm1 libasound2

COPY package*.json ./
COPY prisma ./prisma/

# Instalar usando legacy-peer-deps por el conflicto de puppeteer
RUN npm ci --legacy-peer-deps

COPY . .

RUN npx prisma generate

RUN npm run build

# --- Imagen de Producción ---
FROM node:24-bookworm

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl libnss3 libnspr4 libgbm1 libasound2 && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
