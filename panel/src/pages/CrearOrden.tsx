import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import { crearOrden, getProductoPorCodigo, codigoProducto, estadoProducto, idProducto as getIdProducto, nombreProducto } from '../services/api';
import type { CrearOrdenPayload, LoginResponse, Producto } from '../services/api';

const ROLES_CREAR = ['Admin', 'Supervisor'];

export function CrearOrden() {
  const navigate = useNavigate();
  const [codigoProductoBusqueda, setCodigoProductoBusqueda] = React.useState('');
  const [productoSeleccionado, setProductoSeleccionado] = React.useState<Producto | null>(null);
  const [buscandoProducto, setBuscandoProducto] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState('');
  const [exito, setExito] = React.useState('');

  const [idProducto, setIdProducto] = React.useState('');
  const [cantidad, setCantidad] = React.useState('');
  const [lote, setLote] = React.useState('');
  const [comentarios, setComentarios] = React.useState('');

  const usuarioRaw = localStorage.getItem('usuario');
  const usuario: LoginResponse | null = usuarioRaw ? JSON.parse(usuarioRaw) : null;
  const puedeCrear = usuario && ROLES_CREAR.includes(usuario.Rol_operario);

  const handleBuscarProducto = React.useCallback(async () => {
    if (!codigoProductoBusqueda.trim()) {
      setError('Ingresa un código de producto para buscar.');
      return;
    }

    setBuscandoProducto(true);
    setError('');
    try {
      const producto = await getProductoPorCodigo(codigoProductoBusqueda.trim());
      if (producto) {
        setProductoSeleccionado(producto);
        const id = getIdProducto(producto);
        setIdProducto(id != null ? String(id) : '');
      } else {
        setProductoSeleccionado(null);
        setIdProducto('');
        setError(`No se encontró producto con código: ${codigoProductoBusqueda}`);
      }
    } catch {
      setProductoSeleccionado(null);
      setIdProducto('');
      setError('Error al buscar el producto.');
    } finally {
      setBuscandoProducto(false);
    }
  }, [codigoProductoBusqueda]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setExito('');

    if (!puedeCrear) {
      setError('No tienes permisos para crear órdenes. Solo Admin y Supervisor.');
      return;
    }

    if (!productoSeleccionado || !idProducto) {
      setError('Debes buscar y seleccionar un producto válido.');
      return;
    }

    const cantidadNum = Number(cantidad);
    if (!cantidad || cantidadNum < 1) {
      setError('Indica una cantidad válida (mínimo 1).');
      return;
    }

    setEnviando(true);
    try {
      const payload: CrearOrdenPayload = {
        cantidad_ordenProd: cantidadNum,
        id_producto: Number(idProducto),
      };

      if (lote.trim()) payload.lote_ordenProd = lote.trim();
      if (comentarios.trim()) payload.comentarios_ordenProd = comentarios.trim();

      const nuevaOrden = await crearOrden(payload);
      setExito(`Orden creada: ${nuevaOrden.Codigo_ordenProd} (lote ${nuevaOrden.Lote_ordenProd})`);
      setCantidad('');
      setLote('');
      setComentarios('');
      setCodigoProductoBusqueda('');
      setProductoSeleccionado(null);
      setIdProducto('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Error al crear la orden. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      boxSizing: 'border-box',
    }}>
      <button
        onClick={() => navigate('/ordenes')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
        }}
      >
        ← Volver a órdenes
      </button>

      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '8px',
          color: '#333',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px',
        }}>
          Crear orden de producción
        </h2>
        <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
          Los campos de código y lote son opcionales; si no los rellenas, se generan automáticamente.
        </p>

        {!puedeCrear && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeeba',
            color: '#856404',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            Tu rol ({usuario?.Rol_operario ?? 'desconocido'}) no puede crear órdenes.
            Inicia sesión como Admin o Supervisor.
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        {exito && (
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '14px',
          }}>
            {exito}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Campo label="Código de producto *" hint="Escribe el código del producto (ej: PROD-1)">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <input
                type="text"
                placeholder="PROD-1"
                value={codigoProductoBusqueda}
                onChange={(e) => setCodigoProductoBusqueda(e.target.value)}
                disabled={enviando || !puedeCrear || buscandoProducto}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleBuscarProducto}
                disabled={enviando || !puedeCrear || buscandoProducto || !codigoProductoBusqueda.trim()}
                style={{
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  backgroundColor: enviando || !puedeCrear || buscandoProducto ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: enviando || !puedeCrear || buscandoProducto ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {buscandoProducto ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </Campo>

          {productoSeleccionado && (
            <div style={{
              backgroundColor: '#e7f3ff',
              border: '1px solid #b3d9ff',
              color: '#004085',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
            }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>
                Producto: {nombreProducto(productoSeleccionado)}
              </p>
              <p style={{ margin: '0 0 6px 0' }}>
                Código: {codigoProducto(productoSeleccionado)}
              </p>
              <p style={{ margin: 0, fontWeight: 'bold', color: estadoProducto(productoSeleccionado) === 'Correcto' ? '#155724' : '#dc3545' }}>
                Estado: {estadoProducto(productoSeleccionado)}
              </p>
            </div>
          )}

          <Campo label="Cantidad *">
            <input
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 500"
              disabled={enviando || !puedeCrear}
              required
              style={inputStyle}
            />
          </Campo>

          <Campo label="Lote" hint="Formato: L-2026-1. Si está vacío o no es válido, se autogenera.">
            <input
              type="text"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              placeholder="L-2026-1"
              disabled={enviando || !puedeCrear}
              style={inputStyle}
            />
          </Campo>

          <Campo label="Comentarios">
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Notas sobre el lote o la producción..."
              disabled={enviando || !puedeCrear}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </Campo>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
            <button
              type="submit"
              disabled={enviando || !puedeCrear || buscandoProducto || !productoSeleccionado}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: enviando || !puedeCrear || !productoSeleccionado ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: enviando || !puedeCrear || !productoSeleccionado ? 'not-allowed' : 'pointer',
                opacity: enviando ? 0.8 : 1,
              }}
            >
              {enviando ? 'Creando...' : 'Crear orden'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/ordenes')}
              disabled={enviando}
              style={{
                padding: '14px 24px',
                fontSize: '16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <BotonLogout />
    </div>
  );
}

function Campo({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
        {label}
      </label>
      {hint && (
        <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#999' }}>{hint}</p>
      )}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
