/**
 * Tipos de estado para una Orden de Producción según la definición de BD.
 */
export type EstadoOrden = 'Pendiente' | 'En Progreso' | 'Completada' | 'Cancelada';

/**
 * Interfaz principal que representa una Orden de Producción completa.
 */
export interface OrdenProduccion {
    id_ordenProd?: number;
    lote_ordenProd: string;
    cantidad_ordenProd: number;
    cantidadCompletada_ordenProd?: number;
    fechaInicio_ordenProd?: Date;
    estado_ordenProd: EstadoOrden;
    comentarios_ordenProd?: string;
    id_producto: number;
}

/**
 * Interfaz para la creación de una nueva Orden de Producción.
 */
export interface OrdenCreation {
    lote_ordenProd: string;
    cantidad_ordenProd: number;
    id_producto: number;
    comentarios_ordenProd?: string;
}

