import React from 'react';
import { OrdenProduccion, verificarOrden } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface VerificacionProps {
  orden: OrdenProduccion;
}

export function Verificacion({ orden }: VerificacionProps) {
  const [resultado, setResultado] = React.useState('');
  const [comentarios, setComentarios] = React.useState('');
  const navigate = useNavigate();

  const handleVerificar = async () => {
    try {
      await verificarOrden(orden.Id_ordenProd!, resultado, 1, comentarios);
      alert('Orden verificada correctamente');
    } catch (error) {
      console.error('Error al verificar orden:', error);
      alert('Error al verificar orden');
    }
  };

  const handleVolverDetalle = () => {
    navigate('/detalle');
  };

  return (
    <div style={{
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f5f5f5',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* Cuadro de información arriba */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative'
      }}>
        <button
          onClick={handleVolverDetalle}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Volver
        </button>
        <h2 style={{ marginTop: 0, marginBottom: '15px' }}>Verificación de Orden</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
          <div>
            <span style={{ color: '#666', fontSize: '14px', display: 'block' }}>Código</span>
            <strong style={{ fontSize: '18px' }}>{orden.Codigo_ordenProd}</strong>
          </div>
          <div>
            <span style={{ color: '#666', fontSize: '14px', display: 'block' }}>Lote</span>
            <strong style={{ fontSize: '18px' }}>{orden.Lote_ordenProd}</strong>
          </div>
          <div>
            <span style={{ color: '#666', fontSize: '14px', display: 'block' }}>Producto</span>
            <strong style={{ fontSize: '18px' }}>{orden.Nombre_producto}</strong>
          </div>
          <div>
            <span style={{ color: '#666', fontSize: '14px', display: 'block' }}>Progreso</span>
            <strong style={{ fontSize: '18px' }}>{orden.CantidadCompletada_ordenProd || 0} / {orden.Cantidad_ordenProd}</strong>
          </div>
        </div>
      </div>

      {/* Botones centrales */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h3 style={{ fontSize: '28px', color: '#333', marginBottom: '40px' }}>¿La pieza es correcta?</h3>
        <div style={{ display: 'flex', gap: '40px' }}>
          <button
            onClick={() => { setResultado('Correcto'); handleVerificar(); }}
            style={{
              padding: '30px 80px',
              fontSize: '32px',
              fontWeight: 'bold',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(40, 167, 69, 0.4)'
            }}>
            SÍ
          </button>

          <button
            onClick={() => { setResultado('Incorrecto'); handleVerificar(); }}
            style={{
              padding: '30px 80px',
              fontSize: '32px',
              fontWeight: 'bold',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(220, 53, 69, 0.4)'
            }}>
            NO
          </button>
        </div>
      </div>
    </div>
  );
}
