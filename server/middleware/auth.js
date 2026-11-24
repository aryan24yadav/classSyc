import { verifyToken } from '../utils/jwt.js';
import { getBearerToken } from '../utils/http.js';

export const protect = (req, res, next) => {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Not authorized, no token provided',
        });
    }

    try {
        const decoded = verifyToken(token);
        req.user = { userId: decoded.userId };
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
        });
    }
};
