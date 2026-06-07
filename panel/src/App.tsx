import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { initializeAuth } from './services/api';
import type { OrdenProduccion, Producto } from './services/api';
import { BusquedaOrden } from './pages/BusquedaOrden';
import { Ordenes } from './pages/Ordenes';
import { CrearOrden } from './pages/CrearOrden';
import { DetalleOrden } from './pages/DetalleOrden';
import { Login } from './pages/Login';
import { Inicio } from './pages/Inicio';
import { Productos } from './pages/Productos';
import { CrearProducto } from './pages/CrearProducto';
import { DetalleProducto } from './pages/DetalleProducto';
import { Auditoria } from './pages/Auditoria';
import { Usuarios } from './pages/Usuarios';

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

  const [productoActual, setProductoActual] = React.useState<Producto | null>(null);

  const handleSeleccionarProducto = (producto: Producto) => {
    setProductoActual(producto);
  };

  const handleVolverProducto = () => {
    setProductoActual(null);
  };

  return (
    <Router>
      <Routes>
        {/* Ruta de Login - Página inicial */}
        <Route path="/login" element={<Login />} />

        {/* Ruta de Búsqueda y Detalle - Comparten el estado */}
        <Route path="/ordenes" element={<Ordenes onSeleccionar={handleBuscar} />} />
        <Route path="/crear-orden" element={<CrearOrden />} />
        <Route path="/busqueda" element={<BusquedaOrden onBuscar={handleBuscar} />} />
        <Route path="/detalle" element={ordenActual ? <DetalleOrden orden={ordenActual} onVolver={handleVolver} setOrdenActual={setOrdenActual} /> : <Navigate to="/ordenes" />} />
        <Route path="/productos" element={<Productos onSeleccionar={handleSeleccionarProducto} />} />
        <Route path="/crear-producto" element={<CrearProducto />} />
        <Route
          path="/detalle-producto"
          element={
            productoActual
              ? <DetalleProducto producto={productoActual} onVolver={handleVolverProducto} setProductoActual={setProductoActual} />
              : <Navigate to="/productos" />
          }
        />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/usuarios" element={<Usuarios />} />
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

