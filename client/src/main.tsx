import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getOrdenPorCodigo, OrdenProduccion, initializeAuth } from './services/api';
import { BusquedaOrden } from './pages/BusquedaOrden';
import { DetalleOrden } from './pages/DetalleOrden';
import { Verificacion } from './pages/Verificacion';
import { Login } from './pages/Login';

// Inicializar autenticación al cargar la app
initializeAuth();

function App() {
  const [ordenActual, setOrdenActual] = React.useState<OrdenProduccion | null>(null);

  const handleBuscar = async (orden: OrdenProduccion) => {
    try {
      setOrdenActual(orden);
    } catch (err) {
      console.error('Error al buscar orden:', err);
      alert('No se encontró la orden. Verifica el código e intenta nuevamente.');
    }
  };

  const handleVolver = () => {
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
