import React from 'react';
import { OrdenProduccion } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import { getProducto } from '../services/api';

interface DetalleOrdenProps {
  orden: OrdenProduccion;
  onVolver: () => void;
}

export function DetalleOrden({ orden, onVolver }: DetalleOrdenProps) {
  const navigate = useNavigate();

  const handleVerificarPieza = () => {
    navigate('/verificacion');
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
            <h3 style={{ fontSize: '22px', margin: '10px 0', color: '#333' }}>{orden.Nombre_producto}</h3>
            <p style={{ color: '#666' }}>ID Producto: {orden.Id_producto}</p>
          </div>

          <button
            onClick={() => getProducto(orden.Id_producto)}
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
    </div>
  );
}
