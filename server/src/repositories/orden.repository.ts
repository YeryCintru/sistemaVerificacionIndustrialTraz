import { Service } from 'typedi';
import pool from '../config/db';
import { OrdenProduccion, OrdenCreation } from '../models/ordenes.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Service()
export class OrdenRepository {

    async findPaginated(
        filters: OrdenFilters,
        page: number,
        limit: number
    ): Promise<{ data: any[]; totalItems: number }> {
        const offset = (page - 1) * limit;
        const { whereSql, params } = buildOrdenWhere(filters);

        // totalItems equivale a COUNT(*) con los mismos filtros
        const countQuery = `
            SELECT COUNT(*) AS totalItems
            FROM Orden_produccion o
            JOIN Producto p ON o.Id_producto = p.Id_producto
            ${whereSql}
        `;
        const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
        const totalItems = Number((countRows[0] as any)?.totalItems ?? 0);

        const selectQuery = `
            SELECT o.*, p.Nombre_producto
            FROM Orden_produccion o
            JOIN Producto p ON o.Id_producto = p.Id_producto
            ${whereSql}
            ORDER BY o.FechaInicio_ordenProd DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(selectQuery, [...params, limit, offset]);

        return { data: rows as any[], totalItems };
    }
    
    /**
     * Obtiene todas las órdenes de producción.
     * @returns Array de órdenes.
     */
    async findAll(): Promise<any[]> {
        // Hacemos un JOIN para traer el nombre del producto relacionado
        const query = `
            SELECT o.*, p.Nombre_producto 
            FROM Orden_produccion o
            JOIN Producto p ON o.Id_producto = p.Id_producto
            ORDER BY o.FechaInicio_ordenProd DESC
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    }

    /**
     * Busca una orden por su ID.
     * @param id ID de la orden.
     * @returns Orden o null.
     */
    async findById(id: number): Promise<any | null> {
        const query = `
            SELECT o.*, p.Nombre_producto 
            FROM Orden_produccion o
            JOIN Producto p ON o.Id_producto = p.Id_producto
            WHERE o.Id_ordenProd = ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Busca una orden por su código.
     * @param codigo Código de la orden.
     * @returns Orden o null.
     */
    async findByCodigo(codigo: string): Promise<any | null> {
        const query = `
            SELECT o.*, p.Nombre_producto 
            FROM Orden_produccion o
            JOIN Producto p ON o.Id_producto = p.Id_producto
            WHERE o.Codigo_ordenProd = ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query, [codigo]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Crea una nueva orden de producción.
     * @param orden Datos de la orden.
     * @returns ID de la orden creada.
     */
    async create(orden: OrdenCreation): Promise<number> {
        const { codigo_ordenProd, lote_ordenProd, cantidad_ordenProd, id_producto, comentarios_ordenProd, fechaCierre_ordenProd } = orden;
        
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO Orden_produccion (Codigo_ordenProd, Lote_ordenProd, Cantidad_ordenProd, Id_producto, Comentarios_ordenProd, FechaCierre_ordenProd) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [codigo_ordenProd, lote_ordenProd, cantidad_ordenProd, id_producto, comentarios_ordenProd || null, fechaCierre_ordenProd || null]
        );

        return result.insertId;
    }

    /**
     * Verifica si existe una orden con el mismo código.
     */
    async existsByCodigo(codigo: string): Promise<boolean> {
        const query = `SELECT 1 FROM Orden_produccion WHERE Codigo_ordenProd = ? LIMIT 1`;
        const [rows] = await pool.query<RowDataPacket[]>(query, [codigo]);
        return rows.length > 0;
    }

    /**
     * Obtiene el siguiente número de secuencia disponible para una orden en un año dado.
     */
    async getNextSequenceByYear(year: number): Promise<number> {
        const query = `
            SELECT MAX(CAST(SUBSTRING_INDEX(Codigo_ordenProd, '-', -1) AS UNSIGNED)) AS max_seq
            FROM Orden_produccion
            WHERE Codigo_ordenProd LIKE ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query, [`ORD-${year}-%`]);
        const maxSeq = (rows[0] as any).max_seq;
        return maxSeq ? Number(maxSeq) + 1 : 1;
    }

    /**
     * Actualiza una orden de producción existente.
     * @param id ID de la orden.
     * @param data Datos a actualizar.
     * @returns Boolean indicando si se modificó alguna fila.
     */
    async update(id: number, data: Partial<OrdenProduccion>): Promise<boolean> {
        const fields = Object.keys(data).map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} = ?`).join(', ');
        const values = Object.values(data);
        
        if (fields.length === 0) return false;

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE Orden_produccion SET ${fields} WHERE Id_ordenProd = ?`,
            [...values, id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Incrementa la cantidad completada de una orden de producción.
     * @param id ID de la orden.
     * @returns Boolean indicando si se modificó alguna fila.
     */
    async incrementCantidadCompletada(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE Orden_produccion SET CantidadCompletada_ordenProd = CantidadCompletada_ordenProd + 1 WHERE Id_ordenProd = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Elimina una orden de producción por su ID.
     * @param id ID de la orden.
     * @returns Boolean indicando si se eliminó alguna fila.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM Orden_produccion WHERE Id_ordenProd = ?', [id]);
        return result.affectedRows > 0;
    }
}

export type OrdenFilters = {
    // Filtro genérico para buscador global
    filtro?: string;
    codigo_ordenProd?: string;
    lote_ordenProd?: string;
    estado_ordenProd?: string;
    codigo_producto?: string;
    fechaInicio_ordenProd?: string;
    fechaCierre_ordenProd?: string;
};

function buildOrdenWhere(filters: OrdenFilters): { whereSql: string; params: any[] } {
    const whereParts: string[] = [];
    const params: any[] = [];

    if (filters.filtro) {
        const like = `%${filters.filtro}%`;
        whereParts.push(`
            (o.Codigo_ordenProd LIKE ?
            OR o.Lote_ordenProd LIKE ?
            OR o.Estado_ordenProd LIKE ?
            OR p.Codigo_producto LIKE ?)
        `);
        params.push(like, like, like, like);
    }

    if (filters.codigo_ordenProd) {
        whereParts.push('o.Codigo_ordenProd = ?');
        params.push(filters.codigo_ordenProd);
    }

    if (filters.lote_ordenProd) {
        whereParts.push('o.Lote_ordenProd = ?');
        params.push(filters.lote_ordenProd);
    }

    if (filters.estado_ordenProd) {
        whereParts.push('o.Estado_ordenProd = ?');
        params.push(filters.estado_ordenProd);
    }

    if (filters.codigo_producto) {
        whereParts.push('p.Codigo_producto LIKE ?');
        params.push(`%${filters.codigo_producto}%`);
    }

    if (filters.fechaInicio_ordenProd) {
        whereParts.push('o.FechaInicio_ordenProd LIKE ?');
        // Permite filtrar por prefijo (p.ej. YYYY-MM)
        params.push(`${filters.fechaInicio_ordenProd}%`);
    }

    if (filters.fechaCierre_ordenProd) {
        whereParts.push('o.FechaCierre_ordenProd LIKE ?');
        params.push(`${filters.fechaCierre_ordenProd}%`);
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    return { whereSql, params };
}
