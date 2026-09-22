import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdenPorCodigo, OrdenProduccion } from '../services/api';
import { BotonLogout } from '../components/BotonLogout';

interface BusquedaOrdenProps {
  onBuscar: (orden: OrdenProduccion) => void;
}

export function BusquedaOrden({ onBuscar }: BusquedaOrdenProps) {
  const [codigo, setCodigo] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [nombreUsuario, setNombreUsuario] = React.useState('');
  const navigate = useNavigate();

  // Obtener nombre del usuario del localStorage
  React.useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const usuario = JSON.parse(usuarioData);
      setNombreUsuario(usuario.Nombre_operario || 'Usuario');
    }
  }, []);

  const handleBuscar = async () => {
    if (!codigo.trim()) {
      alert('Por favor ingresa un código de orden');
      return;
    }

    setLoading(true);
    try {
      // Llamar a la API
      const orden = await getOrdenPorCodigo(codigo);
      // Llamar el callback para guardar la orden en el estado de App
      onBuscar(orden);
      // Navegar al detalle
      navigate('/detalle');
    } catch (err) {
      console.error('Error al buscar orden:', err);
      alert('No se encontró la orden. Verifica el código e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          marginBottom: '30px',
          fontSize: '18px',
          color: '#333',
          fontWeight: '500'
        }}>
          Bienvenido, <span style={{ color: '#007bff', fontWeight: 'bold' }}>{nombreUsuario}</span>
        </div>
        <h1>Búsqueda de Orden</h1>
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <input
            type="text"
            placeholder="Ingresa el código de orden"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
            style={{
              padding: '10px 15px',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '250px'
            }}
          />
          <button
            onClick={handleBuscar}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>
      <BotonLogout />
    </div>
  );
}
