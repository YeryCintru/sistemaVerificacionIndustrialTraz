import { Service } from 'typedi';
import pool from '../config/db';
import { AuditLog, AuditLogCreation } from '../models/audit.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Service()
export class AuditRepository {
    
    /**
     * Obtiene el listado de logs con información legible mediante JOINs.
     * @returns Array de logs detallados.
     */
    async findAll(): Promise<any[]> {
        const query = `
            SELECT a.*, o.Nombre_operario, op.Lote_ordenProd, p.Nombre_producto 
            FROM Auditoria a
            LEFT JOIN Operario o ON a.Id_operario = o.Id_operario
            LEFT JOIN Orden_produccion op ON a.Id_ordenProd = op.Id_ordenProd
            LEFT JOIN Producto p ON a.Id_producto = p.Id_producto
            ORDER BY a.Momento_log DESC
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows;
    }

    /**
     * Crea un nuevo registro de auditoría.
     * @param log Datos del log.
     * @returns ID del log creado.
     */
    async create(log: AuditLogCreation): Promise<number> {
        const { accion_log, resultado_log, comentarios_log, id_operario, id_ordenProd, id_producto } = log;
        
        // Generamos un número de log único simple (LOG-timestamp)
        const numero_log = `LOG-${Date.now()}`;

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO Auditoria (Numero_log, Accion_log, Resultado_log, Comentarios_log, Id_operario, Id_ordenProd, Id_producto) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [numero_log, accion_log, resultado_log, comentarios_log || null, id_operario || null, id_ordenProd || null, id_producto || null]
        );

        return result.insertId;
    }

    /**
     * Busca un log por su ID.
     */
    async findById(id: number): Promise<any | null> {
        const query = `
            SELECT a.*, o.Nombre_operario, op.Lote_ordenProd, p.Nombre_producto 
            FROM Auditoria a
            LEFT JOIN Operario o ON a.Id_operario = o.Id_operario
            LEFT JOIN Orden_produccion op ON a.Id_ordenProd = op.Id_ordenProd
            LEFT JOIN Producto p ON a.Id_producto = p.Id_producto
            WHERE a.Id_log = ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

    /**
     * Actualiza un registro de auditoría existente.
     * @param id ID del log.
     * @param data Datos a actualizar.
     * @returns Boolean indicando si se modificó alguna fila.
     */
    async update(id: number, data: Partial<AuditLog>): Promise<boolean> {
        const fields = Object.keys(data).map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} = ?`).join(', ');
        const values = Object.values(data);
        
        if (fields.length === 0) return false;

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE Auditoria SET ${fields} WHERE Id_log = ?`,
            [...values, id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Elimina un registro de auditoría por su ID.
     * @param id ID del log.
     * @returns Boolean indicando si se eliminó alguna fila.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM Auditoria WHERE Id_log = ?', [id]);
        return result.affectedRows > 0;
    }
}
