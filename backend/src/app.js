// Path: backend\src\app.js
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import responseHandler from './middlewares/responseHandler.middleware.js';
import { authLimiter } from './middlewares/rateLimiter.middleware.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

import conversationRoutes from './routes/conversation.routes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();

// Security headers
app.use(helmet());
app.disable('x-powered-by');

// Compression middleware (threshold: 1 KB, sets Vary: Accept-Encoding)
app.use(compression({ threshold: 1 }));

// Parse JSON request bodies with size limit
app.use(express.json({ limit: '10kb' }));

// Response handler for Cache-Control and ETag optimization
app.use(responseHandler);

// Mount Authentication routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Mount Conversation routes
app.use('/api/conversations', conversationRoutes);

// Mount Message routes
app.use('/api/messages', messageRoutes);

// Centralized error handling middleware
app.use(errorHandler);

export default app;

