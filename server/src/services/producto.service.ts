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
}
