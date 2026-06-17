import { Service } from 'typedi';
import pool from '../config/db';
import { AuditLog, AuditLogCreation } from '../models/audit.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

const AUDIT_SELECT_FROM = `
    FROM Auditoria a
    LEFT JOIN Operario o ON a.Id_operario = o.Id_operario
    LEFT JOIN Orden_produccion op ON a.Id_ordenProd = op.Id_ordenProd
    LEFT JOIN Producto p ON a.Id_producto = p.Id_producto
`;

const AUDIT_SELECT_COLUMNS = `
    a.*,
    o.Nombre_operario,
    op.Codigo_ordenProd,
    op.Lote_ordenProd,
    p.Codigo_producto,
    p.Nombre_producto
`;

@Service()
export class AuditRepository {

    async findPaginated(
        filters: AuditFilters,
        page: number,
        limit: number
    ): Promise<{ data: any[]; totalItems: number }> {
        const offset = (page - 1) * limit;
        const { whereSql, params } = buildAuditWhere(filters);

        const countQuery = `
            SELECT COUNT(*) AS totalItems
            ${AUDIT_SELECT_FROM}
            ${whereSql}
        `;
        const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
        const totalItems = Number((countRows[0] as any)?.totalItems ?? 0);

        const selectQuery = `
            SELECT ${AUDIT_SELECT_COLUMNS}
            ${AUDIT_SELECT_FROM}
            ${whereSql}
            ORDER BY a.Momento_log DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(selectQuery, [...params, limit, offset]);

        return { data: rows as any[], totalItems };
    }
    
    /**
     * Obtiene el listado de logs con información legible mediante JOINs.
     * @returns Array de logs detallados.
     */
    async findAll(): Promise<any[]> {
        const query = `
            SELECT ${AUDIT_SELECT_COLUMNS}
            ${AUDIT_SELECT_FROM}
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
            SELECT ${AUDIT_SELECT_COLUMNS}
            ${AUDIT_SELECT_FROM}
            WHERE a.Id_log = ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }

}

export type AuditFilters = {
    filtro?: string;
    fecha?: string;
    momento_log?: string;
    resultado_log?: string;
    accion_log?: string;
    nombre_operario?: string;
    codigo_ordenProd?: string;
    lote_ordenProd?: string;
    codigo_producto?: string;
};

function buildAuditWhere(filters: AuditFilters): { whereSql: string; params: any[] } {
    const whereParts: string[] = [];
    const params: any[] = [];

    const fecha = filters.fecha ?? filters.momento_log;

    if (filters.filtro) {
        const like = `%${filters.filtro}%`;
        whereParts.push(`
            (a.Accion_log LIKE ?
            OR a.Resultado_log LIKE ?
            OR a.Comentarios_log LIKE ?
            OR o.Nombre_operario LIKE ?
            OR op.Codigo_ordenProd LIKE ?
            OR op.Lote_ordenProd LIKE ?
            OR p.Codigo_producto LIKE ?)
        `);
        params.push(like, like, like, like, like, like, like);
    }

    if (fecha) {
        whereParts.push('a.Momento_log LIKE ?');
        params.push(`${fecha}%`);
    }

    if (filters.resultado_log) {
        whereParts.push('a.Resultado_log LIKE ?');
        params.push(`%${filters.resultado_log}%`);
    }

    if (filters.accion_log) {
        whereParts.push('a.Accion_log LIKE ?');
        params.push(`%${filters.accion_log}%`);
    }

    if (filters.nombre_operario) {
        whereParts.push('o.Nombre_operario LIKE ?');
        params.push(`%${filters.nombre_operario}%`);
    }

    if (filters.codigo_ordenProd) {
        whereParts.push('op.Codigo_ordenProd LIKE ?');
        params.push(`%${filters.codigo_ordenProd}%`);
    }

    if (filters.lote_ordenProd) {
        whereParts.push('op.Lote_ordenProd LIKE ?');
        params.push(`%${filters.lote_ordenProd}%`);
    }

    if (filters.codigo_producto) {
        whereParts.push('p.Codigo_producto LIKE ?');
        params.push(`%${filters.codigo_producto}%`);
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    return { whereSql, params };
}
