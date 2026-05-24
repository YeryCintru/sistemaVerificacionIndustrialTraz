# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Compilar TypeScript y hacer build de Vite
RUN npm run build

# Stage 2: Servir con nginx
FROM nginx:alpine

# Copiar configuración de nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx para Single Page Application
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
