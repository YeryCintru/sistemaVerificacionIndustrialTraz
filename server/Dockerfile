FROM node:18-alpine

# Crear y definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar primero el package.json para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar TypeScript antes de arrancar
RUN npm run build

# Exponer el puerto
EXPOSE 3000

# Ejecutar el servidor compilado
CMD ["npm", "start"]
