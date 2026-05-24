import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeAuth } from './services/api';
import type { OrdenProduccion } from './services/api';
import { BusquedaOrden } from './pages/BusquedaOrden';
import { Ordenes } from './pages/Ordenes';
import { DetalleOrden } from './pages/DetalleOrden';
import { Verificacion } from './pages/Verificacion';
import { Login } from './pages/Login';
import { Inicio } from './pages/Inicio';

import { useOrderSocket } from './hooks/useOrderSocket';

// Inicializar autenticación al cargar la app
initializeAuth();

function App() {
  // Se guarda el id de la orden que queremos seguir
  const [activeOrderId, setActiveOrderId] = React.useState<number | undefined>();

  // El hook se encarga de todo el tráfico de red para modular 
  const { orden: ordenActual, setOrden: setOrdenActual } = useOrderSocket(activeOrderId);

  const handleBuscar = async (orden: OrdenProduccion) => {
    // Al poner el ID, el Hook se activa y se une a la sala del servidor
    setActiveOrderId(orden.Id_ordenProd);
    setOrdenActual(orden);
  };

  const handleVolver = () => {
    // Al limpiar el ID, el Hook se desactiva y sale de la sala del servidor
    setActiveOrderId(undefined);
    setOrdenActual(null);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta de Login - Página inicial */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Búsqueda y Detalle - Comparten el estado */}
        <Route path="/ordenes" element={<Ordenes onSeleccionar={handleBuscar} />} />
        <Route path="/busqueda" element={<BusquedaOrden onBuscar={handleBuscar} />} />
        <Route path="/detalle" element={ordenActual ? <DetalleOrden orden={ordenActual} onVolver={handleVolver} /> : <Navigate to="/ordenes" />} />
        <Route path="/verificacion" element={ordenActual ? <Verificacion orden={ordenActual} setOrdenActual={setOrdenActual} /> : <Navigate to="/ordenes" />} />
        {/* Página de inicio / dashboard */}
        <Route path="/inicio" element={<Inicio />} />
        {/* Rutas por defecto - Redirigen al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

