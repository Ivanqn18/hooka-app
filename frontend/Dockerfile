FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

# Leverage cache for dependencies
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# --- Production Image (Nginx) ---
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
