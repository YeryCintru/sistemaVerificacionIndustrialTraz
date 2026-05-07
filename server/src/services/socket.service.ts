import { Service } from 'typedi';
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

@Service()
export class SocketService {
    private io: Server | null = null;

    /**
     * Inicializa el servidor de WebSockets.
     * @param httpServer Servidor HTTP de Express.
     */
    init(httpServer: HttpServer): void {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        console.log('Socket.io inicializado');

        this.io.on('connection', (socket: Socket) => {
            console.log(`Nueva conexión de socket: ${socket.id}`);

            socket.on('disconnect', () => {
                console.log(`Socket desconectado: ${socket.id}`);
            });


            socket.on('ping', () => {
                socket.emit('pong', { message: 'Conexión establecida correctamente' });
            });
        });
    }

    /**
     * Emite un evento a todos los clientes conectados.
     * @param event Nombre del evento.
     * @param data Datos a enviar.
     */
    emit(event: string, data: any): void {
        if (this.io) {
            this.io.emit(event, data);
        } else {
            console.warn('SocketService: No se puede emitir, io no inicializado.');
        }
    }

    /**
     * Devuelve la instancia de Socket.io.
     */
    getIO(): Server | null {
        return this.io;
    }
}
