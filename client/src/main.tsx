import React from 'react';
import ReactDOM from 'react-dom/client';
import { getOrdenPorCodigo, OrdenProduccion } from './services/api';
import { BusquedaOrden } from './pages/BusquedaOrden';
import { DetalleOrden } from './pages/DetalleOrden';

function App() {
  const [ordenActual, setOrdenActual] = React.useState<OrdenProduccion | null>(null);
  const [cargando, setCargando] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleBuscar = async (codigo: string) => {
    setCargando(true);
    setError(null);
    try {
      const orden = await getOrdenPorCodigo(codigo);
      setOrdenActual(orden);
    } catch (err) {
      setError('No se encontró la orden. Verifica el código e intenta nuevamente.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const handleVolver = () => {
    setOrdenActual(null);
    setError(null);
  };

  return (
    <>
      {ordenActual ? (
        <DetalleOrden orden={ordenActual} onVolver={handleVolver} />
      ) : (
        <>
          <BusquedaOrden onBuscar={handleBuscar} />
          {cargando && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)'
            }}>
              <p style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                Cargando...
              </p>
            </div>
          )}
          {error && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              padding: '15px 20px',
              borderRadius: '4px',
              border: '1px solid #f5c6cb'
            }}>
              {error}
            </div>
          )}
        </>
      )}
    </>
  );
}

const root = document.getElementById('root');
if (root) {
  ReactDOM.createRoot(root).render(<App />);
}
