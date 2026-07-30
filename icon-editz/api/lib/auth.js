import jwt from 'jsonwebtoken';

/**
 * Verifies the JWT from the Authorization header.
 * Throws a 401 error if the token is missing, invalid, or expired.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {object} The decoded JWT payload.
 */
export const authenticate = (req) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
        throw Object.assign(new Error('Authentication required'), { status: 401 });
    }
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw Object.assign(new Error('Invalid or expired token'), { status: 401 });
    }
};

/**
 * Tries to verify the JWT from the Authorization header.
 * Returns null if the token is missing or invalid, instead of throwing.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {object|null} The decoded JWT payload or null.
 */
export const tryAuthenticate = (req) => {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
        return null;
    }
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
};

/**
 * Authenticates a user and checks if they have the 'admin' role.
 * Throws a 401 or 403 error if authentication or authorization fails.
 * @param {import('http').IncomingMessage} req The request object.
 * @returns {object} The decoded JWT payload of the admin user.
 */
export const authorizeAdmin = (req) => {
    const user = authenticate(req);
    if (user.role !== 'admin') {
        throw Object.assign(new Error('Admin access required'), { status: 403 });
    }
    return user;
};

/**
 * Issues a new JWT for a given user object.
 * @param {object} user The user object from Supabase.
 * @returns {string} The signed JWT.
 */
export const issueToken = (user) => {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.app_metadata?.role || user.user_metadata?.role || 'customer'
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
};
