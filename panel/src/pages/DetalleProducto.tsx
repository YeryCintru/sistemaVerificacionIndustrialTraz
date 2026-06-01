import React from 'react';
import { BotonLogout } from '../components/BotonLogout';
import {
  actualizarProducto,
  codigoProducto,
  estadoProducto,
  getProducto,
  idProducto,
  nombreProducto,
} from '../services/api';
import type { ActualizarProductoPayload, LoginResponse, Producto } from '../services/api';

const ROLES_EDITAR = ['Admin', 'Supervisor'];
const ESTADOS = ['Correcto', 'Bloqueado', 'Baja'] as const;

function colorEstado(estado: string): string {
  if (estado === 'Correcto') return '#28a745';
  if (estado === 'Bloqueado') return '#d97706';
  return '#dc3545';
}

function formatearFecha(fechaIso: string | Date | undefined): string {
  if (!fechaIso) return '-';
  const fecha = fechaIso instanceof Date ? fechaIso : new Date(fechaIso);
  return fecha.toLocaleDateString('es-ES');
}

interface DetalleProductoProps {
  producto: Producto;
  onVolver: () => void;
  setProductoActual: (producto: Producto) => void;
}

export function DetalleProducto({ producto, onVolver, setProductoActual }: DetalleProductoProps) {
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editEstado, setEditEstado] = React.useState(estadoProducto(producto));
  const [editNombre, setEditNombre] = React.useState(nombreProducto(producto));
  const [editVerificador, setEditVerificador] = React.useState(
    producto.Verificador_producto ?? (producto as Producto & { verificador_producto?: string }).verificador_producto ?? ''
  );
  const [editDocumentacion, setEditDocumentacion] = React.useState(
    producto.Documentacion_producto ?? (producto as Producto & { documentacion_producto?: string }).documentacion_producto ?? ''
  );
  const [guardando, setGuardando] = React.useState(false);
  const [errorEditar, setErrorEditar] = React.useState('');

  const usuarioRaw = localStorage.getItem('usuario');
  const usuario: LoginResponse | null = usuarioRaw ? JSON.parse(usuarioRaw) : null;
  const puedeEditar = usuario && ROLES_EDITAR.includes(usuario.Rol_operario);

  const pid = idProducto(producto);
  const verificador = producto.Verificador_producto ?? (producto as Producto & { verificador_producto?: string }).verificador_producto;
  const documentacion = producto.Documentacion_producto ?? (producto as Producto & { documentacion_producto?: string }).documentacion_producto;
  const fechaCreacion = producto.FechaCreacion_producto ?? (producto as Producto & { fechaCreacion_producto?: string }).fechaCreacion_producto;
  const estado = estadoProducto(producto);

  React.useEffect(() => {
    if (!pid) return;
    let cancelado = false;
    getProducto(pid)
      .then((data) => { if (!cancelado) setProductoActual(data); })
      .catch(() => { /* mantener datos de la lista */ });
    return () => { cancelado = true; };
  }, [pid, setProductoActual]);

  const abrirEditar = () => {
    setEditEstado(estadoProducto(producto));
    setEditNombre(nombreProducto(producto));
    setEditVerificador(verificador ?? '');
    setEditDocumentacion(documentacion ?? '');
    setErrorEditar('');
    setShowEditModal(true);
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorEditar('');

    if (!puedeEditar) {
      setErrorEditar('No tienes permisos para editar productos.');
      return;
    }
    if (!pid) {
      setErrorEditar('Producto sin identificador válido.');
      return;
    }
    if (!editNombre.trim()) {
      setErrorEditar('El nombre no puede estar vacío.');
      return;
    }

    const payload: ActualizarProductoPayload = {};
    if (editEstado !== estadoProducto(producto)) payload.estado_producto = editEstado;
    if (editNombre.trim() !== nombreProducto(producto)) payload.nombre_producto = editNombre.trim();
    const verifActual = verificador ?? '';
    if (editVerificador.trim() !== verifActual) payload.verificador_producto = editVerificador.trim() || undefined;
    const docActual = documentacion ?? '';
    if (editDocumentacion.trim() !== docActual) payload.documentacion_producto = editDocumentacion.trim() || undefined;

    if (Object.keys(payload).length === 0) {
      setErrorEditar('No hay cambios que guardar.');
      return;
    }

    setGuardando(true);
    try {
      const actualizado = await actualizarProducto(pid, payload);
      setProductoActual(actualizado);
      setShowEditModal(false);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setErrorEditar(axiosErr.response?.data?.error || 'Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={pageWrap}>
      <button onClick={onVolver} style={btnVolver}>← Volver</button>

      <div style={card}>
        <div style={headerRow}>
          <h2 style={{ margin: 0, color: '#333' }}>Detalle del producto</h2>
          {puedeEditar && (
            <button onClick={abrirEditar} style={btnEditar}>Editar</button>
          )}
        </div>

        <div style={grid}>
          <CampoDetalle label="Código" value={codigoProducto(producto)} />
          <CampoDetalle label="Nombre" value={nombreProducto(producto)} />
          <CampoDetalle
            label="Estado"
            value={
              <span style={{ fontWeight: 'bold', color: colorEstado(estado) }}>{estado}</span>
            }
          />
          <CampoDetalle label="Verificador" value={verificador || 'Sin asignar'} />
          <CampoDetalle label="Fecha de creación" value={formatearFecha(fechaCreacion)} />
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={labelDetalle}>Documentación</label>
          <p style={{ margin: '5px 0 0 0', fontSize: '16px', color: '#555', lineHeight: 1.5, fontStyle: documentacion ? 'normal' : 'italic' }}>
            {documentacion || 'Sin documentación'}
          </p>
        </div>
      </div>

      <BotonLogout />

      {showEditModal && (
        <div style={overlay}>
          <div style={modal}>
            <button type="button" onClick={() => setShowEditModal(false)} disabled={guardando} style={btnCerrar}>&times;</button>
            <h2 style={{ marginTop: 0, color: '#333' }}>Editar producto</h2>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
              {codigoProducto(producto)}
            </p>
            {errorEditar && <div style={errorBox}>{errorEditar}</div>}
            <form onSubmit={handleGuardar}>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelForm}>Nombre</label>
                <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} disabled={guardando} style={inputForm} />
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelForm}>Estado</label>
                <select value={editEstado} onChange={(e) => setEditEstado(e.target.value)} disabled={guardando} style={inputForm}>
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '18px' }}>
                <label style={labelForm}>Verificador</label>
                <input type="text" value={editVerificador} onChange={(e) => setEditVerificador(e.target.value)} disabled={guardando} style={inputForm} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelForm}>Documentación</label>
                <textarea value={editDocumentacion} onChange={(e) => setEditDocumentacion(e.target.value)} disabled={guardando} rows={3} style={{ ...inputForm, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={guardando} style={btnGuardar}>{guardando ? 'Guardando...' : 'Guardar'}</button>
                <button type="button" onClick={() => setShowEditModal(false)} disabled={guardando} style={btnCancelarModal}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CampoDetalle({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <label style={labelDetalle}>{label}</label>
      <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 500, color: '#333' }}>{value}</p>
    </div>
  );
}

const pageWrap: React.CSSProperties = {
  padding: '20px',
  fontFamily: 'Segoe UI, sans-serif',
  backgroundColor: '#f5f5f5',
  minHeight: '100vh',
};

const card: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '30px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

const headerRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  borderBottom: '2px solid #eee',
  paddingBottom: '10px',
  marginBottom: '20px',
};

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
};

const labelDetalle: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#666',
  fontSize: '14px',
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

const btnEditar: React.CSSProperties = {
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: 'bold',
  backgroundColor: '#ffc107',
  color: '#333',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const overlay: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 10000,
};

const modal: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: '32px',
  maxWidth: '480px',
  width: '90%',
  position: 'relative',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
};

const btnCerrar: React.CSSProperties = {
  position: 'absolute',
  top: '15px',
  right: '15px',
  border: 'none',
  background: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666',
};

const labelForm: React.CSSProperties = {
  display: 'block',
  fontWeight: 'bold',
  color: '#666',
  fontSize: '14px',
  marginBottom: '6px',
};

const inputForm: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
};

const errorBox: React.CSSProperties = {
  backgroundColor: '#f8d7da',
  border: '1px solid #f5c6cb',
  color: '#721c24',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '16px',
  fontSize: '14px',
};

const btnGuardar: React.CSSProperties = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
};

const btnCancelarModal: React.CSSProperties = {
  padding: '12px 20px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
};
