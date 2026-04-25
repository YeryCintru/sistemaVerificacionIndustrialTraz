import React from 'react';
import { OrdenProduccion } from '../services/api';

interface DetalleOrdenProps {
  orden: OrdenProduccion;
  onVolver: () => void;
}

export function DetalleOrden({ orden, onVolver }: DetalleOrdenProps) {
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
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '30px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1>Detalles de la Orden de Producción</h1>

        <div style={{ marginTop: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Código de Orden:
            </label>
            <p style={{ margin: 0, color: '#555' }}>{orden.Codigo_ordenProd}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Lote:
            </label>
            <p style={{ margin: 0, color: '#555' }}>{orden.Lote_ordenProd}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Cantidad:
            </label>
            <p style={{ margin: 0, color: '#555' }}>{orden.Cantidad_ordenProd}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Cantidad Completada:
            </label>
            <p style={{ margin: 0, color: '#555' }}>{orden.CantidadCompletada_ordenProd || '-'}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Producto:
            </label>
            <p style={{ margin: 0, color: '#555' }}>{orden.Nombre_producto}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Estado:
            </label>
            <p style={{ margin: 0, color: '#555' }}>{orden.Estado_ordenProd}</p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Fecha de Inicio:
            </label>
            <p style={{ margin: 0, color: '#555' }}>
              {orden.FechaInicio_ordenProd ? new Date(orden.FechaInicio_ordenProd).toLocaleDateString() : '-'}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Fecha de Cierre:
            </label>
            <p style={{ margin: 0, color: '#555' }}>
              {orden.FechaCierre_ordenProd ? new Date(orden.FechaCierre_ordenProd).toLocaleDateString() : '-'}
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              Comentarios:
            </label>
            <p style={{ margin: 0, color: '#555' }}>{orden.Comentarios_ordenProd || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
