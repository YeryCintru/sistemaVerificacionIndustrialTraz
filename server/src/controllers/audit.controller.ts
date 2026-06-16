import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { AuditService } from '../services/audit.service';
import { authMiddleware } from '../middleware/auth.middleware';

@Service()
export class AuditController {
    private auditRouter = Router();

    constructor(
        private readonly auditService: AuditService
    ) {
        this.auditRouter.get('/', authMiddleware, this.getAll.bind(this));

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
            const result = await this.auditService.getLogsPaginated(req.query);
            res.status(200).json(result);
        } catch (error) {
            console.error('Error al listar auditorías:', error);
            res.status(500).json({ error: 'Error interno al listar auditorías' });
        }
    }

}
