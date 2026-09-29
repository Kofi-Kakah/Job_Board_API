import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
    return process.env.JWT_SECRET;
};

// Signs the JWT returned after signup or login.
export const signToken = user => jwt.sign(
    { sub: user._id.toString(), role: user.role },
    getJwtSecret(),
    { expiresIn: '7d' },
);

// Verifies an incoming JWT and returns its decoded payload.
export const verifyToken = token => jwt.verify(token, getJwtSecret());
