import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BotonLogout } from '../components/BotonLogout';
import { getOperariosPaginated } from '../services/api';
import type { Operario } from '../services/api';

const PAGE_SIZE = 15;

const ROLES_OPERARIO = ['Admin', 'Operario', 'Supervisor'] as const;
type RolFiltro = '' | (typeof ROLES_OPERARIO)[number];

export function Usuarios() {
  const navigate = useNavigate();
  const [operarios, setOperarios] = React.useState<Operario[]>([]);
  const [totalItems, setTotalItems] = React.useState(0);
  const [totalPaginas, setTotalPaginas] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const [filtroNombre, setFiltroNombre] = React.useState('');
  const [filtroRol, setFiltroRol] = React.useState<RolFiltro>('');
  const [paginaActual, setPaginaActual] = React.useState(1);
  const [filtrosAplicados, setFiltrosAplicados] = React.useState({
    nombre: '',
    rol: '',
  });

  React.useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getOperariosPaginated({
          page: paginaActual,
          limit: PAGE_SIZE,
          nombre_operario: filtrosAplicados.nombre || undefined,
          rol_operario: filtrosAplicados.rol || undefined,
        });
        if (!cancelado) {
          setOperarios(response.data);
          setTotalItems(response.totalItems);
          setTotalPaginas(Math.max(1, response.totalPages));
        }
      } catch {
        if (!cancelado) setError('No se pudieron cargar los usuarios.');
      } finally {
        if (!cancelado) setLoading(false);
      }
    };
    cargar();
    return () => { cancelado = true; };
  }, [paginaActual, filtrosAplicados]);

  const handleBuscar = () => {
    setFiltrosAplicados({
      nombre: filtroNombre,
      rol: filtroRol,
    });
    setPaginaActual(1);
  };

  const handleLimpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroRol('');
    setFiltrosAplicados({
      nombre: '',
      rol: '',
    });
    setPaginaActual(1);
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
    for (let i = Math.max(1, inicio); i <= fin; i++) paginas.push(i);
    return paginas;
  }, [paginaActual, totalPaginas]);

  const totalFormateado = totalItems.toLocaleString('es-ES');
  const rangoInicio = totalItems === 0 ? 0 : (paginaActual - 1) * PAGE_SIZE + 1;
  const rangoFin = totalItems === 0 ? 0 : Math.min((paginaActual - 1) * PAGE_SIZE + operarios.length, totalItems);

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
            Gestión de Usuarios
          </h2>
          {/* <button
            onClick={() => navigate('/crear-usuario')}
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
            + Crear usuario
          </button> */}
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
              Nombre de usuario
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              style={inputFiltroStyle}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', color: '#666', fontSize: '14px', marginBottom: '6px' }}>
              Rol
            </label>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value as RolFiltro)}
              style={{ ...inputFiltroStyle, backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="">Todos</option>
              {ROLES_OPERARIO.map((rol) => (
                <option key={rol} value={rol}>{rol}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleBuscar}
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

          {(filtroNombre || filtroRol) && (
            <button
              onClick={handleLimpiarFiltros}
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
          <p style={{ textAlign: 'center', color: '#666', padding: '40px 0' }}>Cargando usuarios...</p>
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
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Nombre de Usuario</th>
                  <th style={thStyle}>Rol</th>
                </tr>
              </thead>
              <tbody>
                {operarios.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: '#666' }}>
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  operarios.map((operario) => (
                    <tr
                      key={operario.Id_operario}
                      style={{ borderBottom: '1px solid #eee' }}
                    >
                      <td style={tdStyle}>{operario.Id_operario}</td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '500' }}>
                          {operario.Nombre_operario}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: operario.Rol_operario === 'Admin' ? '#dc3545' : (operario.Rol_operario === 'Supervisor' ? '#ffc107' : '#007bff'),
                          color: operario.Rol_operario === 'Supervisor' ? '#333' : 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}>
                          {operario.Rol_operario}
                        </span>
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
            <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
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
