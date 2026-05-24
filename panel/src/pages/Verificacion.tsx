import React, { useEffect, useRef } from 'react';
import { verificarOrden } from '../services/api';
import type { OrdenProduccion } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';

interface VerificacionProps {
  orden: OrdenProduccion;
  setOrdenActual: (orden: OrdenProduccion | null) => void;
}

export function Verificacion({ orden, setOrdenActual }: VerificacionProps) {
  const [resultado, setResultado] = React.useState('');
  const [comentarios, setComentarios] = React.useState('');
  const navigate = useNavigate();
  const prevCantidadRef = useRef<number>(orden.Cantidad_ordenProd);

  // Reaccionamos cuando la orden cambie (gracias al hook global en App.tsx)
  useEffect(() => {
    if (orden.Estado_ordenProd === 'Cerrada') {
      alert('La orden ha sido cerrada por el servidor. Redirigiendo...');
      navigate('/detalle');
    }
    // Detectar si ha cambiado la cantidad total, guardando el estado actual antes de volver a renderizarse
    if (prevCantidadRef.current !== undefined && prevCantidadRef.current !== orden.Cantidad_ordenProd) {
      alert(`¡Aviso! La cantidad total de la orden ha cambiado de ${prevCantidadRef.current} a ${orden.Cantidad_ordenProd}`);
    }

    // ?? 0 por si los valores vienen como undefined desde el servidor
    const completada = orden.CantidadCompletada_ordenProd ?? 0;
    const total = orden.Cantidad_ordenProd ?? 0;

    if (completada >= total && total > 0) {
      alert('¡La orden ha sido completada!');
    }

    // Actualizamos la referencia con el valor actual para la próxima vez
    prevCantidadRef.current = orden.Cantidad_ordenProd;

  }, [orden.Estado_ordenProd, orden.Cantidad_ordenProd, orden.CantidadCompletada_ordenProd, navigate]);

  const handleVerificar = async (res: string) => {
    try {
      setResultado(res);
      await verificarOrden(orden.Id_ordenProd!, res, 1, comentarios);
      alert('Orden verificada correctamente');
    } catch (error: any) {
      console.error('Error al verificar orden:', error);
      const msg = error.response?.data?.error || 'Error al verificar orden';
      alert(msg);
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
            onClick={() => handleVerificar('Correcto')}
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
            onClick={() => handleVerificar('Incorrecto')}
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
      <BotonLogout />
    </div>
  );
}
