import { useState, useEffect } from 'react';
import { socket, connectSocket } from '../services/socket';
import { OrdenProduccion } from '../services/api';

/**
 * Hook para sincronizar una orden vía WebSockets.
 * Gestiona la conexión, la sala y las actualizaciones en tiempo real.
 */
export function useOrderSocket(orderId?: number) {
  const [orden, setOrden] = useState<OrdenProduccion | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    // Nos aseguramos de estar conectados al servidor
    connectSocket();

    const onConnect = () => {
      setIsConnected(true);
      // Si tenemos un ID de orden, nos unimos a su sala privada en el servidor
      if (orderId) {
        socket.emit('join_order', orderId);
      }
    };

    const onDisconnect = () => setIsConnected(false);

    // Función que se ejecuta cuando el servidor manda una orden actualizada
    const handleUpdate = (data: OrdenProduccion) => {
      console.log('[Socket] Datos recibidos:', data);
      setOrden(data);
    };

    // Suscribirse a los eventos del servidor
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('ordenActualizada', handleUpdate);
    socket.on('estadoOrdenActualizado', handleUpdate);
    socket.on('cantidadOrdenCambiada', handleUpdate);
    socket.on('ordenCompletada', handleUpdate);

    // Si ya estábamos conectados forzamos el 'join'
    if (socket.connected) onConnect();

    // Limpieza automática al cerrar la página o cambiar de orden
    return () => {
      if (orderId) {
        socket.emit('leave_order', orderId);
      }
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('ordenActualizada', handleUpdate);
      socket.off('estadoOrdenActualizado', handleUpdate);
      socket.off('cantidadOrdenCambiada', handleUpdate);
      socket.off('ordenCompletada', handleUpdate);
    };
  }, [orderId]); // Si el orderId cambia, se reinicia este efecto

  return { orden, setOrden, isConnected };
}
