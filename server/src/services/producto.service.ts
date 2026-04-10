import { Service } from 'typedi';
import { ProductoRepository } from '../repositories/producto.repository';
import { Producto, ProductoCreation } from '../models/productos.model';

@Service()
export class ProductoService {

    constructor(
        private readonly productoRepository: ProductoRepository
    ) { }

    /**
     * Recupera todos los productos registrados.
     * @returns Lista de productos.
     */
    async getProductos(): Promise<Producto[]> {
        return await this.productoRepository.findAll();
    }

    /**
     * Lógica de negocio para crear un nuevo producto.
     * @param data Datos del producto.
     * @returns Producto recién creado.
     */
    async createProducto(data: ProductoCreation): Promise<Producto> {
        const id = await this.productoRepository.create(data);
        const newProducto = await this.productoRepository.findById(id);

        if (!newProducto) {
            throw new Error('No se pudo recuperar el producto creado');
        }

        return newProducto;
    }

    /**
     * Actualiza un producto existente.
     * @param id ID del producto.
     * @param data Datos a actualizar.
     */
    async updateProducto(id: number, data: Partial<ProductoCreation>): Promise<Producto> {
        const updated = await this.productoRepository.update(id, data);
        if (!updated) {
            throw new Error('ProductoNotFound');
        }
        const updatedProducto = await this.productoRepository.findById(id);
        if (!updatedProducto) throw new Error('InternalError');
        return updatedProducto;
    }

    /**
     * Elimina un producto.
     * @param id ID del producto.
     */
    async deleteProducto(id: number): Promise<void> {
        const deleted = await this.productoRepository.delete(id);
        if (!deleted) {
            throw new Error('ProductoNotFound');
        }
    }
}
