// Path: backend/src/utils/jwt.js
import jwt from 'jsonwebtoken';
import ApiError from './ApiError.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
}

class JwtService {

    signAccessToken(userId, userEmail) {
        return jwt.sign(
            { sub: userId, email: userEmail },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    signRefreshToken(userId, familyId, userAgent, ip) {
        const payload = {
            sub: userId,
            familyId,
            userAgent,
            ip,
            createdAt: new Date().toISOString()
        };
        return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    }

    verifyAccessToken(token) {
        return jwt.verify(token, JWT_SECRET);
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, JWT_SECRET);
    }
}

const jwtService = new JwtService();

export default jwtService;
export { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN };