import React from 'react';
import { useNavigate } from 'react-router-dom';

export function BotonLogout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Elimina la información del usuario del localStorage
    localStorage.removeItem('usuario');
    // Redirige a la pantalla de inicio de sesión
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
        transition: 'background-color 0.2s'
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#5a6268')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6c757d')}
    >
      Cerrar Sesión
    </button>
  );
}
