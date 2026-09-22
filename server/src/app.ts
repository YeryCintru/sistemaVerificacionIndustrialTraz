import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import { Container } from 'typedi';
import { ProductoController } from './controllers/producto.controller';
import { OrdenController } from './controllers/orden.controller';
import { OperarioController } from './controllers/operario.controller';
import { AuditController } from './controllers/audit.controller';

dotenv.config();

const app: Express = express();

// Habilitar CORS para permitir peticiones del panel
app.use(cors({
  origin: '*',             // En producción, reemplaza por la URL concreta del panel
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Registro de rutas mediante Inyección de Dependencias
const productoController = Container.get(ProductoController);
app.use('/api/productos', productoController.getRouter());

const ordenController = Container.get(OrdenController);
app.use('/api/ordenesprod', ordenController.getRouter());

const operarioController = Container.get(OperarioController);
app.use('/api/operarios', operarioController.getRouter());

const auditController = Container.get(AuditController);
app.use('/api/audit', auditController.getRouter());

export default app;
