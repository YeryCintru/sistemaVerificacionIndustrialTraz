import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { ProductoService } from '../services/producto.service';
import { authMiddleware } from '../middleware/auth.middleware';

@Service()
export class ProductoController {
    private productoRouter = Router();

    constructor(
        private readonly productoService: ProductoService
    ) {
        this.productoRouter.get('/', this.getAll.bind(this));
        this.productoRouter.get('/:id', this.getById.bind(this));
        this.productoRouter.post('/', authMiddleware, this.create.bind(this));
        this.productoRouter.put('/:id', authMiddleware, this.update.bind(this));
        this.productoRouter.delete('/:id', authMiddleware, this.delete.bind(this));
    }

    /**
     * Devuelve el router configurado.
     */
    getRouter(): Router {
        return this.productoRouter;
    }

    /**
     * Endpoint GET /
     * Obtiene la lista de todos los productos.
     */
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const productos = await this.productoService.getProductos();
            res.status(200).json(productos);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            res.status(500).json({ error: 'Error interno del servidor al listar productos' });
        }
    }

    /**
     * Endpoint POST /
     * Registra un nuevo producto.
     */
    async create(req: Request, res: Response): Promise<void> {
        try {
            const productoData = req.body;
            const requestingOperario = {
                Id_operario: (req as any).operario.Id_operario,
                Rol_operario: (req as any).operario.Rol_operario
            };
            const newProducto = await this.productoService.createProducto(productoData, requestingOperario);
            res.status(201).json(newProducto);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'UnauthorizedAccessError') {
                res.status(403).json({ error: 'No tienes permisos para crear productos' });
            } else if ((error as any).code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: 'Ya existe un producto con ese código único' });
            } else {
                console.error('Error al crear producto:', error);
                res.status(400).json({ error: 'Datos de producto inválidos o error en el proceso' });
            }
        }
    }

    /**
     * Endpoint PUT /:id
     * Actualiza un producto existente.
     */
    async update(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const data = req.body;
            const requestingOperario = {
                Id_operario: (req as any).operario.Id_operario,
                Rol_operario: (req as any).operario.Rol_operario
            };
            const updatedProducto = await this.productoService.updateProducto(id, data, requestingOperario);
            res.status(200).json(updatedProducto);
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'UnauthorizedAccessError') {
                res.status(403).json({ error: 'No tienes permisos para actualizar productos' });
            } else if (msg === 'ProductoNotFound') {
                res.status(404).json({ error: 'Producto no encontrado' });
            } else {
                console.error('Error al actualizar producto:', error);
                res.status(400).json({ error: 'Error al actualizar producto' });
            }
        }
    }

    /**
     * Endpoint GET /:id
     * Obtiene un producto por su ID.
     */
    async getById(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const producto = await this.productoService.getById(id);
            res.status(200).json(producto);
        } catch (error) {
            if ((error as Error).message === 'ProductoNotFound') {
                res.status(404).json({ error: 'Producto no encontrado' });
            } else {
                console.error('Error al obtener producto:', error);
                res.status(400).json({ error: 'Error al obtener producto' });
            }
        }
    }

    /**
     * Endpoint DELETE /:id
     * Elimina un producto.
     */
    async delete(req: Request, res: Response): Promise<void> {
        try {
            const id = Number(req.params.id);
            const requestingOperario = {
                Id_operario: (req as any).operario.Id_operario,
                Rol_operario: (req as any).operario.Rol_operario
            };
            await this.productoService.deleteProducto(id, requestingOperario);
            res.status(204).send();
        } catch (error) {
            const msg = (error as Error).message;
            if (msg === 'UnauthorizedAccessError') {
                res.status(403).json({ error: 'No tienes permisos para eliminar productos' });
            } else if (msg === 'ProductoNotFound') {
                res.status(404).json({ error: 'Producto no encontrado' });
            } else if ((error as any).code === 'ER_ROW_IS_REFERENCED_2') {
                res.status(409).json({ error: 'No se puede eliminar el producto porque tiene órdenes asociadas' });
            } else {
                console.error('Error al eliminar producto:', error);
                res.status(500).json({ error: 'Error al eliminar producto' });
            }
        }
    }
}
