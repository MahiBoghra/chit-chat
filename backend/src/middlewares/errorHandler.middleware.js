// Path: backend/src/middlewares/errorHandler.middleware.js
import crypto from 'crypto';
import ApiError from '../utils/ApiError.js';

/**
 * Centralized Express Error Handling Middleware
 * Provides consistent error response format with machine-readable codes
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Generate request ID for tracing
    const requestId = req.headers['x-request-id'] || crypto.randomBytes(8).toString('hex');
    req.requestId = requestId;

    // Handle Postgres duplicate key error (e.g. duplicate email registration)
    if (err.code === '23505') {
        error = new ApiError(409, 'Email or username already exists.');
    }

    // Map JsonWebTokenError and TokenExpiredError to 401
    if (err instanceof JsonWebTokenError) {
        error = new ApiError(401, 'Invalid token.');
    }
    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired.');
    }

    // If it's not already an ApiError, wrap it as a generic 500 error
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, [], err.stack);
    }

    // Map ApiError codes to machine-readable error codes
    const errorCodeMap = {
        'VALIDATION_FAILED': 'VALIDATION_FAILED',
        'AUTH_TOKEN_EXPIRED': 'AUTH_TOKEN_EXPIRED',
        'AUTH_TOKEN_INVALID': 'AUTH_TOKEN_INVALID',
        'AUTH_REFRESH_INVALID': 'AUTH_REFRESH_INVALID',
        'AUTH_REFRESH_EXPIRED': 'AUTH_REFRESH_EXPIRED',
        'USER_NOT_FOUND': 'USER_NOT_FOUND',
        'USER_UNAUTHORIZED': 'USER_UNAUTHORIZED',
        'CONVERSATION_NOT_FOUND': 'CONVERSATION_NOT_FOUND',
        'MESSAGE_NOT_FOUND': 'MESSAGE_NOT_FOUND',
        'FORBIDDEN': 'FORBIDDEN',
        'NOT_FOUND': 'NOT_FOUND',
        'RATE_LIMIT_EXCEEDED': 'RATE_LIMIT_EXCEEDED',
    };

    // Response structure with consistent envelope
    const responsePayload = {
        requestId,
        success: error.success !== undefined ? error.success : false,
        statusCode: error.statusCode,
        message: error.message,
        errorCode: error.errorCode || errorCodeMap[error.constructor.name] || 'INTERNAL_ERROR',
        errors: error.errors || []
    };

    // Print stack trace if in development mode (never in production)
    if (process.env.NODE_ENV !== 'production') {
        responsePayload.stack = error.stack;
    }

    // If it is a 500 error, log the stack trace to the console
    if (error.statusCode === 500) {
        console.error('Unhandled Server Error:', {
            requestId,
            error: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method
        });
    }

    // Set X-Request-Id header for client tracing
    res.set('X-Request-Id', requestId);

    // Content-Type negotiation - only return JSON for Accept: application/json
    if (req.accepts('json')) {
        res.status(error.statusCode).json(responsePayload);
    } else {
        res.status(error.statusCode).type('json').json(responsePayload);
    }
};

export default errorHandler;