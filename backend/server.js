// Path: backend/server.js
import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server } from 'socket.io';
import compression from 'compression';
import helmet from 'helmet';

const PORT = process.env.PORT || 2000;

import app from './src/app.js';

// Trust proxy for rate limiting and proper IP detection
app.set('trust proxy', 1);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Chit-chat API is running',
        version: '2.0.0'
    });
});

// 404 handler for API routes
app.use('/api/', (req, res) => {
    res.status(404).json({
        success: false,
        errorCode: 'NOT_FOUND',
        message: 'API endpoint not found'
    });
});

// Create HTTP server (Socket.IO removed - using standard HTTP)
const server = http.createServer(app);

// Set up graceful shutdown
const shutdown = async () => {
    console.log(' shutting down...');

    // Close the HTTP server
    server.close(() => {
        console.log('HTTP server closed');
    });

    // Handle process exit
    setTimeout(() => {
        process.exit(1);
    }, 5000);
};

// Handle SIGTERM (docker kill, systemd stop)
process.on('SIGTERM', shutdown);

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', shutdown);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API base: http://localhost:${PORT}/api/`);
});

// Export for testing (ESM)
export { app, server };