import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import { crearProducto, codigoProducto } from '../services/api';
import type { CrearProductoPayload, LoginResponse } from '../services/api';

const ROLES_CREAR = ['Admin', 'Supervisor'];
const ESTADOS = ['Correcto', 'Bloqueado', 'Baja'] as const;

export function CrearProducto() {
  const navigate = useNavigate();
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState('');
  const [exito, setExito] = React.useState('');

  const [nombre, setNombre] = React.useState('');
  const [estado, setEstado] = React.useState<string>('Correcto');
  const [verificador, setVerificador] = React.useState('');
  const [documentacion, setDocumentacion] = React.useState('');

  const usuarioRaw = localStorage.getItem('usuario');
  const usuario: LoginResponse | null = usuarioRaw ? JSON.parse(usuarioRaw) : null;
  const puedeCrear = usuario && ROLES_CREAR.includes(usuario.Rol_operario);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!puedeCrear) {
      setError('No tienes permisos para crear productos. Solo Admin y Supervisor.');
      return;
    }

    if (!nombre.trim()) {
      setError('El nombre del producto es obligatorio.');
      return;
    }

    setEnviando(true);
    try {
      const payload: CrearProductoPayload = {
        nombre_producto: nombre.trim(),
        estado_producto: estado,
      };
      if (verificador.trim()) payload.verificador_producto = verificador.trim();
      if (documentacion.trim()) payload.documentacion_producto = documentacion.trim();

      const nuevo = await crearProducto(payload);
      setExito(`Producto creado: ${codigoProducto(nuevo)} — ${nombre.trim()}`);
      setNombre('');
      setEstado('Correcto');
      setVerificador('');
      setDocumentacion('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Error al crear el producto.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={pageWrap}>
      <button onClick={() => navigate('/productos')} style={btnVolver}>
        ← Volver a productos
      </button>

      <div style={card}>
        <h2 style={titulo}>Crear producto</h2>
        <p style={subtitulo}>
          El código se genera automáticamente (formato PROD-N).
        </p>

        {!puedeCrear && (
          <div style={aviso}>Tu rol no puede crear productos. Inicia sesión como Admin o Supervisor.</div>
        )}
        {error && <div style={errorBox}>{error}</div>}
        {exito && <div style={exitoBox}>{exito}</div>}

        <form onSubmit={handleSubmit}>
          <Campo label="Nombre *">
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Válvula de presión V1"
              disabled={enviando || !puedeCrear}
              required
              style={inputStyle}
            />
          </Campo>

          <Campo label="Estado">
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={enviando || !puedeCrear}
              style={inputStyle}
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </Campo>

          <Campo label="Verificador">
            <input
              type="text"
              value={verificador}
              onChange={(e) => setVerificador(e.target.value)}
              placeholder="Nombre del inspector"
              disabled={enviando || !puedeCrear}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Documentación">
            <textarea
              value={documentacion}
              onChange={(e) => setDocumentacion(e.target.value)}
              placeholder="Ficha técnica, notas..."
              disabled={enviando || !puedeCrear}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Campo>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button type="submit" disabled={enviando || !puedeCrear} style={btnGuardar(enviando || !puedeCrear)}>
              {enviando ? 'Creando...' : 'Crear producto'}
            </button>
            <button type="button" onClick={() => navigate('/productos')} disabled={enviando} style={btnCancelar}>
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
