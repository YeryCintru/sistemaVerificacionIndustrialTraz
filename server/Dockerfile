FROM node:20-alpine

# Crear y definir el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar primero el package.json para aprovechar la caché de Docker
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Usamos nodemon (dev) para el desarrollo continuo con volúmenes
CMD ["npm", "run", "dev"]
