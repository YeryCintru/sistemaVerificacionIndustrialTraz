import 'reflect-metadata';
/**
 * Código desarrollado por Yeray Navascués Trincado
 * Grado en Ingeniería Informática
 * Trabajo de Fin de Grado (TFG) - Sistema de Trazabilidad
 * 2026
 * Ver más información en el archivo README.md
 */
import app from './app';
import dotenv from 'dotenv';
import http from 'http';
import { Container } from 'typedi';
import { SocketService } from './services/socket.service';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

// Crear servidor HTTP a partir de la app Express
const httpServer = http.createServer(app);

// Inicializar WebSockets
const socketService = Container.get(SocketService);
socketService.init(httpServer);

/**
 * Escucha en el servidor HTTP (que incluye Express + Socket.io).
 */
httpServer.listen(PORT, (): void => {
    console.log('=====================================');
    console.log('Servidor de Trazabilidad Industrial Iniciado por Yeray Navascués Trincado');
    console.log('=====================================');
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
    console.log('=====================================');
});
