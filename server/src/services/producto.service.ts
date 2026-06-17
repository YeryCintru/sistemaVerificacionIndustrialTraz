import { Service } from 'typedi';
import { ProductoRepository, ProductoFilters } from '../repositories/producto.repository';
import { AuditService } from './audit.service';
import { Producto, ProductoCreation } from '../models/productos.model';
import { PaginationResult, getQueryString, parsePageLimit } from '../utils/pagination';

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

    async getProductosPaginated(query: any): Promise<PaginationResult<Producto>> {
        const { page, limit } = parsePageLimit(query);

        const filters: ProductoFilters = {
            filtro: getQueryString(query, 'filtro'),
            codigo_producto: getQueryString(query, 'codigo_producto'),
            nombre_producto: getQueryString(query, 'nombre_producto'),
            estado_producto: getQueryString(query, 'estado_producto'),
            verificador_producto: getQueryString(query, 'verificador_producto'),
            fechaCreacion_producto: getQueryString(query, 'fechaCreacion_producto')
        };

        const { data, totalItems } = await this.productoRepository.findPaginated(filters, page, limit);
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

        return { data, totalItems, totalPages, currentPage: page };
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
     * Obtiene un producto por su código.
     * @param codigo Código del producto.
     * @returns Producto encontrado o null.
     */
    async getByCode(codigo: string): Promise<Producto | null> {
        return await this.productoRepository.findByCode(codigo);
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

}
