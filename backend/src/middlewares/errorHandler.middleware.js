// Path: backend\src\middlewares\errorHandler.middleware.js
import ApiError from '../utils/ApiError.js';

/**
 * Centralized Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = err;

    // Handle Postgres duplicate key error (e.g. duplicate email registration)
    if (err.code === '23505') {
        error = new ApiError(409, 'Email or username already exists.');
    }

    // If it's not already an ApiError, wrap it as a generic 500 error
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Internal Server Error';
        error = new ApiError(statusCode, message, [], err.stack);
    }

    // Response structure
    const responsePayload = {
        success: false,
        statusCode: error.statusCode,
        message: error.message,
        errors: error.errors
    };

    // Print stack trace if in development mode
    if (process.env.NODE_ENV === 'development') {
        responsePayload.stack = error.stack;
    }

    // If it is a 500 error, log the stack trace to the console
    if (error.statusCode === 500) {
        console.error('Unhandled Server Error:', err);
    }

    res.status(error.statusCode).json(responsePayload);
};

export default errorHandler;
