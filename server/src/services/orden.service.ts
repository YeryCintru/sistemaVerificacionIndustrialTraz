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

        // 2. Crear la orden
        const id = await this.ordenRepository.create(data);
        
        // 3. Retornar la orden completa
        return await this.ordenRepository.findById(id);
    }
}
