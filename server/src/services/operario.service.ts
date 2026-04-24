import { Service } from 'typedi';
import { OperarioRepository } from '../repositories/operario.repository';
import { Operario, OperarioCreation, OperarioLogin, OperarioAuthResponse } from '../models/operario.model';
import { AuditService } from './audit.service';
import bcrypt from 'bcrypt';

@Service()
export class OperarioService {

    constructor(
        private readonly operarioRepository: OperarioRepository,
        private readonly auditService: AuditService
    ) { }

    /**
     * Login de un operario
     * @param operarioLogin Datos de login (nombre y clave)
     * @returns OperarioAuthResponse con los datos del operario
     */
    async login(operarioLogin: OperarioLogin): Promise<OperarioAuthResponse> {
        if (!this.isValidLogin(operarioLogin)) {
            throw new Error('OperarioLoginValidationError');
        }

        // Buscar operario por nombre
        const operario = await this.operarioRepository.findByNombre(operarioLogin.Nombre_operario);
        if (!operario) {
            throw new Error('InvalidCredentialsError');
        }

        // Verificar contraseña
        const isPasswordValid = await bcrypt.compare(operarioLogin.Clave_operario, operario.Clave_operario);
        if (!isPasswordValid) {
            throw new Error('InvalidCredentialsError');
        }

        // Registrar en auditoría
        await this.auditService.logAction({
            accion_log: 'LOGIN_OPERARIO',
            resultado_log: `Successful login for ${operario.Nombre_operario}`,
            id_operario: operario.Id_operario
        });

        return {
            Id_operario: operario.Id_operario!,
            Nombre_operario: operario.Nombre_operario,
            Rol_operario: operario.Rol_operario
        };
    }

    /**
     * Validar datos de login
     * @param operarioLogin Datos de login
     * @returns Boolean indicando si son válidos
     */
    private isValidLogin(operarioLogin: OperarioLogin): boolean {
        return !!(
            operarioLogin.Nombre_operario &&
            operarioLogin.Clave_operario &&
            typeof operarioLogin.Nombre_operario === 'string' &&
            typeof operarioLogin.Clave_operario === 'string' &&
            operarioLogin.Nombre_operario.trim().length > 0 &&
            operarioLogin.Clave_operario.length > 0
        );
    }
    async getOperarios(): Promise<Omit<Operario, 'Clave_operario'>[]> {
        return await this.operarioRepository.findAll();
    }

    /**
     * Registra un nuevo operario con clave hasheada.
     * @param data Datos del operario.
     */
    async registerOperario(data: OperarioCreation): Promise<Omit<Operario, 'Clave_operario'>> {
        //Verificar si el nombre ya existe
        const existing = await this.operarioRepository.findByNombre(data.Nombre_operario);
        if (existing) {
            throw new Error('OperarioAlreadyExists');
        }

        //Hashear la clave
        const saltRounds = 10;
        const hashedClave = await bcrypt.hash(data.Clave_operario, saltRounds);

        //Guardar en BD
        const id = await this.operarioRepository.create({
            ...data,
            Clave_operario: hashedClave
        });

        //Retornar el operario creado (sin clave)
        const newOperario = await this.operarioRepository.findById(id);
        if (!newOperario) throw new Error('InternalError');

        return newOperario;
    }

    /**
     * Actualiza un operario existente.
     * @param id ID del operario.
     * @param data Datos a actualizar.
     */
    async updateOperario(id: number, data: Partial<Operario>): Promise<Omit<Operario, 'Clave_operario'>> {
        const updateData: Partial<Operario> = { ...data };

        // Si se cambia la clave, hashearla
        if (updateData.Clave_operario) {
            const saltRounds = 10;
            updateData.Clave_operario = await bcrypt.hash(updateData.Clave_operario, saltRounds);
        }

        const updated = await this.operarioRepository.update(id, updateData);
        if (!updated) {
            throw new Error('OperarioNotFound');
        }

        const updatedOperario = await this.operarioRepository.findById(id);
        if (!updatedOperario) throw new Error('InternalError');

        return updatedOperario;
    }

    /**
     * Elimina un operario.
     * @param id ID del operario.
     */
    async deleteOperario(id: number): Promise<void> {
        const deleted = await this.operarioRepository.delete(id);
        if (!deleted) {
            throw new Error('OperarioNotFound');
        }
    }
}
