import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Lightweight auth middleware for Backend 1 (AI API).
 * Verifies the JWT token from the Authorization header to ensure
 * only authenticated users can consume AI endpoints.
 * 
 * Accepts: Bearer <token> in Authorization header
 * Falls through if valid, returns 401 if not.
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token required' });
        }

        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error('CRITICAL: JWT_SECRET is not set in environment variables');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.id;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired, please log in again' });
        }
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export default verifyToken;
