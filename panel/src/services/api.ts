import axios, { AxiosError } from 'axios';

/**
 * Archivo para hacer llamadas a la API del servidor desde el cliente.
 * Aquí se pueden agregar funciones para cada endpoint que el cliente necesite.
 */
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
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

export interface CrearOrdenPayload {
  cantidad_ordenProd: number;
  id_producto: number;
  codigo_ordenProd?: string;
  lote_ordenProd?: string;
  comentarios_ordenProd?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

/** Parámetros de query para GET /api/ordenesprod (paginación y filtros en servidor) */
export interface GetOrdenesParams {
  page?: number;
  limit?: number;
  filtro?: string;
  codigo_ordenProd?: string;
  lote_ordenProd?: string;
  estado_ordenProd?: string;
  codigo_producto?: string;
  fechaInicio_ordenProd?: string;
  fechaCierre_ordenProd?: string;
}

export async function getOrdenes(): Promise<OrdenProduccion[]> {
  const response = await axios.get<OrdenProduccion[]>(`${BASE_URL}/api/ordenesprod/`);
  return response.data;
}

/**
 * Listado paginado de órdenes (GET /api/ordenesprod).
 * Misma ruta que getOrdenes; el backend devuelve { data, totalItems, totalPages, currentPage }.
 */
export async function getOrdenesPaginated(
  params: GetOrdenesParams = {}
): Promise<PaginatedResponse<OrdenProduccion>> {
  const searchParams = new URLSearchParams();
  (Object.entries(params) as [keyof GetOrdenesParams, GetOrdenesParams[keyof GetOrdenesParams]][]).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        searchParams.append(key, String(value));
      }
    }
  );
  const query = searchParams.toString();
  const url = query
    ? `${BASE_URL}/api/ordenesprod?${query}`
    : `${BASE_URL}/api/ordenesprod/`;
  const response = await axios.get<PaginatedResponse<OrdenProduccion>>(url);
  return response.data;
}

export async function crearOrden(data: CrearOrdenPayload): Promise<OrdenProduccion> {
  const response = await axios.post<OrdenProduccion>(`${BASE_URL}/api/ordenesprod/`, data);
  return response.data;
}

export async function actualizarEstadoOrden(id: number, estado_ordenProd: string): Promise<OrdenProduccion> {
  const response = await axios.patch<OrdenProduccion>(
    `${BASE_URL}/api/ordenesprod/${id}/estado`,
    { estado_ordenProd }
  );
  return response.data;
}

export async function actualizarCantidadOrden(id: number, cantidad_ordenProd: number): Promise<OrdenProduccion> {
  const response = await axios.patch<OrdenProduccion>(
    `${BASE_URL}/api/ordenesprod/${id}/cantidad`,
    { cantidad_ordenProd }
  );
  return response.data;
}

export async function getProductos(): Promise<Producto[]> {
  const response = await axios.get<Producto[]>(`${BASE_URL}/api/productos/`);
  return response.data;
}

export interface GetProductosParams {
  page?: number;
  limit?: number;
  codigo_producto?: string;
  estado_producto?: string;
  fechaCreacion_producto?: string;
}

export async function getProductosPaginated(
  params: GetProductosParams = {}
): Promise<PaginatedResponse<Producto>> {
  const searchParams = new URLSearchParams();
  (Object.entries(params) as [keyof GetProductosParams, GetProductosParams[keyof GetProductosParams]][]).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        searchParams.append(key, String(value));
      }
    }
  );
  const query = searchParams.toString();
  const url = query
    ? `${BASE_URL}/api/productos?${query}`
    : `${BASE_URL}/api/productos/`;
  const response = await axios.get<PaginatedResponse<Producto>>(url);
  return response.data;
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

export interface CrearProductoPayload {
  nombre_producto: string;
  codigo_producto?: string;
  estado_producto?: string;
  verificador_producto?: string;
  documentacion_producto?: string;
}

export interface ActualizarProductoPayload {
  nombre_producto?: string;
  estado_producto?: string;
  verificador_producto?: string;
  documentacion_producto?: string;
}

export async function crearProducto(data: CrearProductoPayload): Promise<Producto> {
  const response = await axios.post<Producto>(`${BASE_URL}/api/productos/`, data);
  return response.data;
}

export async function actualizarProducto(id: number, data: ActualizarProductoPayload): Promise<Producto> {
  const response = await axios.put<Producto>(`${BASE_URL}/api/productos/${id}`, data);
  return response.data;
}

/** Normaliza campos que pueden venir en PascalCase (MySQL) o camelCase del servicio */
export function idProducto(p: Producto): number | undefined {
  return p.Id_producto ?? (p as Producto & { id_producto?: number }).id_producto;
}

export function codigoProducto(p: Producto): string {
  return p.Codigo_producto ?? (p as Producto & { codigo_producto?: string }).codigo_producto ?? '';
}

export function nombreProducto(p: Producto): string {
  return p.Nombre_producto ?? (p as Producto & { nombre_producto?: string }).nombre_producto ?? '';
}

export function estadoProducto(p: Producto): string {
  return p.Estado_producto ?? (p as Producto & { estado_producto?: string }).estado_producto ?? '';
}

export interface RegistroAuditoria {
  Id_log?: number;
  Numero_log?: string;
  Accion_log: string;
  Resultado_log: string;
  Momento_log?: string | Date;
  Comentarios_log?: string;
  Id_operario?: number;
  Id_ordenProd?: number;
  Id_producto?: number;
  Nombre_operario?: string;
  Lote_ordenProd?: string;
  Nombre_producto?: string;
}

export async function getAuditoria(): Promise<RegistroAuditoria[]> {
  const response = await axios.get<RegistroAuditoria[]>(`${BASE_URL}/api/audit/`);
  return response.data;
}

export interface GetAuditoriaParams {
  page?: number;
  limit?: number;
  accion_log?: string;
  resultado_log?: string;
  nombre_operario?: string;
  lote_ordenProd?: string;
  nombre_producto?: string;
  momento_log?: string;
}

export async function getAuditoriaPaginated(
  params: GetAuditoriaParams = {}
): Promise<PaginatedResponse<RegistroAuditoria>> {
  const searchParams = new URLSearchParams();
  (Object.entries(params) as [keyof GetAuditoriaParams, GetAuditoriaParams[keyof GetAuditoriaParams]][]).forEach(
    ([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        searchParams.append(key, String(value));
      }
    }
  );
  const query = searchParams.toString();
  const url = query
    ? `${BASE_URL}/api/audit?${query}`
    : `${BASE_URL}/api/audit/`;
  const response = await axios.get<PaginatedResponse<RegistroAuditoria>>(url);
  return response.data;
}

export function numeroLog(r: RegistroAuditoria): string {
  return r.Numero_log ?? (r as RegistroAuditoria & { numero_log?: string }).numero_log ?? '-';
}

export function accionLog(r: RegistroAuditoria): string {
  return r.Accion_log ?? (r as RegistroAuditoria & { accion_log?: string }).accion_log ?? '';
}

export function resultadoLog(r: RegistroAuditoria): string {
  return r.Resultado_log ?? (r as RegistroAuditoria & { resultado_log?: string }).resultado_log ?? '';
}

export function momentoLog(r: RegistroAuditoria): string | Date | undefined {
  return r.Momento_log ?? (r as RegistroAuditoria & { momento_log?: string }).momento_log;
}

export function comentariosLog(r: RegistroAuditoria): string {
  return r.Comentarios_log ?? (r as RegistroAuditoria & { comentarios_log?: string }).comentarios_log ?? '';
}
