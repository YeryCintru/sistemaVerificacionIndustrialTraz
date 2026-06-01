export interface PaginationResult<T> {
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

/**
 * Cogemos un solo valor de la query
 * @param query - Query object containing the value
 * @param key - Key of the value to get
 * @returns 
 */
function getSingleQueryValue(query: any, key: string): unknown {
    const value = query?.[key];
    if (Array.isArray(value)) return value[0];
    return value;
}

export function getQueryString(query: any, key: string): string | undefined {
    const value = getSingleQueryValue(query, key);
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Coge un solo valor de la query y lo convierte a número
 * @param query - Query object containing the value
 * @param key - Key of the value to get
 * @returns 
 */
export function getQueryNumber(query: any, key: string): number | undefined {
    const value = getSingleQueryValue(query, key);
    if (value === undefined || value === null) return undefined;
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
}

/**
 * Parses page and limit parameters from query object
 * @param query - Query object containing page and limit parameters
 * @param defaultPage 
 * @param defaultLimit 
 * @returns 
 */
export function parsePageLimit(query: any, defaultPage = 1, defaultLimit = 20): { page: number; limit: number } {
    const rawPage = getQueryNumber(query, 'page');
    const rawLimit = getQueryNumber(query, 'limit');

    const page = rawPage !== undefined ? rawPage : defaultPage;
    const limit = rawLimit !== undefined ? rawLimit : defaultLimit;

    // Topes razonables para evitar consultas enormes (máximo 100 items por página)
    const safePage = Math.max(1, Math.trunc(page));
    const safeLimit = Math.min(100, Math.max(1, Math.trunc(limit)));

    return { page: safePage, limit: safeLimit };
}

