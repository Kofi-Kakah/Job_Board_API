import bcrypt from 'bcrypt';
import User from '../../models/user.model.js';
import { signToken } from '../utils/verifyAndSignupToken.js';

const authCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
};

export const signup = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const suppliedName = typeof req.body.name === 'string' ? req.body.name.trim() : '';
        const username = typeof req.body.username === 'string'
            ? req.body.username.trim()
            : suppliedName;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'name (or username), email, and password are required.' });
        }
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Email and password must be strings.' });
        }
        if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
        if (role && !['candidate', 'employer'].includes(role)) {
            return res.status(400).json({ message: 'Role must be candidate or employer.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const duplicate = await User.findOne({ $or: [{ email: normalizedEmail }, { username: username.trim() }] });
        if (duplicate) return res.status(409).json({ message: 'Email or username is already registered.' });

        const user = new User({
            username,
            email: normalizedEmail,
            password: await bcrypt.hash(password, 12),
            role: role || 'candidate',
            ...(suppliedName && {
                firstName: suppliedName.split(/\s+/)[0],
                lastName: suppliedName.split(/\s+/).slice(1).join(' '),
            }),
        });
        const token = signToken(user);
        await user.save();
        res.cookie('authToken', token, authCookieOptions);
        return res.status(201).json({
            message: 'Account created.',
            user: { id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: 'Email or username is already registered.' });
        return res.status(500).json({ message: 'Could not create account.', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (!user.isActive) return res.status(403).json({ message: 'This account is disabled.' });
        const token = signToken(user);
        res.cookie('authToken', token, authCookieOptions);
        return res.status(200).json({
            message: 'Login successful.',
            user: { id: user._id, username: user.username, email: user.email, role: user.role },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not log in.', error: error.message });
    }
};

export const logout = (_req, res) => {
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
    return res.status(200).json({ message: 'Logged out.' });
};
