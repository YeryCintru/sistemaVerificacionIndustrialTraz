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
            SELECT a.*, o.Nombre_operario, op.Lote_ordenProd 
            FROM Auditoria a
            LEFT JOIN Operario o ON a.Id_operario = o.Id_operario
            LEFT JOIN Orden_produccion op ON a.Id_ordenProd = op.Id_ordenProd
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
        const { accion_log, resultado_log, comentarios_log, id_operario, id_ordenProd } = log;
        
        // Generamos un número de log único simple (LOG-timestamp)
        const numero_log = `LOG-${Date.now()}`;

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO Auditoria (Numero_log, Accion_log, Resultado_log, Comentarios_log, Id_operario, Id_ordenProd) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [numero_log, accion_log, resultado_log, comentarios_log || null, id_operario || null, id_ordenProd || null]
        );

        return result.insertId;
    }

    /**
     * Busca un log por su ID.
     */
    async findById(id: number): Promise<any | null> {
        const query = `
            SELECT a.*, o.Nombre_operario, op.Lote_ordenProd 
            FROM Auditoria a
            LEFT JOIN Operario o ON a.Id_operario = o.Id_operario
            LEFT JOIN Orden_produccion op ON a.Id_ordenProd = op.Id_ordenProd
            WHERE a.Id_log = ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
}
