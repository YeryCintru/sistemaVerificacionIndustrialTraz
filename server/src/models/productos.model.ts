/**
 * Tipos de estado para un Producto.
 */
export type EstadoProducto = 'Correcto' | 'Defectuoso' | 'Pendiente';

/**
 * Interfaz principal que representa un Producto.
 */
export interface Producto {
    id_producto?: number;
    codigo_producto: string;
    nombre_producto: string;
    estado_producto: EstadoProducto;
    verificador_producto?: string;
    fechaCreacion_producto?: Date;
    documentacion_producto?: string;
}

/**
 * Interfaz para la creación de un nuevo Producto.
 */
export interface ProductoCreation {
    codigo_producto: string;
    nombre_producto: string;
    estado_producto?: EstadoProducto;
    verificador_producto?: string;
    documentacion_producto?: string;
}

