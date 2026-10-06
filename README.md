# Sistema de Verificación y Trazabilidad Industrial

  

> Trabajo de Fin de Grado · Universidad San Jorge

  


[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Electron](https://img.shields.io/badge/Electron-28-47848F?logo=electron&logoColor=white)](https://www.electronjs.com/) [![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/) [![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/) [![Socket.io](https://img.shields.io/badge/Socket.io-Real%20Time-010101?logo=socket.io&logoColor=white)](https://socket.io/)

  

Sistema cliente-servidor para la gestión, supervisión y trazabilidad de procesos de producción industrial. El proyecto combina un backend API REST, un panel web de administración y una aplicación de escritorio para operarios, permitiendo monitorizar órdenes, verificar piezas y actualizar el estado en tiempo real de la producción.

  

---

  

## ¿Qué hace este proyecto?

  

Este sistema está pensado para una línea de producción donde es necesario:

  

- registrar productos y órdenes de fabricación,

- controlar el estado de cada orden,

- verificar la producción desde terminales de trabajo,

- dar visibilidad al responsable mediante un panel web,

- mantener la trazabilidad completa de cada proceso,

- sincronizar cambios en tiempo real entre cliente y panel.

  

En resumen, combina automatización, control operativo y monitorización industrial en una única solución.

  

---

  

## Funcionalidades principales

  

- 🔐 autenticación de operarios con JWT,

- 🏭 gestión de productos y órdenes de producción,

- 📦 trazabilidad completa de cada ciclo de producción,

- 🖥️ cliente de escritorio para verificación en línea de fabricación,

- 📊 panel web para gestión y auditoría,

- ⚡ sincronización en tiempo real mediante WebSockets,

- 🧾 registro de auditoría de acciones operativas,

- 🗃️ persistencia con MySQL y Docker.

  

---

  

## Arquitectura del sistema

  

```text

┌──────────────────────────────┐

│   Panel Web (React + Vite)  │

│   Supervisión / gestión      │

└──────────────┬──────────────┘

               │ HTTP / REST + WebSockets

┌──────────────▼──────────────┐

│   Backend API (Node.js)     │

│   Express + Socket.io       │

│   JWT + middleware auth     │

└──────────────┬──────────────┘

               │

┌──────────────▼──────────────┐

│   Base de datos MySQL       │

│   Productos / Órdenes       │

│   Operarios / Auditoría     │

└─────────────────────────────┘

               ▲

               │

┌──────────────┴──────────────┐

│ Cliente Desktop (Electron)  │

│ Verificación de producción  │

└─────────────────────────────┘

```

  

---

  
## Stack

Capa | Tecnología | Runtime
--- | --- | ---
Backend | Node.js + Express + TypeScript | API REST / servicios
Frontend web | React + Vite + Axios | Panel administrativo
Escritorio | Electron + React | App local de línea de producción
Comunicación en tiempo real | Socket.io | WebSockets
Autenticación | JWT + bcrypt | Seguridad y sesiones operarias
Persistencia | MySQL | Base de datos relacional
Infraestructura | Docker + Docker Compose | Contenedores y despliegue
Documentación / pruebas | Bruno + Markdown | API testing y docs

---

  

## Estructura del repositorio

  

```text

sistemaVerificacionIndustrialTraz/

├── client/                 # Aplicación desktop Electron

│   ├── src/

│   ├── internal/

│   └── package.json

├── panel/                  # Panel web administrativo

│   ├── src/

│   ├── public/

│   └── package.json

├── server/                 # Backend API + WebSockets

│   ├── src/

│   ├── database/

│   ├── bruno/

│   └── package.json

├── docker-compose.yml      # Orquestación de servicios

├── README.md               # Documentación del proyecto

├── internal/               # Documentación interna y notas del TFG

└── .gitignore

```

  

---

  

## Inicio rápido

  

### Requisitos previos

  

- [Node.js 18+](https://nodejs.org/)

- [Docker](https://www.docker.com/) y Docker Compose

  

### 1. Clonar el repositorio

  

```bash

git clone https://github.com/tu-usuario/sistemaVerificacionIndustrialTraz.git

cd sistemaVerificacionIndustrialTraz

```

  

### 2. Levantar la infraestructura con Docker

  

```bash

docker-compose up -d --build

```

  

Esto inicia:

  

- MySQL en el puerto `3306`

- API backend en `http://localhost:3000`

- Panel web en `http://localhost`

  

> La base de datos se crea automáticamente con el esquema inicial y un usuario administrador por defecto.

  

### 3. Ejecutar cada componente en modo desarrollo

  

#### Backend

```bash

cd server

npm install

npm run dev

```

  

#### Panel web

```bash

cd panel

npm install

npm run dev

```

  

#### Cliente desktop

```bash

cd client

npm install

npm start

```

  

---

  

## Credenciales de prueba

  

El proyecto incluye un usuario administrador de ejemplo para entrar al sistema:

  

- Usuario: `admin`

- Contraseña: `tfg2026`

  

Estas credenciales se cargan en la base de datos al inicializar el esquema con Docker.

  

---

  

## Variables de entorno

  

El backend usa un archivo `.env` dentro de la carpeta `server/` con configuración mínima:

  

```env

PORT=3000

OPERARIO_JWT_SECRET=tu_clave_secreta_operarios

OPERARIO_JWT_EXPIRATION=7d

OPERARIO_SESSION_DAYS=7

```

  

---

  

## Flujo principal de uso

  

1. El administrador crea productos y órdenes desde el panel web.

2. El operario accede desde el cliente de escritorio.

3. Se verifica el proceso/producto asociado a la orden.

4. El estado cambia en la base de datos.

5. Los clientes conectados reciben actualizaciones en tiempo real por WebSockets.

6. El panel refleja los cambios de forma inmediata.

  

---

  

## Documentación adicional

  

El repositorio incluye material de apoyo en la carpeta `internal/`, con documentación y recursos del proyecto:

  

- contexto del TFG,

- planificación,

- tareas,

- endpoints,

- notas internas.

  

También se incluye una colección de pruebas HTTP para Bruno en `server/bruno/`.

  

---

  

## Estado del proyecto

  

Este repositorio está estructurado como una solución completa de trazabilidad industrial con tres capas bien diferenciadas:

  

- backend API,

- frontend web de gestión,

- cliente desktop de producción,

- base de datos y contenedores de despliegue.

  

El enfoque del proyecto combina un flujo de trabajo realista de industria con un caso práctico de aplicación web y escritorio, usando tecnologías actuales y un modelo de sincronización en tiempo real.

  

---

  

## Autor

  

- Yeray Navascués Trincado

- Grado en Ingeniería Informática

- Universidad San Jorge

  

---

  

## Licencia

  

Este proyecto está bajo la licencia ISC.

  

---

  

*Proyecto académico desarrollado como Trabajo de Fin de Grado en sistemas de trazabilidad y verificación industrial.*
