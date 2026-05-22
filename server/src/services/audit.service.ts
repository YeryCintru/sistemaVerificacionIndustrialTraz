import { Service } from 'typedi';
import { AuditRepository } from '../repositories/audit.repository';
import { AuditLog, AuditLogCreation } from '../models/audit.model';

@Service()
export class AuditService {
    
    constructor(
        private readonly auditRepository: AuditRepository
    ) {}

    /**
     * Obtiene el listado de todos los logs de auditoría.
     */
    async getLogs(): Promise<any[]> {
        return await this.auditRepository.findAll();
    }

    /**
     * Registra un nuevo evento en el log de auditoría.
     * @param data Datos del evento.
     */
    async logAction(data: AuditLogCreation): Promise<any> {
        const id = await this.auditRepository.create(data);
        return await this.auditRepository.findById(id);
    }

    /**
     * Actualiza un registro de auditoría existente.
     * @param id ID del log.
     * @param data Datos a actualizar.
     * @param requestingOperario Operario que realiza la acción
     */
    async updateLog(id: number, data: Partial<AuditLog>, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<any> {
        // Validar permisos: Solo Admin puede actualizar
        if (requestingOperario.Rol_operario !== 'Admin') {
            throw new Error('UnauthorizedAccessError');
        }

        const updated = await this.auditRepository.update(id, data);
        if (!updated) {
            throw new Error('AuditLogNotFound');
        }
        return await this.auditRepository.findById(id);
    }

    /**
     * Elimina un registro de auditoría.
     * @param id ID del log.
     * @param requestingOperario Operario que realiza la acción
     */
    async deleteLog(id: number, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<void> {
        // Validar permisos: Solo Admin puede eliminar
        if (requestingOperario.Rol_operario !== 'Admin') {
            throw new Error('UnauthorizedAccessError');
        }

        const deleted = await this.auditRepository.delete(id);
        if (!deleted) {
            throw new Error('AuditLogNotFound');
        }
    }
}
