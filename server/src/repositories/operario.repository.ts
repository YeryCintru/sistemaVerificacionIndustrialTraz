import { Service } from 'typedi';
import pool from '../config/db';
import { Operario, OperarioCreation } from '../models/operario.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Service()
export class OperarioRepository {
    
    /**
     * Obtiene todos los operarios.
     * @returns Array de operarios (sin la clave por seguridad).
     */
    async findAll(): Promise<Omit<Operario, 'clave_operario'>[]> {
        const query = 'SELECT Id_operario, Nombre_operario, Rol_operario FROM Operario';
        const [rows] = await pool.query<RowDataPacket[]>(query);
        return rows as Omit<Operario, 'clave_operario'>[];
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
        const { nombre_operario, clave_operario, rol_operario } = operario;
        
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO Operario (Nombre_operario, Clave_operario, Rol_operario) VALUES (?, ?, ?)',
            [nombre_operario, clave_operario, rol_operario]
        );

        return result.insertId;
    }

    /**
     * Busca un operario por ID.
     */
    async findById(id: number): Promise<Omit<Operario, 'clave_operario'> | null> {
        const query = 'SELECT Id_operario, Nombre_operario, Rol_operario FROM Operario WHERE Id_operario = ?';
        const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
        return rows.length > 0 ? (rows[0] as Omit<Operario, 'clave_operario'>) : null;
    }

    /**
     * Actualiza un operario existente.
     * @param id ID del operario.
     * @param data Datos a actualizar.
     * @returns Boolean indicando si se modificó alguna fila.
     */
    async update(id: number, data: Partial<Operario>): Promise<boolean> {
        const fields = Object.keys(data).map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} = ?`).join(', ');
        const values = Object.values(data);
        
        if (fields.length === 0) return false;

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE Operario SET ${fields} WHERE Id_operario = ?`,
            [...values, id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Elimina un operario por su ID.
     * @param id ID del operario.
     * @returns Boolean indicando si se eliminó alguna fila.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM Operario WHERE Id_operario = ?', [id]);
        return result.affectedRows > 0;
    }
}
