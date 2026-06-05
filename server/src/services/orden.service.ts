import { Service } from 'typedi';
import { OrdenRepository } from '../repositories/orden.repository';
import { ProductoRepository } from '../repositories/producto.repository';
import { AuditService } from './audit.service';
import { SocketService } from './socket.service';
import { OrdenProduccion, OrdenCreation } from '../models/ordenes.model';
import { PaginationResult, getQueryNumber, getQueryString, parsePageLimit } from '../utils/pagination';
import { OrdenFilters } from '../repositories/orden.repository';

@Service()
export class OrdenService {

    constructor(
        private readonly ordenRepository: OrdenRepository,
        private readonly productoRepository: ProductoRepository,
        private readonly auditService: AuditService,
        private readonly socketService: SocketService
    ) { }

    /**
     * Obtiene el listado de todas las órdenes.
     */
    async getOrdenes(): Promise<any[]> {
        return await this.ordenRepository.findAll();
    }

    async getOrdenesPaginated(query: any): Promise<PaginationResult<any>> {
        const { page, limit } = parsePageLimit(query);

        // Construimos una estructura de filtros “limpia” desde query params
        const filters: OrdenFilters = {
            filtro: getQueryString(query, 'filtro'),
            codigo_ordenProd: getQueryString(query, 'codigo_ordenProd'),
            lote_ordenProd: getQueryString(query, 'lote_ordenProd'),
            estado_ordenProd: getQueryString(query, 'estado_ordenProd'),
            codigo_producto: getQueryString(query, 'codigo_producto'),
            fechaInicio_ordenProd: getQueryString(query, 'fechaInicio_ordenProd'),
            fechaCierre_ordenProd: getQueryString(query, 'fechaCierre_ordenProd')
        };

        const { data, totalItems } = await this.ordenRepository.findPaginated(filters, page, limit);
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

        return {
            data,
            totalItems,
            totalPages,
            currentPage: page
        };
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
     * @param requestingOperario Operario que realiza la acción
     */
    async createOrden(data: OrdenCreation, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<any> {
        // Validar permisos: Solo Admin y Supervisor pueden crear
        if (requestingOperario.Rol_operario !== 'Admin' && requestingOperario.Rol_operario !== 'Supervisor') {
            throw new Error('UnauthorizedAccessError');
        }

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
            id_operario: requestingOperario.Id_operario,
            id_ordenProd: id
        });

        return newOrden;
    }

    /**
     * Actualiza una orden de producción existente.
     * @param id ID de la orden.
     * @param data Datos a actualizar.
     * @param requestingOperario Operario que realiza la acción
     */
    async updateOrden(id: number, data: Partial<OrdenProduccion>, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<any> {
        // Validar permisos: Solo Admin y Supervisor pueden actualizar
        if (requestingOperario.Rol_operario !== 'Admin' && requestingOperario.Rol_operario !== 'Supervisor') {
            throw new Error('UnauthorizedAccessError');
        }

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
            id_operario: requestingOperario.Id_operario,
            id_ordenProd: id
        });

        return updatedOrden;
    }

    /**
     * Actualiza únicamente el estado de una orden de producción.
     * Aplica lógica de negocio: si el estado es 'Cerrada' fija la fecha de cierre.
     * @param id ID de la orden.
     * @param estado_ordenProd Nuevo estado.
     * @param requestingOperario Operario que realiza la acción
     */
    async updateEstado(id: number, estado_ordenProd: string, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<any> {
        // Validar permisos: Solo Admin y Supervisor pueden actualizar estado
        if (requestingOperario.Rol_operario !== 'Admin' && requestingOperario.Rol_operario !== 'Supervisor') {
            throw new Error('UnauthorizedAccessError');
        }

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
            id_operario: requestingOperario.Id_operario,
            id_ordenProd: id
        });

        // Enviar a través de WebSockets (solo a la sala de esta orden)
        this.socketService.toRoom(`order_${id}`, 'estadoOrdenActualizado', ordenActualizada);

        return ordenActualizada;
    }

    /**
     * Actualiza la cantidad total de una orden de producción.
     * @param id ID de la orden.
     * @param cantidadTotal Nueva cantidad total.
     * @param requestingOperario Operario que realiza la acción
     */
    async updateCantidadTotal(id: number, cantidadTotal: number, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<any> {
        // Validar permisos: Solo Admin y Supervisor pueden actualizar cantidad
        if (requestingOperario.Rol_operario !== 'Admin' && requestingOperario.Rol_operario !== 'Supervisor') {
            throw new Error('UnauthorizedAccessError');
        }

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
            id_operario: requestingOperario.Id_operario,
            id_ordenProd: id
        });

        // Enviar a través de WebSockets (solo a la sala de esta orden)
        this.socketService.toRoom(`order_${id}`, 'cantidadOrdenCambiada', ordenActualizada);

        return ordenActualizada;
    }

    /**
     * Registra el resultado de una verificación para una orden de producción.
     * @param id ID de la orden.
     * @param resultado Resultado de la verificación ('Correcto' o 'Incorrecto').
     * @param requestingOperario Operario que realiza la verificación
     * @param comentarios Comentarios adicionales.
     */
    async verificarOrden(id: number, resultado: string, requestingOperario: { Id_operario: number, Rol_operario: string }, comentarios?: string): Promise<any> {
        // Validar permisos: Todos pueden verificar (Admin, Supervisor, Operario)
        if (requestingOperario.Rol_operario !== 'Admin' && requestingOperario.Rol_operario !== 'Supervisor' && requestingOperario.Rol_operario !== 'Operario') {
            throw new Error('UnauthorizedAccessError');
        }

        const ordenExistente = await this.ordenRepository.findById(id);
        if (!ordenExistente) {
            throw new Error('OrdenNotFound');
        }

        // Si esta cerrada no se puede verificar
        if (ordenExistente.Estado_ordenProd === 'Cerrada') {
            throw new Error('OrdenYaCerrada');
        }

        // Si esta pendiente no se puede verificar
        if (ordenExistente.Estado_ordenProd === 'Pendiente') {
            throw new Error('OrdenPendiente');
        }

        const numeroPieza = (ordenExistente.CantidadCompletada_ordenProd || 0) + 1;
        let ordenActualizada = ordenExistente;

        if (resultado === 'Correcto') {
            // Incrementar cantidad
            await this.ordenRepository.incrementCantidadCompletada(id);
            ordenActualizada = await this.ordenRepository.findById(id);

            // Verificar si se ha completado la orden
            if (ordenActualizada.CantidadCompletada_ordenProd >= ordenActualizada.Cantidad_ordenProd) {
                // Enviar a través de WebSockets (solo a la sala de esta orden)
                this.socketService.toRoom(`order_${id}`, 'ordenCompletada', ordenActualizada);
                throw new Error('CantidadCompletaOrden');
            }
        }

        // Registrar en auditoría usando la nueva función para el comentario
        await this.auditService.logAction({
            accion_log: 'Verificación de pieza',
            resultado_log: resultado,
            comentarios_log: comentarios || this.formatearComentarioVerificacion(numeroPieza, resultado),
            id_operario: requestingOperario.Id_operario,
            id_ordenProd: id
        });

        // Enviar a través de WebSockets (solo a la sala de esta orden)
        this.socketService.toRoom(`order_${id}`, 'ordenActualizada', ordenActualizada);

        return ordenActualizada;
    }

    /**
     * Elimina una orden de producción.
     * @param id ID de la orden.
     * @param requestingOperario Operario que realiza la acción
     */
    async deleteOrden(id: number, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<void> {
        // Validar permisos: Solo Admin puede eliminar
        if (requestingOperario.Rol_operario !== 'Admin') {
            throw new Error('UnauthorizedAccessError');
        }

        const deleted = await this.ordenRepository.delete(id);
        if (!deleted) {
            throw new Error('OrdenNotFound');
        }

        await this.auditService.logAction({
            accion_log: 'Eliminar orden',
            resultado_log: 'Éxito',
            comentarios_log: `ID: ${id}`,
            id_operario: requestingOperario.Id_operario,
            id_ordenProd: id
        });
    }

    /**
     * Genera un comentario estandarizado para el log de verificación.
     */
    private formatearComentarioVerificacion(numero: number, resultado: string): string {
        const accion = resultado === 'Correcto' ? 'Verificada' : 'Rechazada';
        return `${accion} pieza nº ${numero}. Resultado: ${resultado}`;
    }
}
