import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import {
  codigoProducto,
  estadoProducto,
  getProductosPaginated,
  idProducto,
  nombreProducto,
} from '../services/api';
import type { Producto } from '../services/api';

const PAGE_SIZE = 20;
const ESTADOS_PRODUCTO = ['Correcto', 'Bloqueado', 'Baja'] as const;
type EstadoFiltro = '' | (typeof ESTADOS_PRODUCTO)[number];

function formatearFecha(fechaIso: string | Date | undefined): string {
  if (!fechaIso) return '-';
  const fecha = fechaIso instanceof Date ? fechaIso : new Date(fechaIso);
  return fecha.toLocaleDateString('es-ES');
}

function colorEstadoProducto(estado: string): string {
  if (estado === 'Correcto') return '#28a745';
  if (estado === 'Bloqueado') return '#d97706';
  return '#dc3545';
}

interface ProductosProps {
  onSeleccionar: (producto: Producto) => void;
}

export function Productos({ onSeleccionar }: ProductosProps) {
  const navigate = useNavigate();
  const [productos, setProductos] = React.useState<Producto[]>([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalPaginas, setTotalPaginas] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [filtroCodigo, setFiltroCodigo] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState<EstadoFiltro>('');
  const [filtroFechaCreacion, setFiltroFechaCreacion] = React.useState('');
  const [paginaActual, setPaginaActual] = React.useState(1);
  const [filtrosAplicados, setFiltrosAplicados] = React.useState({
    codigo: '',
    estado: '',
    fecha: '',
  });

  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getProductosPaginated({
          page: paginaActual,
          limit: PAGE_SIZE,
          codigo_producto: filtrosAplicados.codigo || undefined,
          estado_producto: filtrosAplicados.estado || undefined,
          fechaCreacion_producto: filtrosAplicados.fecha || undefined,
        });
        if (!cancelado) {
          setProductos(response.data);
          setTotalItems(response.totalItems);
          setTotalPaginas(Math.max(1, response.totalPages));
        }
      } catch {
        if (!cancelado) setError('No se pudieron cargar los productos.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => { cancelado = true; };
  }, [paginaActual, filtrosAplicados]);

  const handleBuscar = () => {
    setFiltrosAplicados({
      codigo: filtroCodigo,
      estado: filtroEstado,
      fecha: filtroFechaCreacion,
    });
    setPaginaActual(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltroCodigo('');
    setFiltroEstado('');
    setFiltroFechaCreacion('');
    setFiltrosAplicados({
      codigo: '',
      estado: '',
      fecha: '',
    });
    setPaginaActual(1);
  };

  const handleVer = (producto: Producto) => {
    onSeleccionar(producto);
    navigate('/detalle-producto');
  };

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  const paginasVisibles = React.useMemo(() => {
    const maxVisibles = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisibles / 2));
    const fin = Math.min(totalPaginas, inicio + maxVisibles - 1);
    inicio = Math.max(1, fin - maxVisibles + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }, [paginaActual, totalPaginas]);

  const hayFiltrosActivos = filtroCodigo || filtroEstado || filtroFechaCreacion;
  const totalFormateado = totalItems.toLocaleString('es-ES');
  const rangoInicio = totalItems === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1;
  const rangoFin = totalItems === 0 ? 0 : Math.min((paginaActual - 1) * PAGE_SIZE + productos.length, totalItems);

  return (
    <div style={pageWrap}>
      <button onClick={() => navigate('/inicio')} style={btnVolver}>
        ← Volver al menú
      </button>

      <div style={card}>
        <div style={headerRow}>
          <h2 style={{ margin: 0, color: '#333' }}>Productos</h2>
          <button onClick={() => navigate('/crear-producto')} style={btnCrear}>
            + Crear producto
          </button>
        </div>

        <div style={filtrosBox}>
          <div style={{ flex: '1 1 200px' }}>
            <label style={labelStyle}>Código</label>
            <input
              type="text"
              placeholder="Ej: PROD-1"
              value={filtroCodigo}
              onChange={(e) => setFiltroCodigo(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 1 160px' }}>
            <label style={labelStyle}>Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
              style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="">Todos</option>
              {ESTADOS_PRODUCTO.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 1 180px' }}>
            <label style={labelStyle}>Fecha creación</label>
            <input
              type="date"
              value={filtroFechaCreacion}
              onChange={(e) => setFiltroFechaCreacion(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button type="button" onClick={handleBuscar} style={btnBuscar}>Buscar</button>
          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={handleLimpiarFiltros}
              style={{ ...btnLimpiar, alignSelf: 'flex-end' }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {loading ? (
          <p style={msgCenter}>Cargando productos...</p>
        ) : error ? (
          <p style={{ ...msgCenter, color: '#dc3545' }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Verificador</th>
                  <th style={thStyle}>Fecha creación</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                      No hay productos registrados.
                    </td>
                  </tr>
                ) : (
                  productos.map((p) => {
                    const estado = estadoProducto(p);
                    const verificador = p.Verificador_producto ?? (p as Producto & { verificador_producto?: string }).verificador_producto;
                    const fecha = p.FechaCreacion_producto ?? (p as Producto & { fechaCreacion_producto?: string }).fechaCreacion_producto;
                    return (
                      <tr key={idProducto(p) ?? codigoProducto(p)} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tdStyle}>{codigoProducto(p)}</td>
                        <td style={tdStyle}>{nombreProducto(p)}</td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 'bold', color: colorEstadoProducto(estado) }}>
                            {estado}
                          </span>
                        </td>
                        <td style={tdStyle}>{verificador || '-'}</td>
                        <td style={tdStyle}>{formatearFecha(fecha)}</td>
                        <td style={tdStyle}>
                          <button onClick={() => handleVer(p)} style={btnVer}>Ver</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div style={paginadorWrap}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Mostrando {rangoInicio}-{rangoFin} de {totalFormateado} registros totales
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => irAPagina(paginaActual - 1)} disabled={paginaActual <= 1} style={paginadorBtnStyle(paginaActual <= 1)}>
                Anterior
              </button>
              {paginasVisibles.map((pagina) => (
                <button
                  key={pagina}
                  onClick={() => irAPagina(pagina)}
                  style={{
                    ...paginadorBtnStyle(false),
                    backgroundColor: pagina === paginaActual ? '#007bff' : 'white',
                    color: pagina === paginaActual ? 'white' : '#333',
                    border: pagina === paginaActual ? '1px solid #007bff' : '1px solid #ccc',
                    minWidth: '36px',
                  }}
                >
                  {pagina}
                </button>
              ))}
              <button onClick={() => irAPagina(paginaActual + 1)} disabled={paginaActual >= totalPaginas} style={paginadorBtnStyle(paginaActual >= totalPaginas)}>
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <BotonLogout />
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
  maxWidth: '1200px',
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
  marginBottom: '24px',
  borderBottom: '2px solid #eee',
  paddingBottom: '10px',
};

const filtrosBox: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  alignItems: 'flex-end',
  marginBottom: '24px',
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  border: '1px solid #eee',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 'bold',
  color: '#666',
  fontSize: '14px',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '14px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box',
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

const btnCrear: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 'bold',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const btnBuscar: React.CSSProperties = {
  padding: '10px 24px',
  fontSize: '14px',
  fontWeight: 'bold',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  alignSelf: 'flex-end',
};

const btnLimpiar: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '14px',
  backgroundColor: '#6c757d',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '500',
};

const btnVer: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: '13px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: '500',
};

const msgCenter: React.CSSProperties = { textAlign: 'center', color: '#666', padding: '40px 0' };

const paginadorWrap: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '16px',
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: '1px solid #eee',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 14px',
  fontWeight: 'bold',
  color: '#555',
  fontSize: '13px',
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 14px',
  color: '#333',
  verticalAlign: 'middle',
};

function paginadorBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: '8px 14px',
    fontSize: '14px',
    backgroundColor: disabled ? '#e9ecef' : 'white',
    color: disabled ? '#adb5bd' : '#333',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: '500',
  };
}
