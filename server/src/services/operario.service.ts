import { Service } from 'typedi';
import { OperarioRepository } from '../repositories/operario.repository';
import { Operario, OperarioCreation, OperarioLogin, OperarioAuthResponse, OperarioTokenPayload } from '../models/operario.model';
import { AuditService } from './audit.service';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PaginationResult, getQueryString, parsePageLimit } from '../utils/pagination';
import { OperarioFilters } from '../repositories/operario.repository';

@Service()
export class OperarioService {

    constructor(
        private readonly operarioRepository: OperarioRepository,
        private readonly auditService: AuditService
    ) { }

    /**
     * Login de un operario
     * @param operarioLogin Datos de login (nombre y clave)
     * @returns OperarioAuthResponse con JWT
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

        // Generar JWT token
        const token = this.generateToken(operario);
        const expiresInDays = Number(process.env.OPERARIO_SESSION_DAYS) || 7;
        const expiresIn = expiresInDays * 24 * 60 * 60; // Convert days to seconds

        // Registrar en auditoría
        await this.auditService.logAction({
            accion_log: 'LOGIN_OPERARIO',
            resultado_log: `Successful login for ${operario.Nombre_operario}`,
            id_operario: operario.Id_operario
        });

        return {
            token,
            Id_operario: operario.Id_operario!,
            Nombre_operario: operario.Nombre_operario,
            Rol_operario: operario.Rol_operario,
            expiresIn
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

    async getOperariosPaginated(query: any): Promise<PaginationResult<Omit<Operario, 'Clave_operario'>>> {
        const { page, limit } = parsePageLimit(query);

        const filters: OperarioFilters = {
            filtro: getQueryString(query, 'filtro'),
            nombre_operario: getQueryString(query, 'nombre_operario'),
            rol_operario: getQueryString(query, 'rol_operario')
        };

        const { data, totalItems } = await this.operarioRepository.findPaginated(filters, page, limit);
        const totalPages = limit > 0 ? Math.ceil(totalItems / limit) : 0;

        return { data, totalItems, totalPages, currentPage: page };
    }

    /**
     * Registra un nuevo operario con clave hasheada.
     * @param data Datos del operario.
     * @param requestingOperario Operario que realiza la acción
     */
    async registerOperario(data: OperarioCreation, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<Omit<Operario, 'Clave_operario'>> {
        // Validar permisos: Solo Admin puede registrar operarios
        if (requestingOperario.Rol_operario !== 'Admin') {
            throw new Error('UnauthorizedAccessError');
        }

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
     * @param requestingOperario Operario que realiza la acción
     */
    async updateOperario(id: number, data: Partial<Operario>, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<Omit<Operario, 'Clave_operario'>> {
        // Validar permisos: Solo Admin puede actualizar operarios
        if (requestingOperario.Rol_operario !== 'Admin') {
            throw new Error('UnauthorizedAccessError');
        }

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
     * Genera un JWT token para un operario
     * @param operario Operario a codificar en el token
     * @returns JWT token
     */
    private generateToken(operario: Operario): string {
        const payload: OperarioTokenPayload = {
            Id_operario: operario.Id_operario!,
            Nombre_operario: operario.Nombre_operario,
            Rol_operario: operario.Rol_operario
        };

        const secret: string = process.env.OPERARIO_JWT_SECRET || 'operario_secret_key_default';
        const expirationValue = process.env.OPERARIO_JWT_EXPIRATION || '7d';
        
        const options: jwt.SignOptions = {
            expiresIn: expirationValue as any
        };

        return jwt.sign(payload, secret, options);
    }

    /**
     * Verifica un JWT token
     * @param token Token a verificar
     * @returns Payload del token o null si es inválido
     */
    verifyToken(token: string): OperarioTokenPayload | null {
        try {
            const secret: string = process.env.OPERARIO_JWT_SECRET || 'operario_secret_key_default';
            const decoded = jwt.verify(token, secret) as OperarioTokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Elimina un operario.
     * @param id ID del operario.
     * @param requestingOperario Operario que realiza la acción
     */
    async deleteOperario(id: number, requestingOperario: { Id_operario: number, Rol_operario: string }): Promise<void> {
        // Validar permisos: Solo Admin puede eliminar operarios
        if (requestingOperario.Rol_operario !== 'Admin') {
            throw new Error('UnauthorizedAccessError');
        }

        const deleted = await this.operarioRepository.delete(id);
        if (!deleted) {
            throw new Error('OperarioNotFound');
        }
    }
}
