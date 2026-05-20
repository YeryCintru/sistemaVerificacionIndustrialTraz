import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user property
declare global {
    namespace Express {
        interface Request {
            operario?: any;
        }
    }
}

/**
 * Authentication middleware that verifies JWT tokens for operarios
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({ error: 'No authorization token provided' });
            return;
        }

        // Expected format: "Bearer TOKEN"
        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({ error: 'Invalid authorization format. Expected: Bearer TOKEN' });
            return;
        }

        const token = parts[1];
        const secret: string = process.env.OPERARIO_JWT_SECRET || 'operario_secret_key_default';

        // Verify token
        const decoded = jwt.verify(token, secret);
        console.log('Decoded token:', decoded);

        // Attach operario info to request
        req.operario = decoded;

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
        } else if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
