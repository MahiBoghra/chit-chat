// Path: backend/src/middlewares/responseHandler.middleware.js
/**
 * Response handler middleware for Cache-Control and ETag optimization.
 * Sets appropriate caching headers based on response type.
 * Should be placed after route handlers but before error handler.
 */
const responseHandler = (req, res, next) => {
    // Original json method override to add Cache-Control
    const originalJson = res.json;

    res.json = (body) => {
        // Set Cache-Control based on response content
        if (body && body.success !== undefined) {
            // Authentication responses: no-store
            if (body.errorCode) {
                // Error responses - short cache for error codes
                res.set('Cache-Control', 'no-store');
            } else if (body.success && body.data) {
                // User-specific data - private, no-cache, revalidate via ETag
                res.set('Cache-Control', 'private, no-cache');
                // Set ETag based on data hash (simplified - in production use proper entity tag)
                // Express will add weak ETag automatically if not set
            }
        }
        // Call original json
        return originalJson.call(this, body);
    };

    next();
};

export default responseHandler;