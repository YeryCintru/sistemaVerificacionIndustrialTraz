import { Service } from 'typedi';
import { OrdenRepository } from '../repositories/orden.repository';
import { ProductoRepository } from '../repositories/producto.repository';
import { AuditService } from './audit.service';
import { OrdenProduccion, OrdenCreation } from '../models/ordenes.model';

@Service()
export class OrdenService {

    constructor(
        private readonly ordenRepository: OrdenRepository,
        private readonly productoRepository: ProductoRepository,
        private readonly auditService: AuditService
    ) { }

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
     * Obtiene el detalle de una orden específica por su código.
     * @param codigo Código de la orden.
     */
    async getOrdenByCodigo(codigo: string): Promise<any> {
        const orden = await this.ordenRepository.findByCodigo(codigo);
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
        //Validar que el producto existe
        const producto = await this.productoRepository.findById(data.id_producto);
        if (!producto) {
            throw new Error('ProductoNotFound');
        }

        const year = new Date().getFullYear();
        let seq = await this.ordenRepository.getNextSequenceByYear(year);

        //Lógica para validar el código de orden y lote, si no son válidos o ya existen, se generan automáticamente
        const isCodigoValid = data.codigo_ordenProd && /^ORD-\d{4}-\d+$/.test(data.codigo_ordenProd);
        const isCodigoDuplicate = isCodigoValid && await this.ordenRepository.existsByCodigo(data.codigo_ordenProd!);

        if (!isCodigoValid || isCodigoDuplicate) {
            data.codigo_ordenProd = `ORD-${year}-${seq}`;
        }

        if (!data.lote_ordenProd || !/^L-\d{4}-\d+$/.test(data.lote_ordenProd)) {
            data.lote_ordenProd = `L-${year}-${seq}`;
        }

        //Crear la orden
        const id = await this.ordenRepository.create(data);
        const newOrden = await this.ordenRepository.findById(id);
        if (!newOrden) {
            throw new Error('No se pudo recuperar la orden creada');
        }

        await this.auditService.logAction({
            accion_log: 'Crear orden',
            resultado_log: 'Éxito',
            comentarios_log: `Código: ${newOrden.Codigo_ordenProd || newOrden.codigo_ordenProd || 'N/A'}`,
            id_ordenProd: id
        });

        return newOrden;
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
        const updatedOrden = await this.ordenRepository.findById(id);
        if (!updatedOrden) {
            throw new Error('InternalError');
        }

        await this.auditService.logAction({
            accion_log: 'Actualizar orden',
            resultado_log: 'Éxito',
            comentarios_log: `ID: ${id}, Código: ${updatedOrden.Codigo_ordenProd || updatedOrden.codigo_ordenProd || 'N/A'}`,
            id_ordenProd: id
        });

        return updatedOrden;
    }

    /**
     * Actualiza únicamente el estado de una orden de producción.
     * Aplica lógica de negocio: si el estado es 'Cerrada' fija la fecha de cierre.
     * @param id ID de la orden.
     * @param estado_ordenProd Nuevo estado.
     */
    async updateEstado(id: number, estado_ordenProd: string): Promise<any> {
        // Verificar que la orden existe antes de intentar modificarla
        const ordenExistente = await this.ordenRepository.findById(id);
        if (!ordenExistente) {
            throw new Error('OrdenNotFound');
        }

        // Si está cerrada no se puede modificar nada mas
        if (ordenExistente.Estado_ordenProd === 'Cerrada' && estado_ordenProd !== 'Cerrada') {
            throw new Error('OrdenYaCerrada');
        }

        // Lógica de negocio: al cerrar la orden se registra la fecha de cierre
        const dataToUpdate: Record<string, any> = { Estado_ordenProd: estado_ordenProd };
        if (estado_ordenProd === 'Cerrada' && !ordenExistente.FechaCierre_ordenProd) {
            dataToUpdate.FechaCierre_ordenProd = new Date();
        }

        // Persistir el cambio y verificar que se aplicó correctamente
        const updated = await this.ordenRepository.update(id, dataToUpdate);
        if (!updated) {
            throw new Error('InternalError');
        }

        // Obtener el objeto actualizado para devolverlo (no el viejo)
        const ordenActualizada = await this.ordenRepository.findById(id);

        await this.auditService.logAction({
            accion_log: 'Actualizar estado orden',
            resultado_log: 'Éxito',
            comentarios_log: `ID: ${id}, Estado anterior: ${ordenExistente.Estado_ordenProd},  Nuevo: ${estado_ordenProd}`,
            id_ordenProd: id
        });

        return ordenActualizada;
    }

    /**
     * Actualiza la cantidad total de una orden de producción.
     * @param id ID de la orden.
     * @param cantidadTotal Nueva cantidad total.
     */
    async updateCantidadTotal(id: number, cantidadTotal: number): Promise<any> {
        const ordenExistente = await this.ordenRepository.findById(id);
        if (!ordenExistente) {
            throw new Error('OrdenNotFound');
        }

        if (ordenExistente.Estado_ordenProd === 'Cerrada') {
            throw new Error('OrdenYaCerrada');
        }


        const dataToUpdate: Record<string, any> = { Cantidad_ordenProd: cantidadTotal };

        const updated = await this.ordenRepository.update(id, dataToUpdate);
        if (!updated) {
            throw new Error('InternalError');
        }

        const ordenActualizada = await this.ordenRepository.findById(id);

        await this.auditService.logAction({
            accion_log: 'Actualizar cantidad orden',
            resultado_log: 'Éxito',
            comentarios_log: `ID: ${id}, Cantidad anterior: ${ordenExistente.Cantidad_ordenProd}, Nueva: ${cantidadTotal}`,
            id_ordenProd: id
        });

        return ordenActualizada;
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
