import { Service } from 'typedi';
import { ProductoRepository } from '../repositories/producto.repository';
import { AuditService } from './audit.service';
import { Producto, ProductoCreation } from '../models/productos.model';

@Service()
export class ProductoService {

    constructor(
        private readonly productoRepository: ProductoRepository,
        private readonly auditService: AuditService
    ) { }

    /**
     * Recupera todos los productos registrados.
     * @returns Lista de productos.
     */
    async getProductos(): Promise<Producto[]> {
        return await this.productoRepository.findAll();
    }

    /**
     * Obtiene un producto por su ID.
     * @param id ID del producto.
     * @returns Producto encontrado.
     */
    async getById(id: number): Promise<Producto> {
        const producto = await this.productoRepository.findById(id);
        if (!producto) {
            throw new Error('ProductoNotFound');
        }
        return producto;
    }

    /**
     * Lógica de negocio para crear un nuevo producto.
     * @param data Datos del producto.
     * @param requestingOperario Operario que realiza la acción
     * @returns Producto recién creado.
     */
    async createProducto(data: ProductoCreation, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<Producto> {
        // Validar permisos: Solo Admin y Supervisor pueden crear
        if (requestingOperario.Rol_operario !== 'Admin' && requestingOperario.Rol_operario !== 'Supervisor') {
            throw new Error('UnauthorizedAccessError');
        }

        const nextSeq = await this.productoRepository.getNextSequence();

        const isCodigoValid = data.codigo_producto && /^PROD-\d+$/.test(data.codigo_producto);
        const isCodigoDuplicate = isCodigoValid && await this.productoRepository.existsByCodigo(data.codigo_producto!);

        if (!isCodigoValid || isCodigoDuplicate) {
            data.codigo_producto = `PROD-${nextSeq}`;
        }

        const validStates = ['Correcto', 'Bloqueado', 'Baja'] as const;
        if (!data.estado_producto || !validStates.includes(data.estado_producto)) {
            data.estado_producto = 'Correcto';
        }

        const id = await this.productoRepository.create(data);
        const newProducto = await this.productoRepository.findById(id);

        if (!newProducto) {
            throw new Error('No se pudo recuperar el producto creado');
        }

        await this.auditService.logAction({
            accion_log: 'Crear producto',
            resultado_log: 'Éxito',
            comentarios_log: `Código: ${newProducto.codigo_producto || 'N/A'}`,
            id_operario: requestingOperario.Id_operario,
            id_producto: newProducto.id_producto
        });

        return newProducto;
    }

    /**
     * Actualiza un producto existente.
     * @param id ID del producto.
     * @param data Datos a actualizar.
     * @param requestingOperario Operario que realiza la acción
     */
    async updateProducto(id: number, data: Partial<ProductoCreation>, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<Producto> {
        // Validar permisos: Solo Admin y Supervisor pueden actualizar
        if (requestingOperario.Rol_operario !== 'Admin' && requestingOperario.Rol_operario !== 'Supervisor') {
            throw new Error('UnauthorizedAccessError');
        }

        const updated = await this.productoRepository.update(id, data);
        if (!updated) {
            throw new Error('ProductoNotFound');
        }
        const updatedProducto = await this.productoRepository.findById(id);
        if (!updatedProducto) throw new Error('InternalError');

        await this.auditService.logAction({
            accion_log: 'Actualizar producto',
            resultado_log: 'Éxito',
            comentarios_log: `ID: ${id}, Código: ${updatedProducto.codigo_producto}`,
            id_operario: requestingOperario.Id_operario,
            id_producto: id
        });

        return updatedProducto;
    }

    /**
     * Elimina un producto.
     * @param id ID del producto.
     * @param requestingOperario Operario que realiza la acción
     */
    async deleteProducto(id: number, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<void> {
        // Validar permisos: Solo Admin puede eliminar
        if (requestingOperario.Rol_operario !== 'Admin') {
            throw new Error('UnauthorizedAccessError');
        }

        const deleted = await this.productoRepository.delete(id);
        if (!deleted) {
            throw new Error('ProductoNotFound');
        }

        await this.auditService.logAction({
            accion_log: 'Eliminar producto',
            resultado_log: 'Éxito',
            comentarios_log: `ID: ${id}`,
            id_operario: requestingOperario.Id_operario,
            id_producto: id
        });
    }
}
