/**
 * Tipos de rol disponibles para un Operario.
 */
export type RolOperario = 'Admin' | 'Supervisor' | 'Operario';

/**
 * Interfaz que representa un Operario en el sistema.
 */
export interface Operario {
    id_operario?: number;
    nombre_operario: string;
    clave_operario: string;
    rol_operario: RolOperario;
}

/**
 * Interfaz para la creación de un nuevo Operario.
 */
export interface OperarioCreation {
    nombre_operario: string;
    clave_operario: string;
    rol_operario: RolOperario;
}

