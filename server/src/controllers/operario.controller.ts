import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { OperarioService } from '../services/operario.service';

@Service()
export class OperarioController {
    private operarioRouter = Router();

    constructor(
        private readonly operarioService: OperarioService
    ) {
        this.operarioRouter.get('/', this.getAll.bind(this));
        this.operarioRouter.post('/', this.register.bind(this));
    }

    /**
     * Devuelve el router de operarios.
     */
    getRouter(): Router {
        return this.operarioRouter;
    }

    /**
     * GET /
     * Lista todos los operarios.
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const operarios = await this.operarioService.getOperarios();
            res.status(200).json(operarios);
        } catch (error) {
            console.error('Error al listar operarios:', error);
            res.status(500).json({ error: 'Error interno al listar operarios' });
        }
    }

    /**
     * POST /
     * Registra un nuevo operario.
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const operarioData = req.body;
            const newOperario = await this.operarioService.registerOperario(operarioData);
            res.status(201).json(newOperario);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'OperarioAlreadyExists') {
                res.status(409).json({ error: 'El nombre de operario ya está en uso' });
            } else {
                console.error('Error al registrar operario:', error);
                res.status(400).json({ error: 'Datos de operario inválidos' });
            }
        }
    }
}
