/**
 * Código desarrollado por Yeray Navascués Trincado
 * Grado en Ingeniería Informática
 * Trabajo de Fin de Grado (TFG) - Sistema de Trazabilidad
 * 2026
 * Ver más información en el archivo README.md
 */
import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

/**
 * Escucha en el puerto configurado.
 */
app.listen(PORT, (): void => {
    console.log('=====================================');
    console.log('Servidor de Trazabilidad Industrial Iniciado por Yeray Navascués Trincado');
    console.log('=====================================');
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
    console.log('=====================================');
});
