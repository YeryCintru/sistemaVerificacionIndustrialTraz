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

## ✨ Características Principales
- 📡 **Sincronización en tiempo real** mediante WebSockets.
- 🏭 **Control de trazabilidad** de órdenes de producción.
- 📊 **Panel de administración web** intuitivo.
- 🖥️ **Cliente de escritorio nativo** para su uso ágil en las líneas de ensamblaje.

## 🔐 Credenciales de Prueba
Para acceder al panel web o a la aplicación de escritorio al arrancar el proyecto, puedes utilizar el siguiente usuario predeterminado:
- **Usuario:** `admin`
- **Contraseña:** `tfg2026` 

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

> **Nota sobre Base de Datos**: Al levantar Docker por primera vez, la base de datos se creará y se poblará automáticamente con las tablas iniciales y el usuario administrador de prueba gracias al archivo `init_schema.sql`.
> Si en algún momento necesitas **borrar la base de datos** por completo y empezar de cero (por ejemplo, para que vuelva a coger los datos de inicialización), ejecuta:
> ```bash
> docker-compose down -v
> ```


*(Nota: El cliente de escritorio Electron debe ejecutarse siempre de manera local. Sigue el paso 4 de la Opción 2).*

### Opción 2: Ejecución individual para desarrollo local (Opcional)

Si necesitas desarrollar o hacer cambios, es mejor arrancar cada componente individualmente.

> **Importante para el Servidor**: Si vas a levantar el servidor Node.js fuera de Docker, asegúrate de tener un archivo `.env` dentro de la carpeta `/server` con los datos de conexión a la base de datos (por ejemplo, `DB_PASSWORD=root`), ya que de lo contrario fallará la conexión.

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

## 📖 Guía Rápida de Uso

Para probar el flujo principal del sistema rápidamente:

1. **Inicia sesión** en el Panel Web (`http://localhost`) usando las credenciales de prueba (`admin` / `tfg2026`).
2. **Crea un Producto** desde la pestaña correspondiente en el panel.
3. **Crea una Orden de Producción** asignando el producto creado y la cantidad a fabricar.
4. Abre el **Cliente de Escritorio (Electron)** e inicia sesión.
5. Selecciona la orden que acabas de crear y comienza el **proceso de verificación/trazabilidad**.
6. Observa cómo el progreso se refleja en el **Panel Web en tiempo real** gracias a los WebSockets.

## 🧪 Pruebas de API con Bruno

Si deseas probar o explorar los endpoints de la API del servidor manualmente, el proyecto incluye una colección de peticiones lista para usar con **[Bruno](https://www.usebruno.com/)** (una alternativa ligera a Postman). 

Para utilizarla:
1. Descarga e instala Bruno.
2. Abre la aplicación y selecciona **"Open Collection"**.
3. Navega hasta la carpeta `/server/bruno` de este proyecto y ábrela.
4. Ahí tendrás documentadas y listas las peticiones HTTP al backend.

## 📦 Empaquetado del Cliente

Para generar el instalador de la aplicación de escritorio (Cliente Electron) en Windows:
```bash
cd client
npm run package
```
