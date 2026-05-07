FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies (including sharp/image processing deps)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    python3 \
    make \
    g++ \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --legacy-peer-deps

COPY . .

# Remove ERD generator for build
RUN sed -i '/generator erd {/,/}/d' prisma/schema.prisma

RUN npx prisma generate
RUN npm run build

# --- Production Image ---
FROM node:20-slim

WORKDIR /app

# Create uploads directory
RUN mkdir -p uploads/avatars uploads/mezclas uploads/products

# Install runtime dependencies (chromium for puppeteer + sharp deps)
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    openssl \
    chromium \
    libvips \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Copy only production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tabacosxml.xml ./tabacosxml.xml

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
