import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { OperarioService } from '../services/operario.service';
import { authMiddleware } from '../middleware/auth.middleware';

@Service()
export class OperarioController {
    private operarioRouter = Router();

    constructor(
        private readonly operarioService: OperarioService
    ) {
        this.operarioRouter.post('/auth/login', this.login.bind(this));
        this.operarioRouter.get('/', this.getAll.bind(this));
        this.operarioRouter.post('/', authMiddleware, this.register.bind(this));
        this.operarioRouter.put('/:id', authMiddleware, this.update.bind(this));
        this.operarioRouter.delete('/:id', authMiddleware, this.delete.bind(this));
    }

    /**
     * Devuelve el router de operarios.
     */
    getRouter(): Router {
        return this.operarioRouter;
    }

    /**
     * POST /auth/login
     * Login de un operario
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const operarioLogin = req.body;
            const authResponse = await this.operarioService.login(operarioLogin);
            res.status(200).json(authResponse);
        } catch (error) {
            const errorMessage = (error as Error).message;

            if (errorMessage === 'OperarioLoginValidationError') {
                res.status(400).json({ error: 'Datos de login inválidos' });
            } else if (errorMessage === 'InvalidCredentialsError') {
                res.status(401).json({ error: 'Nombre de operario o clave incorrectos' });
            } else {
                console.error('Error en login de operario:', error);
                res.status(500).json({ error: 'Error interno en el servidor' });
            }
        }
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
            const requestingOperario = {
                Id_operario: (req as any).operario.Id_operario,
                Rol_operario: (req as any).operario.Rol_operario
            };
            const newOperario = await this.operarioService.registerOperario(operarioData, requestingOperario);
            res.status(201).json(newOperario);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'UnauthorizedAccessError') {
                res.status(403).json({ error: 'No tienes permisos para registrar operarios' });
            } else if (msg === 'OperarioAlreadyExists') {
                res.status(409).json({ error: 'El nombre de operario ya está en uso' });
            } else {
                console.error('Error al registrar operario:', error);
                res.status(400).json({ error: 'Datos de operario inválidos' });
            }
        }
    }

    /**
     * PUT /:id
     * Actualiza un operario existente.
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const requestingOperario = {
                Id_operario: (req as any).operario.Id_operario,
                Rol_operario: (req as any).operario.Rol_operario
            };
            const updatedOperario = await this.operarioService.updateOperario(id, data, requestingOperario);
            res.status(200).json(updatedOperario);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'UnauthorizedAccessError') {
                res.status(403).json({ error: 'No tienes permisos para actualizar operarios' });
            } else if (msg === 'OperarioNotFound') {
                res.status(404).json({ error: 'Operario no encontrado' });
            } else {
                console.error('Error al actualizar operario:', error);
                res.status(400).json({ error: 'Error al actualizar operario' });
            }
        }
    }

    /**
     * DELETE /:id
     * Elimina un operario.
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const requestingOperario = {
                Id_operario: (req as any).operario.Id_operario,
                Rol_operario: (req as any).operario.Rol_operario
            };
            await this.operarioService.deleteOperario(id, requestingOperario);
            res.status(204).send();
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'UnauthorizedAccessError') {
                res.status(403).json({ error: 'No tienes permisos para eliminar operarios' });
            } else if (msg === 'OperarioNotFound') {
                res.status(404).json({ error: 'Operario no encontrado' });
            } else if ((error as any).code === 'ER_ROW_IS_REFERENCED_2') {
                res.status(409).json({ error: 'No se puede eliminar el operario porque tiene registros asociados (logs)' });
            } else {
                console.error('Error al eliminar operario:', error);
                res.status(500).json({ error: 'Error al eliminar operario' });
            }
        }
    }
}
