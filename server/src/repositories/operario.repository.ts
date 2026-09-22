import { Service } from 'typedi';
import pool from '../config/db';
import { Operario, OperarioCreation } from '../models/operario.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export interface OperarioFilters {
    filtro?: string;
    nombre_operario?: string;
    rol_operario?: string;
}

@Service()
export class OperarioRepository {
    
    /**
     * Obtiene todos los operarios.
     * @returns Array de operarios (sin la clave por seguridad).
     */
    async findAll(): Promise<Omit<Operario, 'Clave_operario'>[]> {
        const query = 'SELECT Id_operario, Nombre_operario, Rol_operario FROM Operario';
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows as Omit<Operario, 'Clave_operario'>[];
    }

    async findPaginated(filters: OperarioFilters, page: number, limit: number): Promise<{ data: Omit<Operario, 'Clave_operario'>[], totalItems: number }> {
        const { whereSql, params } = buildOperarioWhere(filters);

        const countQuery = `SELECT COUNT(*) as total FROM Operario ${whereSql}`;
        const [countResult] = await pool.query<RowDataPacket[]>(countQuery, params);
        const totalItems = countResult[0].total as number;

        let baseQuery = `SELECT Id_operario, Nombre_operario, Rol_operario FROM Operario ${whereSql} ORDER BY Id_operario DESC`;
        
        if (limit > 0) {
            const offset = (page - 1) * limit;
            baseQuery += ' LIMIT ? OFFSET ?';
            const [rows] = await pool.query<RowDataPacket[]>(baseQuery, [...params, limit, offset]);
            return {
                data: rows as Omit<Operario, 'Clave_operario'>[],
                totalItems
            };
        } else {
            const [rows] = await pool.query<RowDataPacket[]>(baseQuery, params);
            return {
                data: rows as Omit<Operario, 'Clave_operario'>[],
                totalItems
            };
        }
    }

    /**
     * Busca un operario por su nombre (para login o validación).
     * @param nombre Nombre del operario.
     * @returns Operario completo o null.
     */
    async findByNombre(nombre: string): Promise<Operario | null> {
        const query = 'SELECT * FROM Operario WHERE Nombre_operario = ?';
        const [rows] = await pool.query<RowDataPacket[]>(query, [nombre]);
        return rows.length > 0 ? (rows[0] as Operario) : null;
    }

    /**
     * Crea un nuevo operario.
     * @param operario Datos del operario.
     * @returns ID del operario creado.
     */
    async create(operario: OperarioCreation): Promise<number> {
        const { Nombre_operario, Clave_operario, Rol_operario } = operario;
        
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Operario (Nombre_operario, Clave_operario, Rol_operario) VALUES (?, ?, ?)',
            [Nombre_operario, Clave_operario, Rol_operario]
        );

        return result.insertId;
    }

    /**
     * Busca un operario por ID.
     */
    async findById(id: number): Promise<Omit<Operario, 'Clave_operario'> | null> {
        const query = 'SELECT Id_operario, Nombre_operario, Rol_operario FROM Operario WHERE Id_operario = ?';
        const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? (rows[0] as Omit<Operario, 'Clave_operario'>) : null;
    }

}

function buildOperarioWhere(filters: OperarioFilters): { whereSql: string; params: any[] } {
    const whereParts: string[] = [];
    const params: any[] = [];

    if (filters.filtro) {
        whereParts.push('(Nombre_operario LIKE ? OR Rol_operario LIKE ?)');
        const f = `%${filters.filtro}%`;
        params.push(f, f);
    }

    if (filters.nombre_operario) {
        whereParts.push('Nombre_operario LIKE ?');
        params.push(`%${filters.nombre_operario}%`);
    }

    if (filters.rol_operario) {
        whereParts.push('Rol_operario = ?');
        params.push(filters.rol_operario);
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    return { whereSql, params };
}
