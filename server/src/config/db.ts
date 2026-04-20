import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración del pool de conexiones para MySQL.
 */
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'trazabilidad_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Comprobar la conexión al iniciar el módulo para asegurar la disponibilidad de la BD
pool.getConnection()
    .then(connection => {
        console.log('Conexión a la base de datos MySQL establecida (Pool listo).');
        connection.release();
    })
    .catch(err => {
        console.error('Fallo al conectar con MySQL. Se recomienda verificar el estado del servidor de base de datos.');
        console.error('Detalles del error:', err.message);
    });

export default pool;
