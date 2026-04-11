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
        this.ordenRouter.put('/:id', this.update.bind(this));
        this.ordenRouter.delete('/:id', this.delete.bind(this));
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

    /**
     * PUT /:id
     * Actualiza una orden existente.
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const updatedOrden = await this.ordenService.updateOrden(id, data);
            res.status(200).json(updatedOrden);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'OrdenNotFound') {
                res.status(404).json({ error: 'Orden no encontrada' });
            } else if (msg === 'ProductoNotFound') {
                res.status(400).json({ error: 'El producto asociado no existe' });
            } else {
                console.error('Error al actualizar orden:', error);
                res.status(400).json({ error: 'Error al actualizar orden' });
            }
        }
    }

    /**
     * DELETE /:id
     * Elimina una orden.
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            await this.ordenService.deleteOrden(id);
            res.status(204).send();
        } catch (error) {
            if ((error as Error).message === 'OrdenNotFound') {
                res.status(404).json({ error: 'Orden no encontrada' });
            } else {
                console.error('Error al eliminar orden:', error);
                res.status(500).json({ error: 'Error al eliminar orden' });
            }
        }
    }
}
