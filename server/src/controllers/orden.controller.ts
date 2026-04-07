import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { OrdenService } from '../services/orden.service';

@Service()
export class OrdenController {
    private ordenRouter = Router();

    constructor(
        private readonly ordenService: OrdenService
    ) {
        this.ordenRouter.get('/', this.getAll.bind(this));
        this.ordenRouter.get('/:id', this.getById.bind(this));
        this.ordenRouter.post('/', this.create.bind(this));
    }

    /**
     * Devuelve el router configurado.
     */
    getRouter(): Router {
        return this.ordenRouter;
    }

    /**
     * GET /
     * Obtiene todas las órdenes.
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const ordenes = await this.ordenService.getOrdenes();
            res.status(200).json(ordenes);
        } catch (error) {
            console.error('Error al obtener órdenes:', error);
            res.status(500).json({ error: 'Error interno al listar órdenes' });
        }
    }

    /**
     * GET /:id
     * Detalle de una orden.
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const orden = await this.ordenService.getOrdenById(id);
            res.status(200).json(orden);
        } catch (error) {
            if ((error as Error).message === 'OrdenNotFound') {
                res.status(404).json({ error: 'Orden de producción no encontrada' });
            } else {
                res.status(500).json({ error: 'Error al recuperar la orden' });
            }
        }
    }

    /**
     * POST /
     * Crea una nueva orden.
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const ordenData = req.body;
            const newOrden = await this.ordenService.createOrden(ordenData);
            res.status(201).json(newOrden);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'ProductoNotFound') {
                res.status(400).json({ error: 'El producto asociado no existe' });
            } else if ((error as any).code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: 'El lote de producción ya existe' });
            } else {
                res.status(400).json({ error: 'Datos de orden inválidos' });
            }
        }
    }
}
