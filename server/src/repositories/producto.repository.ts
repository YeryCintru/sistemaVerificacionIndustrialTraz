import { Service } from 'typedi';
import pool from '../config/db';
import { Producto, ProductoCreation } from '../models/productos.model';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

@Service()
export class ProductoRepository {

    async findPaginated(
        filters: ProductoFilters,
        page: number,
        limit: number
    ): Promise<{ data: Producto[]; totalItems: number }> {
        const offset = (page - 1) * limit;
        const { whereSql, params } = buildProductoWhere(filters);

        const countQuery = `
            SELECT COUNT(*) AS totalItems
            FROM Producto
            ${whereSql}
        `;
        const [countRows] = await pool.query<RowDataPacket[]>(countQuery, params);
        const totalItems = Number((countRows[0] as any)?.totalItems ?? 0);

        const selectQuery = `
            SELECT *
            FROM Producto
            ${whereSql}
            ORDER BY FechaCreacion_producto DESC
            LIMIT ? OFFSET ?
        `;
        const [rows] = await pool.query<RowDataPacket[]>(selectQuery, [...params, limit, offset]);

        return { data: rows as Producto[], totalItems };
    }
    
    /**
     * Obtiene todos los productos de la base de datos.
     * @returns Array de productos.
     */
    async findAll(): Promise<Producto[]> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Producto');
        return rows as Producto[];
    }

    /**
     * Crea un nuevo producto en la base de datos.
     * @param producto Datos del nuevo producto.
     * @returns El ID del producto creado.
     */
    async create(producto: ProductoCreation): Promise<number> {
        const { codigo_producto, nombre_producto, estado_producto, verificador_producto, documentacion_producto } = producto;
        
        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO Producto (Codigo_producto, Nombre_producto, Estado_producto, Verificador_producto, Documentacion_producto) 
             VALUES (?, ?, ?, ?, ?)`,
            [codigo_producto, nombre_producto, estado_producto || 'Correcto', verificador_producto || null, documentacion_producto || null]
        );

        return result.insertId;
    }

    /**
     * Verifica si existe un producto con el mismo código.
     */
    async existsByCodigo(codigo: string): Promise<boolean> {
        const query = `SELECT 1 FROM Producto WHERE Codigo_producto = ? LIMIT 1`;
        const [rows] = await pool.query<RowDataPacket[]>(query, [codigo]);
        return rows.length > 0;
    }

    /**
     * Obtiene el siguiente número de secuencia para el código de producto.
     */
    async getNextSequence(): Promise<number> {
        const query = `
            SELECT MAX(CAST(SUBSTRING_INDEX(Codigo_producto, '-', -1) AS UNSIGNED)) AS max_seq
            FROM Producto
            WHERE Codigo_producto LIKE 'PROD-%'
        `;
        const [rows] = await pool.query<RowDataPacket[]>(query);
        const maxSeq = (rows[0] as any).max_seq;
        return maxSeq ? Number(maxSeq) + 1 : 1;
    }

    /**
     * Busca un producto por su código.
     * @param codigo Código del producto.
     * @returns Producto o null.
     */
    async findByCode(codigo: string): Promise<Producto | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Producto WHERE Codigo_producto = ?', [codigo]);
        return rows.length > 0 ? (rows[0] as Producto) : null;
    }

    /**
     * Busca un producto por su ID.
     * @param id ID del producto.
     * @returns Producto o null.
     */
    async findById(id: number): Promise<Producto | null> {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM Producto WHERE Id_producto = ?', [id]);
        return rows.length > 0 ? (rows[0] as Producto) : null;
    }

    /**
     * Actualiza un producto existente.
     * @param id ID del producto.
     * @param data Datos a actualizar.
     * @returns Boolean indicando si se modificó alguna fila.
     */
    async update(id: number, data: Partial<ProductoCreation>): Promise<boolean> {
        const fields = Object.keys(data).map(key => `${key.charAt(0).toUpperCase() + key.slice(1)} = ?`).join(', ');
        const values = Object.values(data);
        
        if (fields.length === 0) return false;

        const [result] = await pool.query<ResultSetHeader>(
            `UPDATE Producto SET ${fields} WHERE Id_producto = ?`,
            [...values, id]
        );

        return result.affectedRows > 0;
    }

    /**
     * Elimina un producto por su ID.
     * @param id ID del producto.
     * @returns Boolean indicando si se eliminó alguna fila.
     */
    async delete(id: number): Promise<boolean> {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM Producto WHERE Id_producto = ?', [id]);
        return result.affectedRows > 0;
    }
}

export type ProductoFilters = {
    filtro?: string;
    codigo_producto?: string;
    nombre_producto?: string;
    estado_producto?: string;
    verificador_producto?: string;
    fechaCreacion_producto?: string;
};

function buildProductoWhere(filters: ProductoFilters): { whereSql: string; params: any[] } {
    const whereParts: string[] = [];
    const params: any[] = [];

    if (filters.filtro) {
        const like = `%${filters.filtro}%`;
        whereParts.push(`
            (Codigo_producto LIKE ?
            OR Nombre_producto LIKE ?
            OR Estado_producto LIKE ?
            OR Verificador_producto LIKE ?)
        `);
        params.push(like, like, like, like);
    }

    if (filters.codigo_producto) {
        whereParts.push('Codigo_producto LIKE ?');
        params.push(`%${filters.codigo_producto}%`);
    }

    if (filters.nombre_producto) {
        whereParts.push('Nombre_producto LIKE ?');
        params.push(`%${filters.nombre_producto}%`);
    }

    if (filters.estado_producto) {
        whereParts.push('Estado_producto = ?');
        params.push(filters.estado_producto);
    }

    if (filters.verificador_producto) {
        whereParts.push('Verificador_producto LIKE ?');
        params.push(`%${filters.verificador_producto}%`);
    }

    if (filters.fechaCreacion_producto) {
        whereParts.push('FechaCreacion_producto LIKE ?');
        params.push(`${filters.fechaCreacion_producto}%`);
    }

    const whereSql = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';
    return { whereSql, params };
}
