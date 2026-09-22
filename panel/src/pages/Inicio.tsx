import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import type { LoginResponse } from '../services/api';

const navItems = [
  { id: 'btn-ordenes', label: '📄 Órdenes de Producción', route: '/ordenes' },
  { id: 'btn-producto', label: '📦 Producto', route: '/productos' },
  { id: 'btn-auditoria', label: '🔍 Auditoría', route: '/auditoria' },
  { id: 'btn-operario', label: '👤 Operario', route: '/usuarios' },
];

export function Inicio() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = React.useState('Usuario');

  React.useEffect(() => {
    const usuarioData = localStorage.getItem('usuario');
    if (usuarioData) {
      const usuario: LoginResponse = JSON.parse(usuarioData);
      setNombreUsuario(usuario.Nombre_operario || 'Usuario');
    }
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{
          marginBottom: '30px',
          fontSize: '18px',
          color: '#333',
          fontWeight: '500',
        }}>
          Bienvenido, <span style={{ color: '#007bff', fontWeight: 'bold' }}>{nombreUsuario}</span>
        </div>

        <h1 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '22px' }}>Menú principal</h1>
        <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
          Selecciona una sección
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={item.id}
              onClick={() => navigate(item.route)}
              style={{
                padding: '12px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <BotonLogout />
    </div>
  );
}
