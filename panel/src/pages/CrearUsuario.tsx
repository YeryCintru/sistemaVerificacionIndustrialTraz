import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import { crearOperario } from '../services/api';
import type { CrearOperarioPayload, LoginResponse } from '../services/api';

const ROLES_OPERARIO = ['Admin', 'Operario', 'Supervisor'] as const;

export function CrearUsuario() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState('');
  const [exito, setExito] = React.useState('');

  const [nombre, setNombre] = React.useState('');
  const [clave, setClave] = React.useState('');
  const [rol, setRol] = React.useState<string>('Operario');

  const usuarioRaw = localStorage.getItem('usuario');
  const usuario: LoginResponse | null = usuarioRaw ? JSON.parse(usuarioRaw) : null;
  const puedeCrear = usuario && usuario.Rol_operario === 'Admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!puedeCrear) {
      setError('No tienes permisos para crear usuarios. Solo Admin.');
      return;
    }

    if (!nombre.trim() || !clave.trim()) {
      setError('El nombre y la contraseña son obligatorios.');
      return;
    }

    setEnviando(true);
    try {
      const payload: CrearOperarioPayload = {
        Nombre_operario: nombre.trim(),
        Clave_operario: clave.trim(),
        Rol_operario: rol,
      };

      const nuevo = await crearOperario(payload);
      setExito(`Usuario creado correctamente: ${nuevo.Nombre_operario}`);
      setNombre('');
      setClave('');
      setRol('Operario');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Error al crear el usuario.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={pageWrap}>
      <button onClick={() => navigate('/usuarios')} style={btnVolver}>
        ← Volver a usuarios
      </button>

      <div style={card}>
        <h2 style={titulo}>Crear usuario</h2>
        <p style={subtitulo}>
          Registra un nuevo operario, administrador o supervisor.
        </p>

        {!puedeCrear && (
          <div style={aviso}>Tu rol no puede crear usuarios. Inicia sesión como Admin.</div>
        )}
        {error && <div style={errorBox}>{error}</div>}
        {exito && <div style={exitoBox}>{exito}</div>}

        <form onSubmit={handleSubmit}>
          <Campo label="Nombre de usuario *">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: jsmith"
              disabled={enviando || !puedeCrear}
              required
              style={inputStyle}
            />
          </Campo>

          <Campo label="Contraseña *">
            <input
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Clave segura"
              disabled={enviando || !puedeCrear}
              required
              style={inputStyle}
            />
          </Campo>

          <Campo label="Rol *">
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              disabled={enviando || !puedeCrear}
              style={inputStyle}
            >
              {ROLES_OPERARIO.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Campo>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button type="submit" disabled={enviando || !puedeCrear} style={btnGuardar(enviando || !puedeCrear)}>
              {enviando ? 'Creando...' : 'Crear usuario'}
            </button>
            <button type="button" onClick={() => navigate('/usuarios')} disabled={enviando} style={btnCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <BotonLogout />
    </div>
  );
}

function Campo({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
        {label}
      </label>
      {hint && <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#999' }}>{hint}</p>}
      {children}
    </div>
  );
}

const pageWrap: React.CSSProperties = {
  padding: '20px',
  fontFamily: 'Segoe UI, sans-serif',
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
  boxSizing: 'border-box',
};

const card: React.CSSProperties = {
  maxWidth: '700px',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '30px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

const titulo: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '8px',
  color: '#333',
  borderBottom: '2px solid #eee',
  paddingBottom: '10px',
};

const subtitulo: React.CSSProperties = { margin: '0 0 24px 0', color: '#666', fontSize: '14px' };

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const btnVolver: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '16px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  marginBottom: '20px',
};

const aviso: React.CSSProperties = {
  backgroundColor: '#fff3cd',
  border: '1px solid #ffeeba',
  color: '#856404',
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  fontSize: '14px',
};

const errorBox: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  color: '#721c24',
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  fontSize: '14px',
};

const exitoBox: React.CSSProperties = {
  backgroundColor: '#d4edda',
  border: '1px solid #c3e6cb',
  color: '#155724',
  padding: '12px',
  borderRadius: '4px',
  marginBottom: '20px',
  fontSize: '14px',
};

const btnCancelar: React.CSSProperties = {
  padding: '14px 24px',
  fontSize: '16px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '500',
};

function btnGuardar(disabled: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: disabled ? '#6c757d' : '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.8 : 1,
  };
}
