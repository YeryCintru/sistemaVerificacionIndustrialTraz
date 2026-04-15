import { Service } from 'typedi';
import { OrdenRepository } from '../repositories/orden.repository';
import { ProductoRepository } from '../repositories/producto.repository';
import { OrdenProduccion, OrdenCreation } from '../models/ordenes.model';

@Service()
export class OrdenService {
    
    constructor(
        private readonly ordenRepository: OrdenRepository,
        private readonly productoRepository: ProductoRepository
    ) {}

    /**
     * Obtiene el listado de todas las órdenes.
     */
    async getOrdenes(): Promise<any[]> {
        return await this.ordenRepository.findAll();
    }

    /**
     * Obtiene el detalle de una orden específica.
     * @param id ID de la orden.
     */
    async getOrdenById(id: number): Promise<any> {
        const orden = await this.ordenRepository.findById(id);
        if (!orden) {
            throw new Error('OrdenNotFound');
        }
        return orden;
    }

    /**
     * Registra una nueva orden de producción.
     * @param data Datos de la orden.
     */
    async createOrden(data: OrdenCreation): Promise<any> {
        // 1. Validar que el producto existe
        const producto = await this.productoRepository.findById(data.id_producto);
        if (!producto) {
            throw new Error('ProductoNotFound');
        }

        const year = new Date().getFullYear();
        const seq = await this.ordenRepository.getNextSequenceByYear(year);

        if (!data.codigo_ordenProd || !/^ORD-\d{4}-\d+$/.test(data.codigo_ordenProd)) {
            data.codigo_ordenProd = `ORD-${year}-${seq}`;
        }

        if (!data.lote_ordenProd || !/^L-\d{4}-\d+$/.test(data.lote_ordenProd)) {
            data.lote_ordenProd = `L-${year}-${seq}`;
        }

        // 2. Crear la orden
        const id = await this.ordenRepository.create(data);
        
        // 3. Retornar la orden completa
        return await this.ordenRepository.findById(id);
    }

    /**
     * Actualiza una orden de producción existente.
     * @param id ID de la orden.
     * @param data Datos a actualizar.
     */
    async updateOrden(id: number, data: Partial<OrdenProduccion>): Promise<any> {
        // Si se intenta cambiar el producto, validar que existe
        if (data.id_producto) {
            const producto = await this.productoRepository.findById(data.id_producto);
            if (!producto) {
                throw new Error('ProductoNotFound');
            }
        }

        if (data.estado_ordenProd === 'Cerrada') {
            if (!data.fechaCierre_ordenProd) {
                data.fechaCierre_ordenProd = new Date();
            }
        }

        const updated = await this.ordenRepository.update(id, data);
        if (!updated) {
            throw new Error('OrdenNotFound');
        }
        return await this.ordenRepository.findById(id);
    }

    /**
     * Elimina una orden de producción.
     * @param id ID de la orden.
     */
    async deleteOrden(id: number): Promise<void> {
        const deleted = await this.ordenRepository.delete(id);
        if (!deleted) {
            throw new Error('OrdenNotFound');
        }
    }
}
