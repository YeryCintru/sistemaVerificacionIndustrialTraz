import express, { Express, Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import dotenv from 'dotenv';

import { Container } from 'typedi';
import { ProductoController } from './controllers/producto.controller';

dotenv.config();

const app: Express = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Registro de rutas mediante Inyección de Dependencias
const productoController = Container.get(ProductoController);
app.use('/api/productos', productoController.getRouter());

export default app;
