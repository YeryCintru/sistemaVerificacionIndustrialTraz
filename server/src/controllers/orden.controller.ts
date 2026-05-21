import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { OrdenService } from '../services/orden.service';
import { authMiddleware } from '../middleware/auth.middleware';

@Service()
export class OrdenController {
    private ordenRouter = Router();

    constructor(
        private readonly ordenService: OrdenService
    ) {
        this.ordenRouter.get('/', this.getAll.bind(this));
        this.ordenRouter.get('/codigo/:codigo', this.getByCodigo.bind(this));
        this.ordenRouter.get('/:id', this.getById.bind(this));
        this.ordenRouter.post('/', authMiddleware, this.create.bind(this));
        this.ordenRouter.put('/:id', authMiddleware, this.update.bind(this));
        this.ordenRouter.patch('/:id/estado', authMiddleware, this.updateEstado.bind(this));
        this.ordenRouter.patch('/:id/cantidad', authMiddleware, this.updateCantidadTotal.bind(this));
        this.ordenRouter.post('/:id/verificar', authMiddleware, this.verificar.bind(this));
        this.ordenRouter.delete('/:id', authMiddleware, this.delete.bind(this));
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
     * GET /codigo/:codigo
     * Detalle de una orden por código.
     */
    async getByCodigo(req: Request, res: Response): Promise<void> {
        try {
            //Corregir posible error de tipo en req.params.codigo
            const codigo = Array.isArray(req.params.codigo) ? req.params.codigo[0] : req.params.codigo;
            const orden = await this.ordenService.getOrdenByCodigo(codigo);
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
     * PATCH /:id/estado
     * Actualiza únicamente el estado de una orden.
     */
    async updateEstado(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const { estado_ordenProd } = req.body;

            if (!estado_ordenProd) {
                res.status(400).json({ error: 'El campo estado_ordenProd es obligatorio' });
                return;
            }

            const updatedOrden = await this.ordenService.updateEstado(id, estado_ordenProd);
            res.status(200).json(updatedOrden);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'OrdenNotFound') {
                res.status(404).json({ error: 'Orden no encontrada' });
            } else {
                console.error('Error al actualizar el estado de la orden:', error);
                res.status(400).json({ error: 'Error al actualizar el estado de la orden' });
            }
        }
    }

    /**
     * PATCH /:id/cantidad
     * Actualiza la cantidad total de una orden.
     */
    async updateCantidadTotal(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const { cantidad_ordenProd } = req.body;

            if (cantidad_ordenProd === undefined) {
                res.status(400).json({ error: 'El campo cantidad_ordenProd es obligatorio' });
                return;
            }

            const updatedOrden = await this.ordenService.updateCantidadTotal(id, Number(cantidad_ordenProd));
            res.status(200).json(updatedOrden);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'OrdenNotFound') {
                res.status(404).json({ error: 'Orden no encontrada' });
            } else if (msg === 'OrdenYaCerrada') {
                res.status(400).json({ error: 'No se puede modificar una orden cerrada' });
            } else {
                console.error('Error al actualizar la cantidad de la orden:', error);
                res.status(400).json({ error: 'Error al actualizar la cantidad de la orden' });
            }
        }
    }

    /**
     * POST /:id/verificar
     * Registra una verificación de pieza.
     */
    async verificar(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const { resultado, idOperario, comentarios } = req.body;

            if (!resultado) {
                res.status(400).json({ error: 'El campo resultado es obligatorio' });
                return;
            }

            const updatedOrden = await this.ordenService.verificarOrden(id, resultado, idOperario, comentarios);
            res.status(200).json(updatedOrden);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'OrdenNotFound') {
                res.status(404).json({ error: 'Orden no encontrada' });
            } else if (msg === 'OrdenYaCerrada') {
                res.status(400).json({ error: 'No se puede verificar una orden cerrada' });
            } else {
                console.error('Error al realizar la verificación:', error);
                res.status(400).json({ error: 'Error al realizar la verificación' });
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
