import axios from 'axios';

/**
 * Archivo para hacer llamadas a la API del servidor desde el cliente.
 * Aquí se pueden agregar funciones para cada endpoint que el cliente necesite.
 */
const BASE_URL = process.env.VITE_BACKEND_URL || 'http://localhost:3000';

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

export async function login(Nombre_operario: string, Clave_operario: string): Promise<any> {
  const response = await axios.post(`${BASE_URL}/api/operarios/auth/login`, {
    Nombre_operario,
    Clave_operario
  });
  console.log('Login exitoso:', response.data);
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
