/**
 * Tipos de rol disponibles para un Operario.
 */
export type RolOperario = 'Admin' | 'Supervisor' | 'Operario';

/**
 * Interfaz que representa un Operario en el sistema.
 */
export interface Operario {
    Id_operario?: number;
    Nombre_operario: string;
    Clave_operario: string;
    Rol_operario: RolOperario;
}

/**
 * Interfaz para la creación de un nuevo Operario.
 */
export interface OperarioCreation {
    Nombre_operario: string;
    Clave_operario: string;
    Rol_operario: RolOperario;
}

/**
 * Interfaz para el login de un Operario.
 */
export interface OperarioLogin {
    Nombre_operario: string;
    Clave_operario: string;
}

/**
 * Interfaz para la respuesta de autenticación del Operario.
 */
export interface OperarioAuthResponse {
    Id_operario: number;
    Nombre_operario: string;
    Rol_operario: RolOperario;
}

