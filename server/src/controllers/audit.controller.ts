import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { AuditService } from '../services/audit.service';

@Service()
export class AuditController {
    private auditRouter = Router();

    constructor(
        private readonly auditService: AuditService
    ) {
        this.auditRouter.get('/', this.getAll.bind(this));
        this.auditRouter.post('/', this.create.bind(this));
    }

    /**
     * Devuelve el router de auditoría.
     */
    getRouter(): Router {
        return this.auditRouter;
    }

    /**
     * GET /
     * Obtiene todos los registros de auditoría.
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const logs = await this.auditService.getLogs();
            res.status(200).json(logs);
        } catch (error) {
            console.error('Error al listar auditorías:', error);
            res.status(500).json({ error: 'Error interno al listar auditorías' });
        }
    }

    /**
     * POST /
     * Crea un nuevo registro de auditoría manual.
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const logData = req.body;
            const newLog = await this.auditService.logAction(logData);
            res.status(201).json(newLog);
        } catch (error) {
            console.error('Error al crear log de auditoría:', error);
            res.status(400).json({ error: 'Datos de auditoría inválidos' });
        }
    }
}
