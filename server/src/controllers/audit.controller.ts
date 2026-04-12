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
        this.auditRouter.put('/:id', this.update.bind(this));
        this.auditRouter.delete('/:id', this.delete.bind(this));
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

    /**
     * PUT /:id
     * Actualiza un registro de auditoría existente.
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const updatedLog = await this.auditService.updateLog(id, data);
            res.status(200).json(updatedLog);
        } catch (error) {
            if ((error as Error).message === 'AuditLogNotFound') {
                res.status(404).json({ error: 'Registro de auditoría no encontrado' });
            } else {
                console.error('Error al actualizar auditoría:', error);
                res.status(400).json({ error: 'Error al actualizar registro de auditoría' });
            }
        }
    }

    /**
     * DELETE /:id
     * Elimina un registro de auditoría.
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            await this.auditService.deleteLog(id);
            res.status(204).send();
        } catch (error) {
            if ((error as Error).message === 'AuditLogNotFound') {
                res.status(404).json({ error: 'Registro de auditoría no encontrado' });
            } else {
                console.error('Error al eliminar auditoría:', error);
                res.status(500).json({ error: 'Error al eliminar registro de auditoría' });
            }
        }
    }
}
