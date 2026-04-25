import React from 'react';

interface BusquedaOrdenProps {
  onBuscar: (codigo: string) => void;
}

export function BusquedaOrden({ onBuscar }: BusquedaOrdenProps) {
  const [codigo, setCodigo] = React.useState('');

  const handleBuscar = async () => {
    if (codigo.trim()) {
      onBuscar(codigo);
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
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
