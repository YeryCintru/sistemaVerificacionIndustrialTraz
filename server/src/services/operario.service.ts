import { Service } from 'typedi';
import { OperarioRepository } from '../repositories/operario.repository';
import { Operario, OperarioCreation } from '../models/operario.model';
import bcrypt from 'bcrypt';

@Service()
export class OperarioService {

    constructor(
        private readonly operarioRepository: OperarioRepository
    ) { }

    /**
     * Recupera la lista de operarios.
     */
    async getOperarios(): Promise<Omit<Operario, 'clave_operario'>[]> {
        return await this.operarioRepository.findAll();
    }

    /**
     * Registra un nuevo operario con clave hasheada.
     * @param data Datos del operario.
     */
    async registerOperario(data: OperarioCreation): Promise<Omit<Operario, 'clave_operario'>> {
        //Verificar si el nombre ya existe
        const existing = await this.operarioRepository.findByNombre(data.nombre_operario);
        if (existing) {
            throw new Error('OperarioAlreadyExists');
        }

        //Hashear la clave
        const saltRounds = 10;
        const hashedClave = await bcrypt.hash(data.clave_operario, saltRounds);

        //Guardar en BD
        const id = await this.operarioRepository.create({
            ...data,
            clave_operario: hashedClave
        });

        //Retornar el operario creado (sin clave)
        const newOperario = await this.operarioRepository.findById(id);
        if (!newOperario) throw new Error('InternalError');

        return newOperario;
    }
}
