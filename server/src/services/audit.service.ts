import { Service } from 'typedi';
import { AuditRepository, AuditFilters } from '../repositories/audit.repository';
import { AuditLog, AuditLogCreation } from '../models/audit.model';
import { PaginationResult, getQueryString, parsePageLimit } from '../utils/pagination';

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

    async getLogsPaginated(query: any): Promise<PaginationResult<any>> {
        const { page, limit } = parsePageLimit(query);

        const filters: AuditFilters = {
            filtro: getQueryString(query, 'filtro'),
            fecha: getQueryString(query, 'fecha') ?? getQueryString(query, 'momento_log'),
            resultado_log: getQueryString(query, 'resultado_log'),
            accion_log: getQueryString(query, 'accion_log'),
            nombre_operario: getQueryString(query, 'nombre_operario') ?? getQueryString(query, 'operario'),
            codigo_ordenProd: getQueryString(query, 'codigo_ordenProd'),
            lote_ordenProd: getQueryString(query, 'lote_ordenProd'),
            codigo_producto: getQueryString(query, 'codigo_producto')
        };

        const { data, totalItems } = await this.auditRepository.findPaginated(filters, page, limit);
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

        return { data, totalItems, totalPages, currentPage: page };
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
