# Sistema de Verificación y Trazabilidad Industrial (TFG)

Sistema cliente-servidor de verificación y trazabilidad para producción industrial.
Universidad de San Jorge
Grado en Ingeniería Informática
Yeray Navascués Trincado
17/06/2026

Este repositorio contiene los siguientes componentes principales:

1. **Servidor (Backend API)**: API RESTful construida con Node.js, Express y MySQL.
2. **Panel (Frontend Web)**: Panel de control web construido con React y Vite para la gestión y visualización de datos de trazabilidad.
3. **Cliente (App de Escritorio)**: Aplicación nativa de escritorio construida con Electron y React para su uso en la línea de producción.
4. **Base de Datos**: MySQL, gestionada y desplegada a través de Docker.

## 🚀 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión recomendada 18+)
- [Docker y Docker Compose](https://www.docker.com/) (para ejecutar la base de datos y servicios en contenedores)

## 🛠️ Cómo arrancar el proyecto

Existen tres formas principales de arrancar el sistema: usando Docker para todos los servicios, ejecutándolos individualmente en modo desarrollo o híbrido entre los dos. Yo recomiendo de la forma que he desarrollado yo: la primera y tercera opción.

### Opción 1: Despliegue con Docker (Recomendada)

En la raíz del proyecto, puedes arrancar la base de datos, el servidor API y el panel web simultáneamente usando Docker Compose:

```bash
docker-compose up -d --build
```

Esto levantará los siguientes contenedores:
- **db**: Base de datos MySQL (puerto `3306`).
- **api**: Servidor Node.js (puerto `3000`).
- **panel**: Panel web (puerto `80`).

*(Nota: El cliente de escritorio Electron debe ejecutarse siempre de manera local. Sigue el paso 4 de la Opción 2).*

### Opción 2: Ejecución individual para desarrollo local (Opcional)

Si necesitas desarrollar o hacer cambios, es mejor arrancar cada componente individualmente.

#### 1. Base de Datos
Puedes levantar solo la base de datos usando Docker:
```bash
docker-compose up db -d
```

#### 2. Servidor (Backend)
Abre una terminal en la carpeta `/server`:
```bash
cd server
npm install
npm run dev
```

#### 3. Panel Web
Abre una nueva terminal en la carpeta `/panel`:
```bash
cd panel
npm install
npm run dev
```

#### 4. Cliente de Escritorio (Electron)
Abre una nueva terminal en la carpeta `/client`:
```bash
cd client
npm install
npm start
```

### Opción 3: Despliegue parcial (Recomendada)
Yo personalmente he estado trabajando de forma híbrida:
- Levanto siempre el backend (servidor) con la base de datos en el docker.
- El panel aparte como explicado en la opción anterior para ver cambios en vivo.
- El cliente aparte por supuesto también.

(No he levantado nunca el servidor de forma individual)

## 📦 Empaquetado del Cliente

Para generar el instalador de la aplicación de escritorio (Cliente Electron) en Windows:
```bash
cd client
npm run package
```
