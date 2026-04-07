/**
 * Interfaz que representa un registro de Auditoría (Log).
 */
export interface AuditLog {
    id_log?: number;
    numero_log?: string;
    accion_log: string;
    resultado_log: string;
    momento_log?: Date;
    comentarios_log?: string;
    id_operario?: number;
    id_ordenProd?: number;
}

/**
 * Interfaz para la creación de un nuevo registro de Auditoría.
 */
export interface AuditLogCreation {
    accion_log: string;
    resultado_log: string;
    comentarios_log?: string;
    id_operario?: number;
    id_ordenProd?: number;
}
