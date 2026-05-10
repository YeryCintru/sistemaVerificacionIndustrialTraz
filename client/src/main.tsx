import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { OrdenProduccion } from './services/api';
import { BusquedaOrden } from './pages/BusquedaOrden';
import { DetalleOrden } from './pages/DetalleOrden';
import { Verificacion } from './pages/Verificacion';
import { Login } from './pages/Login';
import { socket, connectSocket, disconnectSocket } from './services/socket';

function App() {
  const [ordenActual, setOrdenActual] = React.useState<OrdenProduccion | null>(null);

  useEffect(() => {
    // Conectar al servidor de WebSockets al iniciar la app
    connectSocket();

    // Escuchar actualizaciones de la orden actual
    socket.on('ordenActualizada', (nuevaOrden: OrdenProduccion) => {
      console.log('Orden actualizada recibida por socket:', nuevaOrden);
      setOrdenActual(nuevaOrden);
    });

    return () => {
      disconnectSocket();
      socket.off('ordenActualizada');
    };
  }, []);

  const handleBuscar = async (orden: OrdenProduccion) => {
    try {
      setOrdenActual(orden);
      // Unirse a la sala de esta orden en el servidor
      socket.emit('join_order', orden.Id_ordenProd);
    } catch (err) {
      console.error('Error al buscar orden:', err);
      alert('No se encontró la orden. Verifica el código e intenta nuevamente.');
    }
  };

  const handleVolver = () => {
    if (ordenActual) {
      // Salir de la sala de la orden
      socket.emit('leave_order', ordenActual.Id_ordenProd);
    }
    setOrdenActual(null);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta de Login - Página inicial */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Búsqueda y Detalle - Comparten el estado */}
        <Route path="/busqueda" element={<BusquedaOrden onBuscar={handleBuscar} />} />
        <Route path="/detalle" element={ordenActual ? <DetalleOrden orden={ordenActual} onVolver={handleVolver} /> : <Navigate to="/busqueda" />} />
        <Route path="/verificacion" element={ordenActual ? <Verificacion orden={ordenActual} /> : <Navigate to="/busqueda" />} />
        {/* Rutas por defecto - Redirigen al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
