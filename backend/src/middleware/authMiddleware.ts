import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { userId: string; email: string };
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        if (token.startsWith('dev-token-')) {
            // Development bypass
            (req as AuthRequest).user = { userId: '507f1f77bcf86cd799439011', email: 'dev@test.com' };
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string };
        (req as AuthRequest).user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
