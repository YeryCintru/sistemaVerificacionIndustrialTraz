import axios, { AxiosError } from 'axios';

/**
 * Archivo para hacer llamadas a la API del servidor desde el cliente.
 * Aquí se pueden agregar funciones para cada endpoint que el cliente necesite.
 */
const BASE_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';

export interface OrdenProduccion {
  Id_ordenProd?: number;
  Codigo_ordenProd: string;
  Lote_ordenProd: string;
  Cantidad_ordenProd: number;
  CantidadCompletada_ordenProd?: number;
  FechaInicio_ordenProd?: string;
  FechaCierre_ordenProd?: string | null;
  Estado_ordenProd: string;
  Comentarios_ordenProd?: string;
  Id_producto: number;
  Nombre_producto: string;
}

/**
 * Interfaz principal que representa un Producto.
 */
export interface Producto {
  Id_producto?: number;
  Codigo_producto: string;
  Nombre_producto: string;
  Estado_producto: string;
  Verificador_producto?: string;
  FechaCreacion_producto?: Date;
  Documentacion_producto?: string;
}

export interface LoginResponse {
  token: string;
  Id_operario: number;
  Nombre_operario: string;
  Rol_operario: string;
  expiresIn: number;
}

// Gestión de Token 

/**
 * Guarda el token en localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  updateAuthHeader();
}

/**
 * Obtiene el token de localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Limpia el token
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  updateAuthHeader();
}

/**
 * Actualiza el header de autorización de axios
 */
function updateAuthHeader(): void {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
}

/**
 * Inicializa el token al cargar la app
 */
export function initializeAuth(): void {
  updateAuthHeader();
}

// Interceptores 

// Interceptor de respuesta para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn('Token inválido o expirado, limpiando sesión');
      clearToken();
      window.location.href = '/login'; // Redirigir al login
    } else if (error.response?.status === 403) {
      console.warn('Acceso no autorizado para esta acción');
    }
    return Promise.reject(error);
  }
);

// Endpoints

export async function login(Nombre_operario: string, Clave_operario: string): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(`${BASE_URL}/api/operarios/auth/login`, {
    Nombre_operario,
    Clave_operario
  });
  console.log('Login exitoso:', response.data);
  
  // Guardar token
  setToken(response.data.token);
  
  return response.data;
}

/**
 * Logout limpiar el token
 */
export function logout(): void {
  clearToken();
  console.log('Sesión cerrada');
}

export async function getOrdenPorCodigo(codigoOrden: string): Promise<OrdenProduccion> {
  const response = await axios.get<OrdenProduccion>(
    `${BASE_URL}/api/ordenesprod/codigo/${encodeURIComponent(codigoOrden)}`
  );
  console.log('Orden filtrada por código:', response.data);
  return response.data;
}

export async function verificarOrden(id: number, resultado: string, idOperario: number, comentarios: string): Promise<OrdenProduccion> {
  const response = await axios.post<OrdenProduccion>(`${BASE_URL}/api/ordenesprod/${id}/verificar`, {
    resultado,
    idOperario,
    comentarios
  });
  console.log('Orden verificada:', response.data);
  return response.data;
}

export async function getProducto(id: number): Promise<Producto> {
  const response = await axios.get<Producto>(`${BASE_URL}/api/productos/${id}`);
  return response.data;
}
