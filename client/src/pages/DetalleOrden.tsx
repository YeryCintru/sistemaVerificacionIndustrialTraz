import React, { useEffect, useRef } from 'react';
import { OrdenProduccion } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import { getProducto } from '../services/api';

interface DetalleOrdenProps {
  orden: OrdenProduccion;
  onVolver: () => void;
  setOrdenActual: (orden: OrdenProduccion | null) => void;
}

export function DetalleOrden({ orden, onVolver, setOrdenActual }: DetalleOrdenProps) {
  const navigate = useNavigate();
  const [productoDetalle, setProductoDetalle] = React.useState<any>(null);
  const [showModal, setShowModal] = React.useState(false);

  // Guardamos la cantidad que hay ahora para compararla en el futuro
  const prevCantidadRef = useRef<number>(orden.Cantidad_ordenProd);

  // Reaccionar a cambios externos en la orden
  useEffect(() => {
    // Detectar si la orden se ha cerrado
    if (orden.Estado_ordenProd === 'Cerrada') {
      alert('¡Atención! Esta orden acaba de ser cerrada.');
    }

    // Detectar si ha cambiado la cantidad total, guardando el estado actual antes de volver a renderizarse
    if (prevCantidadRef.current !== undefined && prevCantidadRef.current !== orden.Cantidad_ordenProd) {
      alert(`¡Aviso! La cantidad total de la orden ha cambiado de ${prevCantidadRef.current} a ${orden.Cantidad_ordenProd}`);
    }

    // Usamos ?? 0 por si los valores vienen como undefined desde el servidor
    const completada = orden.CantidadCompletada_ordenProd ?? 0;
    const total = orden.Cantidad_ordenProd ?? 0;

    if (completada >= total && total > 0) {
      alert('¡La orden ha sido completada!');
    }

    // Actualizamos la referencia con el valor actual para la próxima vez
    prevCantidadRef.current = orden.Cantidad_ordenProd;
  }, [orden.Estado_ordenProd, orden.Cantidad_ordenProd, orden.CantidadCompletada_ordenProd, navigate]);

  const handleVerificarPieza = () => {
    // Usamos ?? 0 por si los valores vienen como undefined desde el servidor
    const completada = orden.CantidadCompletada_ordenProd ?? 0;
    const total = orden.Cantidad_ordenProd ?? 0;

    if (orden.Estado_ordenProd === 'Cerrada') {
      alert('Esta orden ya está cerrada. No se pueden verificar más piezas.');
      return;
    }else if (orden.Estado_ordenProd === 'Pendiente') {
      alert('Esta orden aún no ha sido iniciada. Por favor, espere a que el supervisor la ordene antes de verificar piezas.');
      return;
    }else if (completada >= total) {
      alert('¡La orden ya ha sido completada! No se pueden verificar más piezas.');
      return;
    }
    navigate('/verificacion');
  };

  const handleVerProducto = async () => {
    try {
      const prod = await getProducto(orden.Id_producto);
      setProductoDetalle(prod);
      setShowModal(true);
    } catch (error) {
      console.error('Error al obtener detalles del producto:', error);
      alert('No se pudieron obtener los detalles del producto.');
    }
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <button
        onClick={onVolver}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        ← Volver
      </button>

      <div style={{
        display: 'flex',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'flex-start'
      }}>
        {/* Columna Izquierda: Información de la Orden */}
        <div style={{
          flex: 2,
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ marginTop: 0, color: '#333', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            Información de la Orden
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Código de Orden</label>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '500' }}>{orden.Codigo_ordenProd}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Lote</label>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '500' }}>{orden.Lote_ordenProd}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Cantidad Total</label>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '500' }}>{orden.Cantidad_ordenProd}</p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Cantidad Completada</label>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: '500', color: '#28a745' }}>
                {orden.CantidadCompletada_ordenProd || 0}
              </p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Estado</label>
              <p style={{
                margin: '5px 0 0 0',
                fontSize: '16px',
                fontWeight: 'bold',
                color: orden.Estado_ordenProd === 'Cerrada' ? '#dc3545' : '#007bff'
              }}>
                {orden.Estado_ordenProd}
              </p>
            </div>
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Fecha de Inicio</label>
              <p style={{ margin: '5px 0 0 0', fontSize: '16px' }}>
                {orden.FechaInicio_ordenProd ? new Date(orden.FechaInicio_ordenProd).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: 'bold', color: '#666', fontSize: '14px' }}>Comentarios</label>
            <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#555', fontStyle: 'italic' }}>
              {orden.Comentarios_ordenProd || 'Sin comentarios'}
            </p>
          </div>

          <button
            onClick={handleVerificarPieza}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '30px',
              boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)',
              transition: 'transform 0.2s'
            }}
          >
            VERIFICAR LOTE
          </button>
        </div>

        {/* Columna Derecha: Información del Producto */}
        <div style={{
          flex: 1,
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{ marginTop: 0, color: '#333', width: '100%', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            Producto
          </h2>

          <div style={{ margin: '40px 0' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#e9ecef',
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '15px',
              margin: '0 auto'
            }}>
              <span style={{ fontSize: '40px' }}>📦</span>
            </div>
            <h3 style={{ fontSize: '22px', margin: '10px 0', color: '#333' }}>{orden.Codigo_producto}</h3>
          </div>

          <button
            onClick={handleVerProducto}
            style={{
              padding: '12px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '100%',
              fontWeight: '500'
            }}
          >
            Ver detalles de producto
          </button>
        </div>
      </div>

      <BotonLogout />

      {/* Modal de Detalles del Producto */}
      {showModal && productoDetalle && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            position: 'relative',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                border: 'none',
                background: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              &times;
            </button>

            <h2 style={{ marginTop: 0, color: '#333' }}>Detalles del Producto</h2>
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Nombre</label>
                <p style={{ margin: '5px 0', fontSize: '18px' }}>{productoDetalle.Nombre_producto}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Código</label>
                <p style={{ margin: '5px 0', fontSize: '16px' }}>{productoDetalle.Codigo_producto}</p>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Estado</label>
                <p style={{
                  margin: '5px 0',
                  fontSize: '16px',
                  color: productoDetalle.Estado_producto === 'Correcto' ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  {productoDetalle.Estado_producto}
                </p>
              </div>
              {productoDetalle.Verificador_producto && (
                <div>
                  <label style={{ fontWeight: 'bold', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Verificador</label>
                  <p style={{ margin: '5px 0', fontSize: '16px' }}>{productoDetalle.Verificador_producto}</p>
                </div>
              )}
              {productoDetalle.Documentacion_producto && (
                <div>
                  <label style={{ fontWeight: 'bold', color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Documentación</label>
                  <p style={{ margin: '5px 0', fontSize: '14px', color: '#555', lineHeight: '1.4' }}>
                    {productoDetalle.Documentacion_producto}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: '30px',
                width: '100%',
                padding: '12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
