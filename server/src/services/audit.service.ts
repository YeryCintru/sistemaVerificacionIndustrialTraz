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
}
