import { verifyToken } from '../utils/verifyAndSignupToken.js';

export const authenticate = (req, res, next) => {
    const bearerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;
    const token = req.cookies?.authToken || bearerToken;
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    try {
        const payload = verifyToken(token);
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
