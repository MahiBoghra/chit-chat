// Path: backend/src/middlewares/rateLimiter.middleware.js
import rateLimit from 'express-rate-limit';

/**
 * Global rate limiter - 100 requests per 15 minutes
 * Applied to all routes except auth signup/login
 */
export const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    message: {
        success: false,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

/**
 * Auth rate limiter - 5 attempts per 15 minutes
 * Applied to signup and login only
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth attempts per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again after 15 minutes.'
    }
});

/**
 * Password reset rate limiter - 3 attempts per hour
 */
export const resetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        errorCode: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many password reset attempts, please try again after an hour.'
    }
});

export default {
    globalLimiter,
    authLimiter,
    resetLimiter
};