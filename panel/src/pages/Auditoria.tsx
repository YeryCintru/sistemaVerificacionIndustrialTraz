import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import {
  accionLog,
  comentariosLog,
  getAuditoriaPaginated,
  momentoLog,
  numeroLog,
  resultadoLog,
} from '../services/api';
import type { RegistroAuditoria } from '../services/api';

const PAGE_SIZE = 15;

function formatearFechaHora(fechaIso: string | Date | undefined): string {
  if (!fechaIso) return '-';
  const fecha = fechaIso instanceof Date ? fechaIso : new Date(fechaIso);
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function colorResultado(resultado: string): string {
  const r = resultado.toLowerCase();
  if (r.includes('éxito') || r.includes('exito') || r.includes('correcto') || r.includes('successful')) {
    return '#28a745';
  }
  if (r.includes('incorrecto') || r.includes('fallid') || r.includes('error') || r.includes('ko')) {
    return '#dc3545';
  }
  return '#6c757d';
}

export function Auditoria() {
  const navigate = useNavigate();
  const [registros, setRegistros] = React.useState<RegistroAuditoria[]>([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalPaginas, setTotalPaginas] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [filtroFecha, setFiltroFecha] = React.useState('');
  const [filtroResultado, setFiltroResultado] = React.useState('');
  const [filtroAccion, setFiltroAccion] = React.useState('');
  const [filtroOperario, setFiltroOperario] = React.useState('');
  const [filtroCodigoOrden, setFiltroCodigoOrden] = React.useState('');
  const [filtroLote, setFiltroLote] = React.useState('');
  const [filtroCodigoProducto, setFiltroCodigoProducto] = React.useState('');
  const [paginaActual, setPaginaActual] = React.useState(1);
  const [filtrosAplicados, setFiltrosAplicados] = React.useState({
    accion: '',
    resultado: '',
    operario: '',
    codigoOrden: '',
    lote: '',
    codigoProducto: '',
    fecha: '',
  });
  const [detalle, setDetalle] = React.useState<RegistroAuditoria | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getAuditoriaPaginated({
          page: paginaActual,
          limit: PAGE_SIZE,
          accion_log: filtrosAplicados.accion || undefined,
          resultado_log: filtrosAplicados.resultado || undefined,
          nombre_operario: filtrosAplicados.operario || undefined,
          codigo_ordenProd: filtrosAplicados.codigoOrden || undefined,
          lote_ordenProd: filtrosAplicados.lote || undefined,
          codigo_producto: filtrosAplicados.codigoProducto || undefined,
          momento_log: filtrosAplicados.fecha || undefined,
        });
        if (!cancelado) {
          setRegistros(response.data);
          setTotalItems(response.totalItems);
          setTotalPaginas(Math.max(1, response.totalPages));
        }
      } catch {
        if (!cancelado) setError('No se pudieron cargar los registros de auditoría.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => { cancelado = true; };
  }, [paginaActual, filtrosAplicados]);

  const resultadosUnicos = React.useMemo(() => {
    const set = new Set(registros.map((r) => resultadoLog(r)).filter(Boolean));
    return Array.from(set).sort();
  }, [registros]);

  const accionesUnicas = React.useMemo(() => {
    const set = new Set(registros.map((r) => accionLog(r)).filter(Boolean));
    return Array.from(set).sort();
  }, [registros]);

  const hayFiltrosActivos =
    filtroFecha || filtroResultado || filtroAccion || filtroOperario
    || filtroCodigoOrden || filtroLote || filtroCodigoProducto;

  const handleBuscar = () => {
    setFiltrosAplicados({
      accion: filtroAccion,
      resultado: filtroResultado,
      operario: filtroOperario,
      codigoOrden: filtroCodigoOrden,
      lote: filtroLote,
      codigoProducto: filtroCodigoProducto,
      fecha: filtroFecha,
    });
    setPaginaActual(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltroFecha('');
    setFiltroResultado('');
    setFiltroAccion('');
    setFiltroOperario('');
    setFiltroCodigoOrden('');
    setFiltroLote('');
    setFiltroCodigoProducto('');
    setFiltrosAplicados({
      accion: '',
      resultado: '',
      operario: '',
      codigoOrden: '',
      lote: '',
      codigoProducto: '',
      fecha: '',
    });
    setPaginaActual(1);
  };

  const irAPagina = (pagina: number) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaActual(pagina);
  };

  const totalFormateado = totalItems.toLocaleString('es-ES');
  const rangoInicio = totalItems === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1;
  const rangoFin = totalItems === 0 ? 0 : Math.min((paginaActual - 1) * PAGE_SIZE + registros.length, totalItems);

  const paginasVisibles = React.useMemo(() => {
    const maxVisibles = 5;
    let inicio = Math.max(1, paginaActual - Math.floor(maxVisibles / 2));
    const fin = Math.min(totalPaginas, inicio + maxVisibles - 1);
    inicio = Math.max(1, fin - maxVisibles + 1);
    const paginas: number[] = [];
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    return paginas;
  }, [paginaActual, totalPaginas]);

  return (
    <div style={pageWrap}>
      <button onClick={() => navigate('/inicio')} style={btnVolver}>
        ← Volver al menú
      </button>

      <div style={card}>
        <h2 style={titulo}>Auditoría</h2>
        <p style={subtitulo}>
          Consulta de registros del sistema. Solo lectura.
        </p>

        <div style={filtrosBox}>
          <div style={{ flex: '0 1 160px' }}>
            <label style={labelStyle}>Fecha</label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '0 1 160px' }}>
            <label style={labelStyle}>Resultado</label>
            <select
              value={filtroResultado}
              onChange={(e) => setFiltroResultado(e.target.value)}
              style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="">Todos</option>
              {resultadosUnicos.map((res) => (
                <option key={res} value={res}>{res}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 1 180px' }}>
            <label style={labelStyle}>Acción</label>
            <select
              value={filtroAccion}
              onChange={(e) => setFiltroAccion(e.target.value)}
              style={{ ...inputStyle, backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="">Todas</option>
              {accionesUnicas.map((acc) => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: '0 1 180px' }}>
            <label style={labelStyle}>Operario</label>
            <input
              type="text"
              placeholder="Nombre del operario"
              value={filtroOperario}
              onChange={(e) => setFiltroOperario(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={labelStyle}>Código orden</label>
            <input
              type="text"
              placeholder="Ej: ORD-2026-1"
              value={filtroCodigoOrden}
              onChange={(e) => setFiltroCodigoOrden(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={labelStyle}>Lote</label>
            <input
              type="text"
              placeholder="Ej: L-2026-1"
              value={filtroLote}
              onChange={(e) => setFiltroLote(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>Código de producto</label>
            <input
              type="text"
              placeholder="Ej: PROD-1"
              value={filtroCodigoProducto}
              onChange={(e) => setFiltroCodigoProducto(e.target.value)}
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
          <p style={msgCenter}>Cargando registros...</p>
        ) : error ? (
          <p style={{ ...msgCenter, color: '#dc3545' }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={thStyle}>Nº log</th>
                  <th style={thStyle}>Momento</th>
                  <th style={thStyle}>Acción</th>
                  <th style={thStyle}>Resultado</th>
                  <th style={thStyle}>Operario</th>
                  <th style={thStyle}>Orden / Producto</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                      No hay registros de auditoría.
                    </td>
                  </tr>
                ) : (
                  registros.map((r) => {
                    const resultado = resultadoLog(r);
                    const refOrden = r.Lote_ordenProd ? `Lote: ${r.Lote_ordenProd}` : '';
                    const refProducto = r.Codigo_producto ? r.Codigo_producto : '';
                    const referencia = [refOrden, refProducto].filter(Boolean).join(' - ') || '-';
                    return (
                      <tr key={r.Id_log ?? numeroLog(r)} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={tdStyle}>{numeroLog(r)}</td>
                        <td style={tdStyle}>{formatearFechaHora(momentoLog(r))}</td>
                        <td style={tdStyle}>{accionLog(r)}</td>
                        <td style={tdStyle}>
                          <span style={{ fontWeight: 'bold', color: colorResultado(resultado) }}>
                            {resultado}
                          </span>
                        </td>
                        <td style={tdStyle}>{r.Nombre_operario ?? '-'}</td>
                        <td style={tdStyle}>{referencia}</td>
                        <td style={tdStyle}>
                          <button onClick={() => setDetalle(r)} style={btnVer}>Ver</button>
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

      {detalle && (
        <div style={overlay} onClick={() => setDetalle(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setDetalle(null)} style={btnCerrar}>&times;</button>
            <h2 style={{ marginTop: 0, color: '#333' }}>Detalle del registro</h2>
            <p style={{ margin: '0 0 20px 0', color: '#888', fontSize: '13px' }}>{numeroLog(detalle)}</p>

            <dl style={dl}>
              <Item label="Momento" value={formatearFechaHora(momentoLog(detalle))} />
              <Item label="Acción" value={accionLog(detalle)} />
              <Item
                label="Resultado"
                value={
                  <span style={{ fontWeight: 'bold', color: colorResultado(resultadoLog(detalle)) }}>
                    {resultadoLog(detalle)}
                  </span>
                }
              />
              <Item label="Operario" value={detalle.Nombre_operario ?? '-'} />
              <Item label="Lote orden" value={detalle.Lote_ordenProd ?? '-'} />
              <Item label="Producto" value={detalle.Codigo_producto ?? '-'} />
              <Item label="Comentarios" value={comentariosLog(detalle) || 'Sin comentarios'} multiline />
            </dl>

            <button type="button" onClick={() => setDetalle(null)} style={btnCerrarModal}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Item({
  label,
  value,
  multiline,
}: {
  label: string;
  value: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <>
      <dt style={dt}>{label}</dt>
      <dd style={multiline ? ddMultiline : dd}>{value}</dd>
    </>
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

const titulo: React.CSSProperties = {
  margin: '0 0 8px 0',
  color: '#333',
  borderBottom: '2px solid #eee',
  paddingBottom: '10px',
};

const subtitulo: React.CSSProperties = {
  margin: '0 0 24px 0',
  color: '#666',
  fontSize: '14px',
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
  maxWidth: '520px',
  width: '90%',
  maxHeight: '85vh',
  overflowY: 'auto',
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

const dl: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  gap: '12px 16px',
  margin: '0 0 24px 0',
};

const dt: React.CSSProperties = {
  margin: 0,
  fontWeight: 'bold',
  color: '#666',
  fontSize: '13px',
};

const dd: React.CSSProperties = {
  margin: 0,
  color: '#333',
  fontSize: '15px',
};

const ddMultiline: React.CSSProperties = {
  ...dd,
  whiteSpace: 'pre-wrap',
  lineHeight: 1.5,
};

const btnCerrarModal: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
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
