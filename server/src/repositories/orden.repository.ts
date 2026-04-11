import { Service } from 'typedi';
import pool from '../config/db';
import { OrdenProduccion, OrdenCreation } from '../models/ordenes.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Service()
export class OrdenRepository {
    
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
     * Crea una nueva orden de producción.
     * @param orden Datos de la orden.
     * @returns ID de la orden creada.
     */
    async create(orden: OrdenCreation): Promise<number> {
        const { lote_ordenProd, cantidad_ordenProd, id_producto, comentarios_ordenProd } = orden;
        
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO Orden_produccion (Lote_ordenProd, Cantidad_ordenProd, Id_producto, Comentarios_ordenProd) 
             VALUES (?, ?, ?, ?)`,
            [lote_ordenProd, cantidad_ordenProd, id_producto, comentarios_ordenProd || null]
        );

        return result.insertId;
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
     * Elimina una orden de producción por su ID.
     * @param id ID de la orden.
     * @returns Boolean indicando si se eliminó alguna fila.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM Orden_produccion WHERE Id_ordenProd = ?', [id]);
        return result.affectedRows > 0;
    }
}
