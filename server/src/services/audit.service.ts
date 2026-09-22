import { Service } from 'typedi';
import { AuditRepository, AuditFilters } from '../repositories/audit.repository';
import { AuditLog, AuditLogCreation } from '../models/audit.model';
import { PaginationResult, getQueryString, parsePageLimit } from '../utils/pagination';

@Service()
export class AuditService {
    
    constructor(
        private readonly auditRepository: AuditRepository
    ) {}

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


}
