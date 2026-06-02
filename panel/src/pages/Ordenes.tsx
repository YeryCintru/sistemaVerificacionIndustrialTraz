import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import { getOrdenesPaginated } from '../services/api';
import type { OrdenProduccion } from '../services/api';

const PAGE_SIZE = 15;

const ESTADOS_ORDEN = ['Pendiente', 'En Progreso', 'Cerrada'] as const;
type EstadoFiltro = '' | (typeof ESTADOS_ORDEN)[number];



function formatearFecha(fechaIso: string | undefined): string {
  if (!fechaIso) return '-';
  return new Date(fechaIso).toLocaleDateString('es-ES');
}

interface OrdenesProps {
  onSeleccionar: (orden: OrdenProduccion) => void;
}

export function Ordenes({ onSeleccionar }: OrdenesProps) {
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = React.useState<OrdenProduccion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [filtroLote, setFiltroLote] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState<EstadoFiltro>('');
  const [filtroFecha, setFiltroFecha] = React.useState('');
  const [filtroFechaFinal, setFiltroFechaFinal] = React.useState('');
  const [filtroProducto, setFiltroProducto] = React.useState('');
  const [paginaActual, setPaginaActual] = React.useState(1);

  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getOrdenesPaginated({ page: paginaActual, limit: PAGE_SIZE });
        if (!cancelado) setOrdenes(data.data);
      } catch {
        if (!cancelado) setError('No se pudieron cargar las órdenes de producción.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => { cancelado = true; };
  }, []);

  const totalPaginas = Math.max(1, Math.ceil(ordenes.length / PAGE_SIZE));

  React.useEffect(() => {
    if (paginaActual > totalPaginas) setPaginaActual(totalPaginas);
  }, [paginaActual, totalPaginas]);

  const indiceInicio = (paginaActual - 1) * PAGE_SIZE;
  const indiceFin = Math.min(indiceInicio + PAGE_SIZE, ordenes.length);
  const ordenesPagina = ordenes.slice(indiceInicio, indiceFin);

  const handleSeleccionarOrden = (orden: OrdenProduccion) => {
    onSeleccionar(orden);
    navigate('/detalle');
  };

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  // Paginas visibles en el paginador
  const paginasVisibles = React.useMemo(() => {
    const maxVisibles = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisibles / 2));
    const fin = Math.min(totalPaginas, inicio + maxVisibles - 1);
    inicio = Math.max(1, fin - maxVisibles + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }, [paginaActual, totalPaginas]);

  const totalFormateado = ordenes.length.toLocaleString('es-ES');
  const rangoInicio = ordenes.length === 0 ? 0 : indiceInicio + 1;
  const rangoFin = indiceFin;

  const productosUnicos = React.useMemo(() => {
    const nombres = new Set(ordenes.map((o) => o.Nombre_producto).filter(Boolean));
    return Array.from(nombres).sort();
  }, [ordenes]);

  const inputFiltroStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
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
        onClick={() => navigate('/inicio')}
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
        ← Volver al menú
      </button>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '24px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px',
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>
            Órdenes de Producción
          </h2>
          <button
            onClick={() => navigate('/crear-orden')}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            + Crear orden
          </button>
        </div>

        {/* Bloque superior: filtros */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'flex-end',
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #eee',
        }}>
          <div style={{ flex: '1 1 220px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
              Código de lote
            </label>
            <input
              type="text"
              placeholder="Buscar por lote..."
              value={filtroLote}
              onChange={(e) => setFiltroLote(e.target.value)}
              style={inputFiltroStyle}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
              Producto
            </label>
            <select
              value={filtroProducto}
              onChange={(e) => setFiltroProducto(e.target.value)}
              style={{ ...inputFiltroStyle, backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="">Todos</option>
              {productosUnicos.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
              style={{ ...inputFiltroStyle, backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="">Todos</option>
              {ESTADOS_ORDEN.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
              Fecha de inicio
            </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              style={inputFiltroStyle}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
              Fecha final
            </label>
            <input
              type="date"
              value={filtroFechaFinal}
              onChange={(e) => setFiltroFechaFinal(e.target.value)}
              style={inputFiltroStyle}
            />
          </div>

          <button
            type="button"
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              alignSelf: 'flex-end',
            }}
          >
            Buscar
          </button>

          {(filtroLote || filtroEstado || filtroFecha || filtroFechaFinal || filtroProducto) && (
            <button
              onClick={() => {
                setFiltroLote('');
                setFiltroEstado('');
                setFiltroFecha('');
                setFiltroFechaFinal('');
                setFiltroProducto('');
              }}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500',
                alignSelf: 'flex-end',
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Bloque central: tabla */}
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>Cargando órdenes...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#dc3545', padding: '40px 0' }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={thStyle}>Código</th>
                  <th style={thStyle}>Lote</th>
                  <th style={thStyle}>Producto</th>
                  <th style={thStyle}>Progreso</th>
                  <th style={thStyle}>Fecha inicio</th>
                  <th style={thStyle}>Fecha final</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {ordenesPagina.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                      No hay órdenes de producción.
                    </td>
                  </tr>
                ) : (
                  ordenesPagina.map((orden) => (
                      <tr
                        key={orden.Id_ordenProd ?? orden.Codigo_ordenProd}
                        style={{ borderBottom: '1px solid #eee' }}
                      >
                        <td style={tdStyle}>{orden.Codigo_ordenProd}</td>
                        <td style={tdStyle}>{orden.Lote_ordenProd}</td>
                        <td style={tdStyle}>{orden.Nombre_producto}</td>
                        <td style={tdStyle}>
                          {orden.CantidadCompletada_ordenProd ?? 0} / {orden.Cantidad_ordenProd}
                        </td>
                        <td style={tdStyle}>{formatearFecha(orden.FechaInicio_ordenProd)}</td>
                        <td style={tdStyle}>{formatearFecha(orden.FechaCierre_ordenProd ?? undefined)}</td>
                        <td style={tdStyle}>
                          <span style={{
                            fontWeight: 'bold',
                            color: colorEstadoOrden(orden.Estado_ordenProd),
                          }}>
                            {orden.Estado_ordenProd}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button
                            onClick={() => handleSeleccionarOrden(orden)}
                            style={{
                              padding: '6px 12px',
                              fontSize: '13px',
                              backgroundColor: '#007bff',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontWeight: '500',
                            }}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bloque inferior: paginador */}
        {!loading && !error && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              Mostrando {rangoInicio}-{rangoFin} de {totalFormateado} registros totales
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => irAPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                style={paginadorBtnStyle(paginaActual <= 1)}
              >
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

              <button
                onClick={() => irAPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
                style={paginadorBtnStyle(paginaActual >= totalPaginas)}
              >
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


function colorEstadoOrden(estado: string): string {
  if (estado === 'Cerrada') return '#dc3545';
  if (estado === 'En Progreso') return '#007bff';
  return '#6c757d';
}