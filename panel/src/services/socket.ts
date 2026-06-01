import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket']
});

// Helper para conectar
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

// Helper para desconectar
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
